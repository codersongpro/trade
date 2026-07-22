// ============================================================
// 순수 게임 로직 (DOM, Firebase 무관)
// ============================================================

// 금액 표시: 1,234,000원 → "123만 4,000원" 스타일은 과하므로 콤마 표기
export function fmtMoney(n) {
  return `${Math.round(n).toLocaleString('ko-KR')}원`;
}

// ---------- 게임 경제 상수 ----------
// 국가별 '필요 물자'는 총자산 계산 시 웃돈을 쳐준다 → 서로 다른 걸 원하니 무역이 일어난다
export const NEED_PREMIUM = 1.3;
// 가공품·완제품을 세계시장에 팔 때 붙는 웃돈 → 가공할 이유가 생긴다 (원자재는 웃돈 없음)
export const EXPORT_PREMIUM = { mid: 1.15, final: 1.3 };

// ---------- 세계 무역시장 ----------
// 아무 때나 즉시 사고팔 수 있는 시장. 한 자원을 계속 사면 값이 오르고, 계속 팔면
// 값이 내려가서 — 시세가 한쪽으로 쏠리지 않게 기준가의 0.5~2배 안에서만 움직인다.
// 이렇게 하면 "세계시장이 항상 더 유리"해지는 일이 없어서, 다른 국가와 직접
// 협상할 이유가 계속 남는다. 이 가격은 basePrice(총자산·이벤트 기준가)와는 별도로 움직인다.
const MARKET_DRIFT_PER_UNIT = 0.012; // 1개 거래될 때마다 시세가 1.2%씩 움직인다
const MARKET_MIN_MULT = 0.5;
const MARKET_MAX_MULT = 2;

// net: 지금까지 이 방에서 이 자원을 세계시장에서 (산 개수 - 판 개수)
function marketMultiplier(net) {
  return Math.max(MARKET_MIN_MULT, Math.min(MARKET_MAX_MULT, 1 + (net || 0) * MARKET_DRIFT_PER_UNIT));
}

// 세계시장에서 살 때 개당 가격 (모든 등급 동일 규칙)
export function marketBuyPrice(resources, market, resId) {
  const r = resources[resId];
  if (!r) return 0;
  const net = market?.[resId]?.net || 0;
  return Math.max(1, Math.round(r.basePrice * marketMultiplier(net)));
}

// 세계시장에 팔 때 개당 가격 — 가공품·완제품은 웃돈이 붙는다
export function marketSellPrice(resources, market, resId) {
  const r = resources[resId];
  if (!r) return 0;
  const net = market?.[resId]?.net || 0;
  const premium = EXPORT_PREMIUM[r.tier] || 1;
  return Math.max(1, Math.round(r.basePrice * marketMultiplier(net) * premium));
}

// ---------- 세계 은행 ----------
export const LOAN_INTEREST = 0.1; // 빌린 금액의 10%를 이자로 더 갚는다
export function loanCap(startingMoney) { return Math.round(startingMoney || 500000); } // 최대 대출 잔액

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
  const needs = new Set(nation.needs || []);
  for (const [resId, qty] of Object.entries(nation.stock || {})) {
    const r = resources[resId];
    if (!r) continue;
    const mult = needs.has(resId) ? NEED_PREMIUM : 1; // 우리가 원하는 물자는 더 값지게 친다
    total += r.basePrice * qty * mult;
  }
  total -= nation.debt || 0; // 세계 은행에 진 빚은 자산에서 뺀다
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
  const rword = room.meta?.mode === 'city'
    ? (room.meta.scale === 'province' ? '시·도' : room.meta.scale === 'chungbuk' ? '시·군' : '지역')
    : '국가';

  const nName = (id) => {
    const n = nations[id];
    return n ? `${n.emoji} ${n.name}` : id;
  };
  const rName = (id) => {
    const r = resources[id];
    return r ? `${r.emoji} ${r.name}` : id;
  };

  // ① 세계 은행 대출·상환 — 이번 턴에 빌린 돈으로 거래·구매도 할 수 있게 가장 먼저 처리
  const loanStatus = {};
  const startingMoney = room.meta?.startingMoney || 500000;
  const loanQueue = Object.entries(room.loans || {})
    .filter(([, l]) => l.status === 'queued')
    .sort(([, a], [, b]) => (a.queuedAt || 0) - (b.queuedAt || 0));
  for (const [lid, l] of loanQueue) {
    const nation = nations[l.nation];
    if (!nation) { loanStatus[lid] = { status: 'failed', failReason: '정보를 찾을 수 없음' }; continue; }
    const result = l.kind === 'repay'
      ? repayBank(nation, l.amount)
      : borrowFromBank(nation, l.amount, startingMoney, room.meta?.mode);
    if (!result.ok) {
      loanStatus[lid] = { status: 'failed', failReason: result.reason };
      logs.push(`🏦❌ ${l.kind === 'repay' ? '상환' : '대출'} 실패: ${nName(l.nation)} — ${result.reason}`);
      continue;
    }
    nations[l.nation] = { ...nation, money: result.nation.money, debt: result.nation.debt };
    loanStatus[lid] = { status: 'done' };
    logs.push(result.log);
  }

  // ② 합의된 거래 체결
  const accepted = Object.entries(room.trades || {})
    .filter(([, t]) => t.status === 'accepted')
    .sort(([, a], [, b]) => (a.acceptedAt || 0) - (b.acceptedAt || 0)); // 먼저 합의된 순서로
  for (const [tid, t] of accepted) {
    const seller = nations[t.from];
    const buyer = nations[t.to];
    if (!seller || !buyer) {
      tradeStatus[tid] = { status: 'failed', failReason: `${rword} 정보를 찾을 수 없음` };
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

  // ③ 특산품 자동 생산
  for (const n of Object.values(nations)) {
    if (Object.keys(n.members || {}).length === 0) continue; // 참가자 없는 나라는 생산 안 함
    n.stock = n.stock || {};
    for (const [resId, qty] of Object.entries(n.production || {})) {
      n.stock[resId] = (n.stock[resId] || 0) + qty;
    }
  }

  // ④ 세계시장 구매 — 제작 전에 처리해서, 이번 턴에 산 재료로 바로 제작할 수 있게 한다
  const marketStatus = {};
  let market = { ...(room.market || {}) };
  const marketQueue = Object.entries(room.market_orders || {})
    .filter(([, x]) => x.status === 'queued' && x.kind === 'buy')
    .sort(([, a], [, b]) => (a.queuedAt || 0) - (b.queuedAt || 0));
  for (const [xid, x] of marketQueue) {
    const nation = nations[x.nation];
    if (!nation) { marketStatus[xid] = { status: 'failed', failReason: '정보를 찾을 수 없음' }; continue; }
    const result = tradeWithMarket({ resources, market, nations }, x.nation, x.resId, x.qty, 'buy');
    if (!result.ok) {
      marketStatus[xid] = { status: 'failed', failReason: result.reason };
      logs.push(`🛒❌ 구매 실패: ${nName(x.nation)} ${rName(x.resId)} ${x.qty}개 — ${result.reason}`);
      continue;
    }
    nations[x.nation] = { ...nation, money: result.nation.money, stock: result.nation.stock };
    market = result.market;
    marketStatus[xid] = { status: 'done' };
    logs.push(result.log);
  }

  // ⑤ 제작(가공) 실행 — 이번 턴에 사온 재료와 방금 생산분 사용 가능
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

  // ⑥ 세계시장 판매 — 제작 뒤라서 이번 턴에 막 만든 완제품도 바로 팔 수 있다
  const sellQueue = Object.entries(room.market_orders || {})
    .filter(([, x]) => x.status === 'queued' && x.kind === 'sell')
    .sort(([, a], [, b]) => (a.queuedAt || 0) - (b.queuedAt || 0));
  for (const [xid, x] of sellQueue) {
    const nation = nations[x.nation];
    if (!nation) { marketStatus[xid] = { status: 'failed', failReason: '정보를 찾을 수 없음' }; continue; }
    const result = tradeWithMarket({ resources, market, nations }, x.nation, x.resId, x.qty, 'sell');
    if (!result.ok) {
      marketStatus[xid] = { status: 'failed', failReason: result.reason };
      logs.push(`💰❌ 판매 실패: ${nName(x.nation)} ${rName(x.resId)} ${x.qty}개 — ${result.reason}`);
      continue;
    }
    nations[x.nation] = { ...nation, money: result.nation.money, stock: result.nation.stock };
    market = result.market;
    marketStatus[xid] = { status: 'done' };
    logs.push(result.log);
  }

  logs.push(`🏭 ${turn}턴 종료 — 모든 ${rword}가 특산품을 생산했습니다.`);
  return { nations, tradeStatus, craftStatus, marketStatus, market, loanStatus, logs };
}

// ---------- 세계 무역시장 거래 ----------
// 턴 진행 때 처리된다 (queue → processTurn). room에는 { resources, market, nations }만 있으면 된다.
// 반환: { ok: true, nation, market, log } 또는 { ok: false, reason }
export function tradeWithMarket(room, nationId, resId, qty, kind) {
  const nation = room.nations?.[nationId];
  const r = room.resources?.[resId];
  if (!nation || !r || !Number.isInteger(qty) || qty <= 0) return { ok: false, reason: '잘못된 요청' };
  const mktWord = room.meta?.mode === 'city' ? '거래소' : '세계시장';

  const market = { ...(room.market || {}) };
  const net = market[resId]?.net || 0;

  if (kind === 'buy') {
    const price = marketBuyPrice(room.resources, room.market, resId);
    const cost = price * qty;
    if ((nation.money || 0) < cost) return { ok: false, reason: `자금이 부족해요 (필요 ${fmtMoney(cost)})` };
    const stock = { ...(nation.stock || {}) };
    stock[resId] = (stock[resId] || 0) + qty;
    return {
      ok: true,
      nation: { ...nation, money: (nation.money || 0) - cost, stock },
      market: { ...market, [resId]: { net: net + qty } },
      log: `🛒 ${mktWord} 구매: ${nation.emoji} ${nation.name} ${r.emoji}${r.name} ${qty}개 (개당 ${fmtMoney(price)})`,
    };
  }
  if (kind === 'sell') {
    const have = nation.stock?.[resId] || 0;
    if (have < qty) return { ok: false, reason: `보유량이 부족해요 (보유 ${have})` };
    const price = marketSellPrice(room.resources, room.market, resId);
    const gain = price * qty;
    const stock = { ...(nation.stock || {}) };
    stock[resId] = have - qty;
    return {
      ok: true,
      nation: { ...nation, money: (nation.money || 0) + gain, stock },
      market: { ...market, [resId]: { net: net - qty } },
      log: `💰 ${mktWord} 판매: ${nation.emoji} ${nation.name} ${r.emoji}${r.name} ${qty}개 → ${fmtMoney(gain)}`,
    };
  }
  return { ok: false, reason: '알 수 없는 거래 종류' };
}

// ---------- 세계 은행 ----------
// 반환: { ok: true, nation, log } 또는 { ok: false, reason }
export function borrowFromBank(nation, amount, startingMoney, mode) {
  if (!Number.isInteger(amount) || amount <= 0) return { ok: false, reason: '잘못된 금액' };
  const debt = nation.debt || 0;
  const owed = Math.round(amount * (1 + LOAN_INTEREST));
  if (debt + owed > loanCap(startingMoney)) {
    return { ok: false, reason: `대출 한도를 넘어요 (한도 ${fmtMoney(loanCap(startingMoney))}, 현재 빚 ${fmtMoney(debt)})` };
  }
  const bankWord = mode === 'city' ? '한국은행' : '세계 은행';
  return {
    ok: true,
    nation: { ...nation, money: (nation.money || 0) + amount, debt: debt + owed },
    log: `🏦 ${bankWord} 대출: ${nation.emoji} ${nation.name} ${fmtMoney(amount)} 빌림 (이자 포함 ${fmtMoney(owed)} 상환 예정)`,
  };
}

export function repayBank(nation, amount) {
  const debt = nation.debt || 0;
  const money = nation.money || 0;
  if (!Number.isInteger(amount) || amount <= 0) return { ok: false, reason: '잘못된 금액' };
  if (debt <= 0) return { ok: false, reason: '갚을 빚이 없어요' };
  const pay = Math.min(amount, debt, money);
  if (pay <= 0) return { ok: false, reason: '가진 돈이 없어요' };
  return {
    ok: true,
    nation: { ...nation, money: money - pay, debt: debt - pay },
    log: `🏦 대출 상환: ${nation.emoji} ${nation.name} ${fmtMoney(pay)} 갚음 (남은 빚 ${fmtMoney(debt - pay)})`,
  };
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
  // 세계시장 구매는 제작보다 먼저 처리되니 미리 더해 두고, 판매는 나중에 처리되니 빼지 않는다
  for (const x of Object.values(room.market_orders || {})) {
    if (x.status !== 'queued' || x.nation !== nationId || x.kind !== 'buy') continue;
    add(x.resId, x.qty);
  }
  for (const c of Object.values(room.crafts || {})) {
    if (c.status !== 'queued' || c.nation !== nationId) continue;
    const rec = room.recipes?.[c.recipeId];
    if (!rec) continue;
    for (const [id, q] of Object.entries(rec.inputs)) add(id, -q * (c.times || 1));
  }
  // 판매 예약은 제작 뒤에 처리되므로, 지금 남는 걸로만 팔 수 있게 미리 뺀다
  for (const x of Object.values(room.market_orders || {})) {
    if (x.status !== 'queued' || x.nation !== nationId || x.kind !== 'sell') continue;
    add(x.resId, -x.qty);
  }
  return p;
}

// ---------- 지금 새로 팔 수 있는 양 ----------
// 현재 재고에서, 이미 예약해 둔 제작 재료·거래 제안·세계시장 판매만큼을 미리 뺀 값.
// 모둠원 여러 명이 동시에 같은 자원을 이중으로 팔거나 쓰기로 약속하지 못하게 막는다
// (한 명이 벌써 제안한 만큼은 다른 모둠원 화면에도 실시간으로 반영돼 "팔 수 있는" 목록에서 빠진다).
export function availableStock(room, nationId) {
  const n = room.nations?.[nationId];
  const avail = { ...(n?.stock || {}) };
  const sub = (id, q) => { avail[id] = (avail[id] || 0) - q; };

  for (const c of Object.values(room.crafts || {})) {
    if (c.status !== 'queued' || c.nation !== nationId) continue;
    const rec = room.recipes?.[c.recipeId];
    if (!rec) continue;
    for (const [id, q] of Object.entries(rec.inputs)) sub(id, q * (c.times || 1));
  }
  for (const t of Object.values(room.trades || {})) {
    if (t.from !== nationId || !['draft', 'proposed', 'accepted'].includes(t.status)) continue;
    sub(t.resId, t.qty);
  }
  for (const x of Object.values(room.market_orders || {})) {
    if (x.status !== 'queued' || x.nation !== nationId || x.kind !== 'sell') continue;
    sub(x.resId, x.qty);
  }
  return avail;
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
