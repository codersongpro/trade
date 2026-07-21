// ============================================================
// 순수 게임 로직 (DOM, Firebase 무관)
// ============================================================

// 금액 표시: 1,234,000원 → "123만 4,000원" 스타일은 과하므로 콤마 표기
export function fmtMoney(n) {
  return `${Math.round(n).toLocaleString('ko-KR')}원`;
}

// ---------- 모둠 투표 ----------

export function majorityNeeded(memberCount) {
  return Math.floor(memberCount / 2) + 1;
}

// votes: { playerId: true(찬성) | false(반대) }
// 반환: 'pass' | 'fail' | 'pending'
export function voteResult(votes, memberCount) {
  const v = Object.values(votes || {});
  const yes = v.filter((x) => x === true).length;
  const no = v.filter((x) => x === false).length;
  const need = majorityNeeded(memberCount);
  if (yes >= need) return 'pass';
  if (no >= need || memberCount - no < need) return 'fail'; // 남은 표를 다 모아도 과반 불가
  return 'pending';
}

// ---------- 자산 계산 ----------

export function calcAssets(nation, resources) {
  let total = nation.money || 0;
  for (const [resId, qty] of Object.entries(nation.stock || {})) {
    const r = resources[resId];
    if (r) total += r.basePrice * qty;
  }
  return total;
}

export function leaderboard(nations, resources) {
  return Object.entries(nations)
    .filter(([, n]) => Object.keys(n.members || {}).length > 0)
    .map(([id, n]) => ({ id, name: n.name, emoji: n.emoji, assets: calcAssets(n, resources), money: n.money || 0 }))
    .sort((a, b) => b.assets - a.assets);
}

// ---------- 이벤트 적용 ----------

// 가격 급변 방지: 원래 기준가의 0.1배 ~ 10배로 제한
export function applyEventChanges(resources, changes) {
  const applied = {}; // resId → { before, after }
  for (const [resId, mult] of Object.entries(changes)) {
    const r = resources[resId];
    if (!r) continue; // 난이도상 방에 없는 자원은 무시
    const original = r.originalPrice ?? r.basePrice;
    const before = r.basePrice;
    let after = Math.round(before * mult);
    after = Math.max(Math.round(original * 0.1), Math.min(Math.round(original * 10), after));
    after = Math.max(100, Math.round(after / 100) * 100); // 100원 단위 정리
    applied[resId] = { before, after };
  }
  return applied;
}

// ---------- 턴 진행 ----------
// room: { meta, resources, recipes, nations, trades, crafts }
// 반환: { nations, tradeStatus: {tid: {status, failReason?}}, craftStatus: {cid: ...}, logs: [text] }
export function processTurn(room) {
  const resources = room.resources || {};
  const recipes = room.recipes || {};
  const nations = JSON.parse(JSON.stringify(room.nations || {}));
  const logs = [];
  const tradeStatus = {};
  const craftStatus = {};
  const turn = room.meta?.turn ?? 1;

  const nName = (id) => {
    const n = nations[id];
    return n ? `${n.emoji} ${n.name}` : id;
  };
  const rName = (id) => {
    const r = resources[id];
    return r ? `${r.emoji} ${r.name}` : id;
  };

  // ① 합의된 거래 체결
  const accepted = Object.entries(room.trades || {})
    .filter(([, t]) => t.status === 'accepted')
    .sort(([, a], [, b]) => (a.acceptedAt || 0) - (b.acceptedAt || 0)); // 먼저 합의된 순서로
  for (const [tid, t] of accepted) {
    const seller = nations[t.from];
    const buyer = nations[t.to];
    if (!seller || !buyer) {
      tradeStatus[tid] = { status: 'failed', failReason: '나라 정보를 찾을 수 없음' };
      continue;
    }
    const stock = seller.stock?.[t.resId] || 0;
    if (stock < t.qty) {
      tradeStatus[tid] = { status: 'failed', failReason: `${nName(t.from)}의 ${rName(t.resId)} 재고 부족 (보유 ${stock})` };
      logs.push(`❌ 거래 불발: ${nName(t.from)} → ${nName(t.to)} ${rName(t.resId)} ${t.qty}개 — 판매국 재고 부족`);
      continue;
    }
    if ((buyer.money || 0) < t.totalPrice) {
      tradeStatus[tid] = { status: 'failed', failReason: `${nName(t.to)}의 자금 부족 (보유 ${fmtMoney(buyer.money || 0)})` };
      logs.push(`❌ 거래 불발: ${nName(t.from)} → ${nName(t.to)} ${rName(t.resId)} ${t.qty}개 — 구매국 자금 부족`);
      continue;
    }
    seller.stock = seller.stock || {};
    buyer.stock = buyer.stock || {};
    seller.stock[t.resId] = stock - t.qty;
    buyer.stock[t.resId] = (buyer.stock[t.resId] || 0) + t.qty;
    seller.money = (seller.money || 0) + t.totalPrice;
    buyer.money = (buyer.money || 0) - t.totalPrice;
    tradeStatus[tid] = { status: 'executed' };
    logs.push(`✅ 거래 성사: ${nName(t.from)} → ${nName(t.to)} ${rName(t.resId)} ${t.qty}개, ${fmtMoney(t.totalPrice)}`);
  }

  // ② 특산품 자동 생산
  for (const n of Object.values(nations)) {
    if (Object.keys(n.members || {}).length === 0) continue; // 참가자 없는 나라는 생산 안 함
    n.stock = n.stock || {};
    for (const [resId, qty] of Object.entries(n.production || {})) {
      n.stock[resId] = (n.stock[resId] || 0) + qty;
    }
  }

  // ③ 제작(가공) 실행 — 이번 턴에 사온 재료와 방금 생산분 사용 가능
  const queued = Object.entries(room.crafts || {})
    .filter(([, c]) => c.status === 'queued')
    .sort(([, a], [, b]) => (a.queuedAt || 0) - (b.queuedAt || 0));
  for (const [cid, c] of queued) {
    const nation = nations[c.nation];
    const recipe = recipes[c.recipeId];
    if (!nation || !recipe) {
      craftStatus[cid] = { status: 'failed', failReason: '레시피 정보를 찾을 수 없음' };
      continue;
    }
    const times = c.times || 1;
    const lacking = Object.entries(recipe.inputs).find(
      ([resId, need]) => (nation.stock?.[resId] || 0) < need * times
    );
    if (lacking) {
      craftStatus[cid] = { status: 'failed', failReason: `재료 부족: ${rName(lacking[0])}` };
      logs.push(`🔧❌ 제작 실패: ${nName(c.nation)} ${rName(recipe.out)} ×${times} — ${rName(lacking[0])} 부족`);
      continue;
    }
    nation.stock = nation.stock || {};
    for (const [resId, need] of Object.entries(recipe.inputs)) {
      nation.stock[resId] -= need * times;
    }
    nation.stock[recipe.out] = (nation.stock[recipe.out] || 0) + recipe.outQty * times;
    craftStatus[cid] = { status: 'done' };
    logs.push(`🔧 제작 완료: ${nName(c.nation)} ${rName(recipe.out)} ×${recipe.outQty * times}`);
  }

  logs.push(`🏭 ${turn}턴 종료 — 모든 나라가 특산품을 생산했습니다.`);
  return { nations, tradeStatus, craftStatus, logs };
}

// ---------- 예상 재고 ----------
// 턴이 진행되면 이 나라가 갖게 될 자원량을 미리 계산한다.
// (현재 재고 + 합의된 거래 + 자동 생산 − 예약된 제작이 쓸 재료)
// 학생이 "이번 턴에 사 올 재료"로 제작을 예약할 수 있게 해준다.
export function projectedStock(room, nationId) {
  const n = room.nations?.[nationId];
  if (!n) return {};
  const p = { ...(n.stock || {}) };
  const add = (id, q) => { p[id] = (p[id] || 0) + q; };

  for (const t of Object.values(room.trades || {})) {
    if (t.status !== 'accepted') continue;
    if (t.to === nationId) add(t.resId, t.qty);
    else if (t.from === nationId) add(t.resId, -t.qty);
  }
  for (const [id, q] of Object.entries(n.production || {})) add(id, q);
  for (const c of Object.values(room.crafts || {})) {
    if (c.status !== 'queued' || c.nation !== nationId) continue;
    const rec = room.recipes?.[c.recipeId];
    if (!rec) continue;
    for (const [id, q] of Object.entries(rec.inputs)) add(id, -q * (c.times || 1));
  }
  return p;
}

// ---------- 변조 감지 ----------
// 나라의 돈과 재고는 오직 「턴 진행」과 「교사 수동 조정」으로만 바뀐다.
// 그때마다 guard에 값을 함께 기록해 두고, 협상 중에 값이 달라졌다면
// 누군가 브라우저 개발자도구로 직접 고친 것이다.
export function makeGuard(nation) {
  return { money: nation.money || 0, stock: { ...(nation.stock || {}) } };
}

// 반환: null(정상) 또는 { money: 차이, resources: [{ id, diff }] }
export function detectTampering(nation) {
  const g = nation.guard;
  if (!g) return null; // 아직 기준값이 없으면 판단 보류
  const issues = { money: (nation.money || 0) - (g.money || 0), resources: [] };
  const ids = new Set([...Object.keys(nation.stock || {}), ...Object.keys(g.stock || {})]);
  for (const id of ids) {
    const diff = (nation.stock?.[id] || 0) - (g.stock?.[id] || 0);
    if (diff !== 0) issues.resources.push({ id, diff });
  }
  return issues.money === 0 && issues.resources.length === 0 ? null : issues;
}

// ---------- 거래 검증 ----------

export function validateTradeInput({ from, to, resId, qty, totalPrice }) {
  if (!from || !to || from === to) return '거래 상대를 선택해 주세요.';
  if (!resId) return '거래할 자원을 선택해 주세요.';
  if (!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty)) return '수량은 1 이상의 정수여야 해요.';
  if (!Number.isFinite(totalPrice) || totalPrice < 0 || !Number.isInteger(totalPrice)) return '금액을 올바르게 입력해 주세요.';
  return null;
}

// 방 코드 생성 (헷갈리는 문자 제외)
export function genRoomCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function genId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
