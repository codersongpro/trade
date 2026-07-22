// ============================================================
// 학생 화면: 입장 → 나라/역할 선택 → 게임 진행
// ============================================================

import {
  initDb, readPath, watch, updatePath, multiUpdate, pushTo, removePath,
  roomExists, getPlayerId, saveSession, loadSession, clearSession,
} from './db.js';
import { ROLES } from './presets.js';
import {
  fmtMoney, calcAssets, leaderboard, majorityNeeded, voteResult,
  validateTradeInput, projectedStock, genId,
} from './game.js';
import {
  esc, resourceCard, statTile, crest, meter, emptyState, podium,
  countUp, toast, fmtShort, regionLabel,
} from './ui.js';

const app = document.getElementById('app');
const tbInfo = document.getElementById('tbInfo');
const leaveBtn = document.getElementById('leaveBtn');

const me = getPlayerId();
let room = null, roomCode = null, myNation = null, unsub = null;
let tab = 'mine';
let seenEvent = null;
let lastHud = {};   // 직전 턴의 현금·자산 (숫자 카운트업 시작점)
let draftForm = { to: '', resId: '', qty: '', price: '', memo: '' };
let codeFromUrl = false;   // QR·링크로 들어와 코드가 이미 채워졌는가

leaveBtn.onclick = () => {
  if (!confirm('게임에서 나갈까요? 다시 코드를 입력하면 돌아올 수 있어요.')) return;
  if (myNation && roomCode) removePath(roomCode, `nations/${myNation}/members/${me}`);
  clearSession();
  location.href = 'index.html';
};

async function boot() {
  const params = new URLSearchParams(location.search);
  const urlCode = (params.get('code') || '').toUpperCase();
  codeFromUrl = urlCode.length === 6;
  const s = loadSession();

  if (s?.code && s?.nationId && (!urlCode || urlCode === s.code)) {
    const member = await readPath(s.code, `nations/${s.nationId}/members/${me}`);
    if (member) { roomCode = s.code; myNation = s.nationId; subscribe(); return; }
    clearSession();
  }
  renderJoin(urlCode);
}

function subscribe() {
  if (unsub) unsub();
  leaveBtn.style.display = '';
  unsub = watch(roomCode, '', (data) => {
    if (!data) { clearSession(); alert('선생님이 방을 닫았어요.'); location.href = 'index.html'; return; }
    room = data;
    if (!room.nations?.[myNation]?.members?.[me]) { clearSession(); location.reload(); return; }
    render();
  });
}

// ============================================================
// 입장 화면
// ============================================================

const join = { code: '', name: '', nationId: '', role: '' };

async function renderJoin(preCode) {
  join.code = preCode || join.code;
  tbInfo.textContent = '입장하기';
  leaveBtn.style.display = 'none';

  if (!join.code || !join.name) return renderJoinStep1();

  const exists = await roomExists(join.code);
  if (!exists) { toast('그런 코드의 방이 없어요. 코드를 다시 확인해 주세요.', 'bad'); join.code = ''; return renderJoinStep1(); }
  renderJoinStep2();
}

function renderJoinStep1() {
  // QR·링크로 들어왔으면 코드는 이미 채워져 있으니 이름만 받는다
  const linked = codeFromUrl && join.code.length === 6;

  app.innerHTML = `<div class="wrap-narrow" style="padding:0">
    <div class="card">
      <h2>🚪 게임에 입장하기</h2>
      ${linked ? `
      <div class="joined-code">
        <span class="tiny muted">입장할 방</span>
        <div class="code-badge mono">${esc(join.code)} <span class="ok-check">✓</span></div>
        <button class="linktext tiny" id="editCode">코드가 다른가요? 직접 입력</button>
      </div>` : `
      <div class="field">
        <label>방 코드 (6자리)</label>
        <input class="code-input" id="jCode" maxlength="6" value="${esc(join.code)}" placeholder="ABC123" autocomplete="off">
      </div>`}
      <div class="field">
        <label>내 이름</label>
        <input id="jName" value="${esc(join.name)}" placeholder="예: 김민준" maxlength="12" autocomplete="off">
        <div class="tiny muted" style="margin-top:4px">모둠원끼리 알아볼 수 있는 이름을 적어주세요.</div>
      </div>
      <button class="lg block" id="jNext">${linked ? '입장하기 →' : '다음 →'}</button>
    </div>
  </div>`;

  const codeEl = document.getElementById('jCode');
  if (codeEl) codeEl.addEventListener('input', () => { codeEl.value = codeEl.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });

  const editBtn = document.getElementById('editCode');
  if (editBtn) editBtn.onclick = () => { codeFromUrl = false; join.code = ''; renderJoinStep1(); };

  const nameEl = document.getElementById('jName');
  if (linked && nameEl) nameEl.focus();

  document.getElementById('jNext').onclick = async () => {
    if (codeEl) join.code = codeEl.value.trim();
    join.name = nameEl.value.trim();
    if (join.code.length !== 6) return toast('6자리 코드를 정확히 입력해 주세요.', 'bad');
    if (!join.name) return toast('이름을 입력해 주세요.', 'bad');
    await renderJoin(join.code);
  };
}

async function renderJoinStep2() {
  const data = await readPath(join.code, '');
  if (!data) return renderJoinStep1();
  const nations = data.nations || {};
  const modeLabel = regionLabel(data.meta);

  app.innerHTML = `<div class="wrap-narrow" style="padding:0">
    <div class="card">
      <div class="card-head">
        <h2>🌍 우리 ${modeLabel}를 고르세요</h2>
        <span class="badge brand">${esc(join.name)}</span>
      </div>
      <p class="small muted">이미 친구가 들어간 ${modeLabel}를 고르면 <b>같은 모둠</b>이 됩니다. 인원 제한은 없어요!</p>
      <div class="grid grid-2" id="nList" style="margin-top:12px"></div>
    </div>
    <div class="card" id="roleCard" style="display:none">
      <h2>🎭 내 역할을 고르세요</h2>
      <p class="small muted">역할은 참고용이에요. 모든 활동은 누구나 할 수 있어요!</p>
      <div class="grid grid-2" style="margin-top:12px">
        ${ROLES.map((r) => `<button class="pick role-pick" data-role="${r.id}">
          <div class="pick-title">${roleFace(r.id, 'lg')} ${r.name}</div>
          <div class="pick-desc">${r.desc}</div></button>`).join('')}
      </div>
      <button class="lg block success" id="doJoin" style="margin-top:14px" disabled>입장하기</button>
    </div>
    <button class="ghost block" id="jBack">← 뒤로</button>
  </div>`;

  const nList = document.getElementById('nList');
  nList.innerHTML = Object.entries(nations).map(([id, n]) => {
    const mem = Object.values(n.members || {});
    const prods = Object.entries(n.production || {})
      .map(([r, q]) => `${data.resources[r]?.emoji || ''} ${esc(data.resources[r]?.name || r)} ${q}`).join(', ');
    return `<button class="pick ${join.nationId === id ? 'selected' : ''}" data-n="${id}">
      <div class="pick-title">${crest({ id, ...n }, { size: 'md' })} ${esc(n.name)}</div>
      <div class="pick-desc">특산품: ${prods}</div>
      <div style="margin-top:7px">${mem.length
        ? mem.map((p) => `<span class="chip tiny" style="margin:2px 3px 0 0">${esc(p.name)}</span>`).join('')
          + '<span class="badge good" style="margin-left:2px">함께하기</span>'
        : '<span class="badge">비어 있음</span>'}</div>
    </button>`;
  }).join('');

  nList.querySelectorAll('[data-n]').forEach((b) => b.onclick = () => {
    join.nationId = b.dataset.n;
    nList.querySelectorAll('.pick').forEach((x) => x.classList.toggle('selected', x.dataset.n === join.nationId));
    document.getElementById('roleCard').style.display = '';
    document.getElementById('roleCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  app.querySelectorAll('[data-role]').forEach((b) => b.onclick = () => {
    join.role = b.dataset.role;
    app.querySelectorAll('[data-role]').forEach((x) => x.classList.toggle('selected', x.dataset.role === join.role));
    document.getElementById('doJoin').disabled = false;
  });

  document.getElementById('doJoin').onclick = async (e) => {
    e.target.disabled = true;
    await updatePath(join.code, `nations/${join.nationId}/members`, {
      [me]: { name: join.name, role: join.role, joinedAt: Date.now() },
    });
    saveSession({ code: join.code, nationId: join.nationId, name: join.name, role: join.role });
    roomCode = join.code; myNation = join.nationId;
    subscribe();
  };
  document.getElementById('jBack').onclick = () => { join.nationId = ''; renderJoinStep1(); };
}

// ============================================================
// 게임 화면
// ============================================================

function myMembers() { return room.nations[myNation].members || {}; }
function teamSize() { return Object.keys(myMembers()).length; }
function needVotes() { return room.meta.teamApproval ? majorityNeeded(teamSize()) : 1; }
function myName() { return myMembers()[me]?.name || '나'; }
function rInfo(id) { return room.resources?.[id] || { name: id, emoji: '', unit: '', basePrice: 0 }; }
function nInfo(id) { return room.nations?.[id] || { name: id, emoji: '' }; }

function render() {
  const n = room.nations[myNation];
  const m = room.meta;
  tbInfo.innerHTML = `<b>${n.emoji} ${esc(n.name)}</b> · ${m.status === 'lobby' ? '시작 대기중' : m.status === 'ended' ? '게임 종료' : `${m.turn}턴`}`;

  if (m.status === 'lobby') return renderWaiting();
  if (m.status === 'ended') return renderResult();
  renderGame();
}

function renderWaiting() {
  const n = room.nations[myNation];
  const mem = Object.values(n.members || {});
  app.innerHTML = `<div class="wrap-narrow" style="padding:0">
    <div class="card center">
      <div style="font-size:3.5rem">${n.emoji}</div>
      <h1>${esc(n.name)}</h1>
      <p class="muted">선생님이 게임을 시작할 때까지 기다려 주세요!</p>
      <div style="margin-top:12px">${mem.map((p) => `<span class="chip" style="margin:3px">${roleEmoji(p.role)} ${esc(p.name)}</span>`).join('')}</div>
    </div>
    <div class="card">
      <h3>🌾 우리 ${regionLabel(room.meta)}의 특산품</h3>
      <p class="small muted">매 턴 자동으로 생산돼요. 다른 나라에 팔아서 돈을 벌고, 필요한 자원은 사 오세요!</p>
      <div class="grid grid-3">
        ${Object.entries(n.production || {}).map(([r, q]) => `<div class="stock-item">
          <span>${rInfo(r).emoji} ${esc(rInfo(r).name)}</span><span class="qty">턴당 ${q}</span></div>`).join('')}
      </div>
    </div>
  </div>`;
}

function roleEmoji(id) { return ROLES.find((r) => r.id === id)?.emoji || '🙂'; }

// 역할 아바타 그림이 있는 역할 (/assets/roles/). size: 'sm' | 'lg'
const ROLE_AVATARS = new Set(['trader', 'producer', 'finance', 'analyst']);
function roleFace(id, size = 'sm') {
  return ROLE_AVATARS.has(id)
    ? `<img class="role-avatar role-${size}" src="/assets/roles/${id}.png" alt="" loading="lazy">`
    : `<span class="role-emoji role-${size}">${roleEmoji(id)}</span>`;
}

function renderGame() {
  const n = room.nations[myNation];
  const hasCraft = Object.keys(room.recipes || {}).length > 0;
  const board = leaderboard(room.nations, room.resources);
  const myRank = board.findIndex((b) => b.id === myNation) + 1;
  const assets = calcAssets(n, room.resources);

  // 이번 턴 이벤트 속보 — 학생이 직접 닫기 전까지 계속 보인다
  const events = Object.entries(room.events || {}).sort(([, a], [, b]) => (b.ts || 0) - (a.ts || 0));
  const latest = events[0]?.[1];
  const evCat = latest?.cat || (latest?.rare ? 'rare' : 'economy');
  const banner = latest && latest.ts !== seenEvent && latest.turn >= room.meta.turn
    ? `<div class="banner ${latest.rare ? 'rare' : 'event'} has-ev-bg" style="--ev-img:url('/assets/events/${evCat}.jpg')">
        <div class="item-head">
          <div>
            <div class="badge ${latest.rare ? 'gold' : 'bad'}" style="margin-bottom:5px">
              <span class="live-dot"></span>${latest.rare ? '특종' : '속보'}
            </div>
            <h3 style="margin:0">${latest.rare ? '✨ ' : ''}${esc(latest.title)}</h3>
          </div>
          <button class="ghost sm" id="closeBanner" aria-label="속보 닫기">✕</button>
        </div>
        <p style="margin:6px 0 8px">${esc(latest.desc)}</p>
        <div class="row" style="gap:6px">${Object.entries(latest.applied || {}).map(([r, p]) => {
          const before = latest.before?.[r];
          const rose = before != null ? p > before : null;
          return `<span class="chip tiny" style="flex:0 0 auto">${rInfo(r).emoji} ${esc(rInfo(r).name)}
            <b class="${rose === null ? '' : rose ? 'up' : 'down'}">${rose === null ? '' : rose ? '▲' : '▼'} ${fmtMoney(p)}</b></span>`;
        }).join('')}</div>
      </div>` : '';

  const pendingForMe = Object.values(room.trades || {}).filter((t) =>
    (t.status === 'draft' && t.from === myNation && !(me in (t.votesFrom || {}))) ||
    (t.status === 'proposed' && t.to === myNation && !(me in (t.votesTo || {})))
  ).length;

  app.innerHTML = `
  ${banner}
  <div class="my-bar">
    <div class="row" style="align-items:center;gap:14px">
      <div style="flex:2 1 220px;display:flex;align-items:center;gap:12px">
        ${crest({ id: myNation, ...n }, { size: 'lg', rank: myRank <= 3 ? myRank : 0 })}
        <div style="min-width:0">
          <div class="name">${esc(n.name)}</div>
          <div class="small muted">${roleEmoji(myMembers()[me]?.role)} ${esc(myName())} · 모둠 ${teamSize()}명
          ${room.meta.teamApproval ? ` · 결정에 <b>${needVotes()}명</b> 찬성 필요` : ''}</div>
        </div>
      </div>
      ${statTile({ icon: '💰', label: '보유 현금', value: fmtMoney(n.money || 0), tone: 'gold', id: 'hudMoney' })}
      ${statTile({ icon: '📊', label: '총자산', value: fmtMoney(assets), sub: `${board.length}개 나라 중 ${myRank}등`, id: 'hudAssets' })}
    </div>
  </div>

  <div class="tabs">
    <button data-tab="mine" class="${tab === 'mine' ? 'active' : ''}">🏠 우리 나라</button>
    <button data-tab="trade" class="${tab === 'trade' ? 'active' : ''}">🤝 무역${pendingForMe ? ` <span class="badge bad">${pendingForMe}</span>` : ''}</button>
    ${hasCraft ? `<button data-tab="craft" class="${tab === 'craft' ? 'active' : ''}">🏭 제작</button>` : ''}
    <button data-tab="world" class="${tab === 'world' ? 'active' : ''}">🌍 다른 나라</button>
    <button data-tab="market" class="${tab === 'market' ? 'active' : ''}">📈 시세</button>
    <button data-tab="chat" class="${tab === 'chat' ? 'active' : ''}">💬 회의</button>
    <button data-tab="rank" class="${tab === 'rank' ? 'active' : ''}">🏆 순위</button>
  </div>
  <div id="tabBody"></div>`;

  // 돈과 자산이 바뀌면 숫자가 올라가며 눈에 띄게 (성취감)
  const moneyEl = document.getElementById('hudMoney');
  const assetsEl = document.getElementById('hudAssets');
  if (moneyEl) { moneyEl.dataset.value = lastHud.money ?? (n.money || 0); countUp(moneyEl, n.money || 0); }
  if (assetsEl) { assetsEl.dataset.value = lastHud.assets ?? assets; countUp(assetsEl, assets); }
  lastHud = { money: n.money || 0, assets };

  const closeBtn = document.getElementById('closeBanner');
  if (closeBtn) closeBtn.onclick = () => { seenEvent = latest.ts; render(); };
  app.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; render(); });

  const body = document.getElementById('tabBody');
  const fns = { mine: tabMine, trade: tabTrade, craft: tabCraft, world: tabWorld, market: tabMarket, chat: tabChat, rank: tabRank };
  (fns[tab] || tabMine)(body);
}

// ---- 우리 나라 ----
function tabMine(el) {
  const n = room.nations[myNation];
  const stock = Object.entries(n.stock || {}).filter(([, q]) => q > 0)
    .sort(([a], [b]) => rInfo(b).basePrice * (n.stock[b]) - rInfo(a).basePrice * (n.stock[a]));

  const stockValue = calcAssets(n, room.resources) - (n.money || 0);
  const maxActs = Math.max(1, ...Object.values(room.contrib?.[myNation] || {})
    .map((c) => (c.proposals || 0) + (c.votes || 0) + (c.crafts || 0) + (c.messages || 0)));

  el.innerHTML = `
  <div class="card">
    <div class="card-head"><h3>🌾 매 턴 자동 생산</h3>
      <span class="badge good">턴이 끝날 때마다 들어와요</span></div>
    <div class="grid grid-3">
      ${Object.entries(n.production || {}).map(([r, q]) =>
        resourceCard(rInfo(r), { qty: `+${q}`, sub: '턴마다', id: r })).join('')}
    </div>
  </div>

  <div class="card">
    <div class="card-head"><h3>📦 우리 창고</h3>
      <span class="badge brand">자원 가치 ${fmtMoney(stockValue)}</span></div>
    ${stock.length ? `<div class="grid grid-3">
      ${stock.map(([r, q]) => resourceCard(rInfo(r), { qty: q, price: rInfo(r).basePrice, id: r })).join('')}
    </div>` : emptyState('box', '아직 가진 자원이 없어요',
        '턴이 진행되면 우리 특산품이 창고에 쌓입니다!')}
  </div>

  <div class="card">
    <div class="card-head"><h3>👥 우리 모둠</h3>
      <span class="badge">${teamSize()}명</span></div>
    ${Object.entries(myMembers()).map(([pid, p]) => {
      const c = room.contrib?.[myNation]?.[pid] || {};
      const total = (c.proposals || 0) + (c.votes || 0) + (c.crafts || 0) + (c.messages || 0);
      return `<div class="rank-row${pid === me ? ' is-me' : ''}">
        <div>${roleFace(p.role, 'sm')}</div>
        <div class="rank-name">${esc(p.name)} ${pid === me ? '<span class="badge brand">나</span>' : ''}
          <div class="tiny muted">${esc(ROLES.find((r) => r.id === p.role)?.name || '')}</div>
          <div style="margin-top:4px;max-width:200px">${meter((total / maxActs) * 100, 'brand')}</div>
        </div>
        <div class="rank-val tiny">${total}회 활동</div>
      </div>`;
    }).join('')}
  </div>`;
}

// ---- 무역 ----
function tabTrade(el) {
  const n = room.nations[myNation];
  const turn = room.meta.turn;
  const trades = Object.entries(room.trades || {});
  const myDrafts = trades.filter(([, t]) => t.status === 'draft' && t.from === myNation);
  const sent = trades.filter(([, t]) => ['proposed', 'accepted'].includes(t.status) && t.from === myNation);
  const received = trades.filter(([, t]) => ['proposed', 'accepted'].includes(t.status) && t.to === myNation);
  const done = trades.filter(([, t]) => ['executed', 'failed', 'rejected', 'expired'].includes(t.status) &&
    (t.from === myNation || t.to === myNation)).sort(([, a], [, b]) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 8);

  const sellable = Object.entries(n.stock || {}).filter(([, q]) => q > 0);
  const others = Object.entries(room.nations).filter(([id, x]) => id !== myNation && Object.keys(x.members || {}).length > 0);

  el.innerHTML = `
  <div class="card">
    <h3>📤 새 거래 제안하기</h3>
    <p class="small muted">우리가 가진 자원을 <b>팔겠다</b>고 제안합니다. 상대가 수락하면 다음 턴 진행 때 자동으로 체결돼요.</p>
    ${sellable.length === 0 ? '<div class="banner info small">아직 팔 수 있는 자원이 없어요. 턴이 진행되면 특산품이 생산됩니다.</div>' : `
    <div class="row">
      <div class="field" style="flex:1.4"><label>누구에게</label>
        <select id="tTo"><option value="">선택하세요</option>
          ${others.map(([id, x]) => `<option value="${id}" ${draftForm.to === id ? 'selected' : ''}>${x.emoji} ${esc(x.name)}</option>`).join('')}</select></div>
      <div class="field" style="flex:1.4"><label>무엇을</label>
        <select id="tRes"><option value="">선택하세요</option>
          ${sellable.map(([r, q]) => `<option value="${r}" ${draftForm.resId === r ? 'selected' : ''}>${rInfo(r).emoji} ${esc(rInfo(r).name)} (보유 ${q})</option>`).join('')}</select></div>
    </div>
    <div class="row">
      <div class="field"><label>수량</label><input type="number" id="tQty" min="1" value="${esc(draftForm.qty)}" placeholder="10"></div>
      <div class="field"><label>총 금액 (원)</label><input type="number" id="tPrice" min="0" step="100" value="${esc(draftForm.price)}" placeholder="50000"></div>
    </div>
    <div class="field"><label>한마디 (선택)</label><input id="tMemo" maxlength="60" value="${esc(draftForm.memo)}" placeholder="예: 다음에 철광석이랑 바꿔요!"></div>
    <div id="priceHint" class="banner info small" style="display:none"></div>
    <button class="block" id="tSend">제안 만들기</button>`}
  </div>

  ${myDrafts.length ? `<div class="card">
    <h3>🗳️ 우리 팀이 검토 중인 제안</h3>
    ${myDrafts.map(([tid, t]) => tradeItem(tid, t, 'from')).join('')}
  </div>` : ''}

  ${received.length ? `<div class="card">
    <h3>📥 받은 제안 <span class="badge bad">${received.filter(([, t]) => t.status === 'proposed').length}</span></h3>
    ${received.map(([tid, t]) => tradeItem(tid, t, 'to')).join('')}
  </div>` : ''}

  ${sent.length ? `<div class="card">
    <h3>📤 보낸 제안</h3>
    ${sent.map(([tid, t]) => tradeItem(tid, t, 'sent')).join('')}
  </div>` : ''}

  ${done.length ? `<div class="card">
    <h3>📜 지난 거래 결과</h3>
    ${done.map(([, t]) => {
      const cls = t.status === 'executed' ? 'ok' : 'no';
      const txt = { executed: '✅ 체결됨', failed: '❌ 체결 실패', rejected: '🚫 거절됨', expired: '⏰ 턴 종료로 무산' }[t.status];
      return `<div class="item ${cls}"><div class="item-head">
        <div class="small">${t.from === myNation ? '판매' : '구매'} · ${nInfo(t.from === myNation ? t.to : t.from).emoji} ${esc(nInfo(t.from === myNation ? t.to : t.from).name)}
          · ${rInfo(t.resId).emoji} ${t.qty}개 · ${fmtMoney(t.totalPrice)}</div>
        <span class="badge ${cls === 'ok' ? 'good' : 'bad'}">${txt}</span></div>
        ${t.failReason ? `<div class="tiny up">${esc(t.failReason)}</div>` : ''}</div>`;
    }).join('')}
  </div>` : ''}`;

  if (sellable.length) bindTradeForm();
  bindTradeActions(el);
}

function tradeItem(tid, t, kind) {
  const isFrom = t.from === myNation;
  const other = nInfo(isFrom ? t.to : t.from);
  const r = rInfo(t.resId);
  const unit = t.totalPrice / Math.max(1, t.qty);
  const marketVal = r.basePrice * t.qty;
  const diff = marketVal ? ((t.totalPrice - marketVal) / marketVal) * 100 : 0;

  let voteBox = '';
  if (t.status === 'draft' && isFrom) {
    voteBox = voteUi(tid, t.votesFrom || {}, '이 제안을 상대에게 보낼까요?');
  } else if (t.status === 'proposed' && !isFrom) {
    voteBox = voteUi(tid, t.votesTo || {}, '이 제안을 수락할까요?');
  } else if (t.status === 'proposed' && isFrom) {
    voteBox = `<div class="tiny muted" style="margin-top:6px">⏳ ${other.emoji} ${esc(other.name)}의 답변을 기다리는 중…
      <button class="ghost sm" data-cancel="${tid}" style="margin-left:6px">제안 취소</button></div>`;
  } else if (t.status === 'accepted') {
    voteBox = `<div class="tiny" style="margin-top:6px">✅ 합의 완료! 선생님이 턴을 진행하면 체결됩니다.</div>`;
  }

  return `<div class="item ${t.status === 'accepted' ? 'ok' : 'pending'}">
    <div class="item-head">
      <div>
        <b>${isFrom ? '📤 우리가 판매' : '📥 우리가 구매'}</b> · ${other.emoji} ${esc(other.name)}<br>
        ${r.emoji} <b>${esc(r.name)} ${t.qty}${esc(r.unit)}</b> → <b class="mono">${fmtMoney(t.totalPrice)}</b>
      </div>
      <div style="text-align:right">
        <div class="tiny muted">개당 ${fmtMoney(unit)}</div>
        <div class="tiny ${diff > 0 ? 'up' : diff < 0 ? 'down' : 'muted'}">시세 대비 ${diff > 0 ? '+' : ''}${diff.toFixed(0)}%</div>
      </div>
    </div>
    ${t.memo ? `<div class="tiny muted" style="margin-top:4px">💬 ${esc(t.memo)}</div>` : ''}
    <div class="tiny muted">제안: ${esc(t.byName || '')}</div>
    ${voteBox}
  </div>`;
}

function voteUi(tid, votes, question) {
  const need = needVotes();
  const yes = Object.values(votes).filter((v) => v === true).length;
  const voted = me in votes;
  const pct = Math.min(100, (yes / need) * 100);
  const voters = Object.entries(votes).map(([pid, v]) =>
    `<span class="chip tiny" style="margin:2px 3px 0 0">${v ? '👍' : '👎'} ${esc(myMembers()[pid]?.name || '?')}</span>`).join('');

  return `<div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--line)">
    <div class="small"><b>${question}</b></div>
    <div class="vote-bar">
      ${meter(pct, yes >= need ? 'good' : 'gold')}
      <span class="tiny muted">찬성 <b>${yes}</b>/${need}명</span>
    </div>
    <div>${voters}</div>
    ${voted ? '<div class="tiny muted" style="margin-top:7px">✔ 내 의견을 냈어요. 모둠원을 기다리는 중…</div>' : `
    <div class="row" style="margin-top:9px">
      <button class="success sm" data-vote="${tid}" data-yes="1">👍 찬성</button>
      <button class="ghost sm" data-vote="${tid}" data-yes="0">👎 반대</button>
    </div>`}
  </div>`;
}

function bindTradeForm() {
  const g = (id) => document.getElementById(id);
  const sync = () => {
    draftForm = { to: g('tTo').value, resId: g('tRes').value, qty: g('tQty').value, price: g('tPrice').value, memo: g('tMemo').value };
    const hint = g('priceHint');
    const qty = parseInt(draftForm.qty);
    if (draftForm.resId && qty > 0) {
      const r = rInfo(draftForm.resId);
      const market = r.basePrice * qty;
      const price = parseInt(draftForm.price);
      hint.style.display = '';
      hint.innerHTML = `현재 시세로는 <b>${fmtMoney(market)}</b> 어치예요.` +
        (price > 0 ? ` 제안 금액은 시세보다 <b class="${price > market ? 'up' : 'down'}">${price > market ? '+' : ''}${(((price - market) / market) * 100).toFixed(0)}%</b>입니다.` : ' 금액을 정해보세요!');
    } else hint.style.display = 'none';
  };
  ['tTo', 'tRes', 'tQty', 'tPrice', 'tMemo'].forEach((id) => { g(id).oninput = sync; g(id).onchange = sync; });
  sync();

  g('tSend').onclick = async () => {
    const to = g('tTo').value, resId = g('tRes').value;
    const qty = parseInt(g('tQty').value), totalPrice = parseInt(g('tPrice').value);
    const err = validateTradeInput({ from: myNation, to, resId, qty, totalPrice });
    if (err) return toast(err, 'bad');
    const have = room.nations[myNation].stock?.[resId] || 0;
    if (qty > have) return toast(`우리가 가진 ${rInfo(resId).name}는 ${have}개예요.`, 'bad');

    const tid = genId('tr_');
    const soloDecide = !room.meta.teamApproval || teamSize() === 1;
    await multiUpdate(roomCode, {
      [`trades/${tid}`]: {
        from: myNation, to, resId, qty, totalPrice,
        memo: g('tMemo').value.trim(), turn: room.meta.turn,
        status: soloDecide ? 'proposed' : 'draft',
        byName: myName(), by: me, createdAt: Date.now(),
        votesFrom: { [me]: true },
      },
    });
    await bump('proposals');
    draftForm = { to: '', resId: '', qty: '', price: '', memo: '' };
    g('tQty').value = ''; g('tPrice').value = ''; g('tMemo').value = '';
    toast(soloDecide ? '📤 제안을 보냈어요!' : '🗳️ 제안을 만들었어요. 모둠원의 찬성을 기다려주세요!', 'good');
  };
}

function bindTradeActions(el) {
  el.querySelectorAll('[data-vote]').forEach((b) => b.onclick = async () => {
    const tid = b.dataset.vote, yes = b.dataset.yes === '1';
    const t = room.trades?.[tid];
    if (!t) return;
    const isFrom = t.from === myNation;
    const field = t.status === 'draft' ? 'votesFrom' : 'votesTo';
    const votes = { ...(t[field] || {}), [me]: yes };
    const updates = { [`trades/${tid}/${field}`]: votes };

    const result = voteResult(votes, teamSize());
    if (room.meta.teamApproval === false || teamSize() === 1) {
      // 자유 결정 모드: 한 명 의견으로 즉시 확정
      updates[`trades/${tid}/status`] = yes ? (t.status === 'draft' ? 'proposed' : 'accepted') : 'rejected';
      if (yes && t.status === 'proposed') updates[`trades/${tid}/acceptedAt`] = Date.now();
    } else if (result === 'pass') {
      updates[`trades/${tid}/status`] = t.status === 'draft' ? 'proposed' : 'accepted';
      if (t.status === 'proposed') updates[`trades/${tid}/acceptedAt`] = Date.now();
    } else if (result === 'fail') {
      updates[`trades/${tid}/status`] = 'rejected';
    }
    await multiUpdate(roomCode, updates);
    await bump('votes');
  });

  el.querySelectorAll('[data-cancel]').forEach((b) => b.onclick = async () => {
    if (!confirm('제안을 취소할까요?')) return;
    await updatePath(roomCode, `trades/${b.dataset.cancel}`, { status: 'rejected' });
  });
}

// ---- 제작 ----
function tabCraft(el) {
  const n = room.nations[myNation];
  const recipes = Object.entries(room.recipes || {});
  const queued = Object.entries(room.crafts || {}).filter(([, c]) => c.status === 'queued' && c.nation === myNation);
  const doneRecent = Object.entries(room.crafts || {}).filter(([, c]) => c.status !== 'queued' && c.nation === myNation)
    .sort(([, a], [, b]) => (b.queuedAt || 0) - (a.queuedAt || 0)).slice(0, 5);

  // 턴이 진행되면 갖게 될 자원량으로 계산한다
  // (지금 재고 + 합의된 거래 + 자동 생산 − 이미 예약한 제작이 쓸 재료)
  const proj = projectedStock(room, myNation);
  const avail = (rid) => proj[rid] || 0;
  const incoming = Object.values(room.trades || {}).some((t) => t.status === 'accepted' && t.to === myNation);

  el.innerHTML = `
  <div class="card">
    <h3>🏭 제작소</h3>
    <p class="small muted">자원을 조합하면 훨씬 비싼 물건이 됩니다! 예약해 두면 <b>턴이 진행될 때</b> 만들어져요.</p>
    <div class="banner info small" style="margin-bottom:0">
      아래 <b>괄호 안 숫자</b>는 이번 턴이 끝났을 때 갖게 될 양이에요.
      턴은 <b>①거래 체결 → ②특산품 생산 → ③제작</b> 순서로 진행되니,
      ${incoming ? '<b>지금 사기로 합의한 재료</b>와 ' : ''}이번 턴에 생산될 특산품까지 미리 계산해서 예약할 수 있어요.
    </div>
  </div>

  ${queued.length ? `<div class="card">
    <h3>⏳ 이번 턴 제작 예약 <span class="badge brand">${queued.length}건</span></h3>
    ${queued.map(([cid, c]) => {
      const rec = room.recipes[c.recipeId];
      const out = rInfo(rec.out);
      return `<div class="item ok"><div class="item-head">
        <div><b>${out.emoji} ${esc(out.name)} ×${rec.outQty * (c.times || 1)}</b>
          <div class="tiny muted">${Object.entries(rec.inputs).map(([r, q]) => `${rInfo(r).emoji}${esc(rInfo(r).name)} ${q * (c.times || 1)}`).join(' + ')} 소모 · 예약: ${esc(c.byName || '')}</div></div>
        <button class="ghost sm" data-uncraft="${cid}">취소</button>
      </div></div>`;
    }).join('')}
  </div>` : ''}

  <div class="card">
    <h3>📖 만들 수 있는 것</h3>
    <div class="grid grid-2" style="margin-top:10px">
      ${recipes.map(([rid, rec]) => {
        const out = rInfo(rec.out);
        const cost = Object.entries(rec.inputs).reduce((s, [r, q]) => s + rInfo(r).basePrice * q, 0);
        const value = out.basePrice * rec.outQty;
        const profit = value - cost;
        const maxMake = Math.min(...Object.entries(rec.inputs).map(([r, q]) => Math.floor(avail(r) / q)));
        const can = maxMake >= 1;
        return `<div class="recipe-card ${can ? 'can' : ''}">
          <div class="recipe-out">
            <span style="font-size:1.5rem">${out.emoji}</span>
            <span>${esc(out.name)} ×${rec.outQty}</span>
            <span style="flex:1"></span>
            <span class="profit-tag">📈 ${profit > 0 ? '+' : ''}${fmtShort(profit)}원</span>
          </div>
          <div style="margin:8px 0 6px">
            ${Object.entries(rec.inputs).map(([r, q]) => {
              const ok = avail(r) >= q;
              return `<span class="ing ${ok ? 'ok' : 'lack'}">${ok ? '✔' : '✕'} ${rInfo(r).emoji}${esc(rInfo(r).name)} ${q}<span class="tiny">(${avail(r)})</span></span>`;
            }).join('')}
            <span class="recipe-arrow">→</span>
            <span class="ing" style="background:var(--gold-soft);border-color:#f0dca4">${out.emoji}${esc(out.name)}</span>
          </div>
          <div class="tiny muted">재료값 ${fmtMoney(cost)} → 완성품 <b>${fmtMoney(value)}</b></div>
          <div class="row" style="margin-top:9px;align-items:center">
            <input type="number" min="1" max="${Math.max(1, maxMake)}" value="1" data-times="${rid}"
                   style="max-width:74px" aria-label="제작 개수" ${can ? '' : 'disabled'}>
            <button class="sm ${can ? 'success' : ''}" data-craft="${rid}" ${can ? '' : 'disabled'}>${can ? `🔨 예약 (최대 ${maxMake})` : '재료 부족'}</button>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>

  ${doneRecent.length ? `<div class="card"><h3>📜 지난 제작</h3>
    ${doneRecent.map(([, c]) => {
      const rec = room.recipes[c.recipeId];
      return `<div class="item ${c.status === 'done' ? 'ok' : 'no'}"><div class="item-head">
        <div class="small">${rInfo(rec.out).emoji} ${esc(rInfo(rec.out).name)} ×${rec.outQty * (c.times || 1)}</div>
        <span class="badge ${c.status === 'done' ? 'good' : 'bad'}">${c.status === 'done' ? '✅ 완성' : '❌ 실패'}</span>
      </div>${c.failReason ? `<div class="tiny up">${esc(c.failReason)}</div>` : ''}</div>`;
    }).join('')}</div>` : ''}`;

  el.querySelectorAll('[data-craft]').forEach((b) => b.onclick = async () => {
    const rid = b.dataset.craft;
    const times = Math.max(1, parseInt(el.querySelector(`[data-times="${rid}"]`).value) || 1);
    const cid = genId('c_');
    await updatePath(roomCode, 'crafts', {
      [cid]: { nation: myNation, recipeId: rid, times, status: 'queued', by: me, byName: myName(), queuedAt: Date.now() },
    });
    await bump('crafts');
  });
  el.querySelectorAll('[data-uncraft]').forEach((b) => b.onclick = async () => {
    await removePath(roomCode, `crafts/${b.dataset.uncraft}`);
  });
}

// ---- 다른 나라 ----
function tabWorld(el) {
  const others = Object.entries(room.nations).filter(([id, x]) => id !== myNation && Object.keys(x.members || {}).length > 0);
  el.innerHTML = `
  <div class="card"><h3>🌍 다른 ${regionLabel(room.meta)} 살펴보기</h3>
    <p class="small muted">누가 무엇을 많이 가지고 있는지 보고 협상 전략을 세워보세요!</p></div>
  <div class="grid grid-2">
    ${others.map(([id, x]) => {
      const stock = Object.entries(x.stock || {}).filter(([, q]) => q > 0).sort((a, b) => b[1] - a[1]);
      return `<div class="card" style="margin:0">
        <div class="card-head"><h3>${x.emoji} ${esc(x.name)}</h3>
          <span class="badge">${Object.keys(x.members || {}).length}명</span></div>
        <div class="tiny muted">턴당 생산: ${Object.entries(x.production || {}).map(([r, q]) => `${rInfo(r).emoji}${esc(rInfo(r).name)} ${q}`).join(', ')}</div>
        <div class="grid grid-4" style="gap:6px;margin-top:10px">
          ${stock.length ? stock.map(([r, q]) => `<div class="stock-item tiny">
            <span>${rInfo(r).emoji} ${esc(rInfo(r).name)}</span><span class="qty">${q}</span></div>`).join('')
            : '<span class="tiny muted">보유 자원 없음</span>'}
        </div>
        <div class="tiny muted" style="margin-top:8px">💰 보유 현금 ${fmtMoney(x.money || 0)}</div>
      </div>`;
    }).join('') || '<p class="muted">다른 참가자가 없어요.</p>'}
  </div>`;
}

// ---- 시세 ----
function tabMarket(el) {
  const tierName = { raw: '🌾 원자재 (특산품)', mid: '🔧 1차 가공품', final: '✨ 완제품' };
  const n = room.nations[myNation];
  el.innerHTML = ['raw', 'mid', 'final'].map((tier) => {
    const items = Object.entries(room.resources || {}).filter(([, r]) => r.tier === tier);
    if (!items.length) return '';
    return `<div class="card"><h3>${tierName[tier]}</h3>
      <div class="table-scroll"><table>
        <thead><tr><th>자원</th><th class="num">현재 시세</th><th class="num">처음 대비</th><th class="num">우리 보유</th></tr></thead>
        <tbody>${items.sort((a, b) => b[1].basePrice - a[1].basePrice).map(([id, r]) => {
          const diff = r.basePrice / (r.originalPrice || r.basePrice);
          const have = n.stock?.[id] || 0;
          return `<tr>
            <td>${r.emoji} ${esc(r.name)} <span class="tiny muted">/${esc(r.unit)}</span></td>
            <td class="num"><b>${fmtMoney(r.basePrice)}</b></td>
            <td class="num ${diff > 1.01 ? 'up' : diff < 0.99 ? 'down' : 'muted'}">${diff === 1 ? '-' : `${diff > 1 ? '▲' : '▼'}${Math.abs(Math.round((diff - 1) * 100))}%`}</td>
            <td class="num ${have ? '' : 'muted'}">${have}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div></div>`;
  }).join('') + `<div class="card"><h3>📢 지금까지의 세계 소식</h3>
    ${Object.entries(room.events || {}).sort(([, a], [, b]) => (b.ts || 0) - (a.ts || 0)).map(([, e]) =>
      `<div class="item"><b>${e.rare ? '✨ ' : ''}${esc(e.title)}</b> <span class="badge">${e.turn}턴</span>
       <div class="tiny muted">${esc(e.desc)}</div></div>`).join('') || '<p class="muted small">아직 이벤트가 없어요.</p>'}</div>`;
}

// ---- 회의 ----
function tabChat(el) {
  const msgs = Object.entries(room.chat?.[myNation] || {}).sort(([, a], [, b]) => (a.ts || 0) - (b.ts || 0));
  el.innerHTML = `<div class="card">
    <h3>💬 우리 모둠 회의실</h3>
    <p class="small muted">모둠원끼리만 보여요. 전략을 함께 의논해 보세요!</p>
    <div class="chat-box" id="chatBox">
      ${msgs.map((m) => `<div class="chat-msg ${m[1].by === me ? 'mine' : ''}">
        <span class="who">${esc(m[1].name)}</span> <span class="tiny muted">${new Date(m[1].ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
        <div class="bubble">${esc(m[1].text)}</div></div>`).join('')
        || emptyState('chat', '첫 메시지를 남겨보세요!', '어떤 자원을 사고팔지 모둠끼리 의논해요.')}
    </div>
    <div class="row">
      <input id="chatInput" placeholder="메시지 입력…" maxlength="200" style="flex:4" aria-label="회의 메시지">
      <button id="chatSend" style="flex:0 0 auto">보내기</button>
    </div>
  </div>`;

  const box = document.getElementById('chatBox');
  box.scrollTop = box.scrollHeight;
  const input = document.getElementById('chatInput');
  const send = async () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    await pushTo(roomCode, `chat/${myNation}`, { text, name: myName(), by: me, ts: Date.now() });
    await bump('messages');
  };
  document.getElementById('chatSend').onclick = send;
  input.onkeydown = (e) => { if (e.key === 'Enter') send(); };
  input.focus();
}

// ---- 순위 ----
function tabRank(el) {
  const board = leaderboard(room.nations, room.resources);
  const start = room.meta.startingMoney || 0;
  el.innerHTML = `<div class="card">
    <h3>🏆 총자산 순위</h3>
    ${podium(board, myNation)}
    <p class="small muted center" style="margin-top:14px">총자산 = 보유 현금 + 가진 자원의 현재 시세 합</p>
    <div class="table-scroll"><table>
      <thead><tr><th>순위</th><th>나라</th><th class="num">현금</th><th class="num">자원</th><th class="num">총자산</th><th class="num">성장률</th></tr></thead>
      <tbody>${board.map((b, i) => {
        const growth = start ? ((b.assets - start) / start) * 100 : 0;
        return `<tr class="${b.id === myNation ? 'is-me' : ''}">
          <td>${['🥇', '🥈', '🥉'][i] || i + 1}</td>
          <td>${b.emoji} ${esc(b.name)}${b.id === myNation ? ' <span class="badge brand">우리</span>' : ''}</td>
          <td class="num">${fmtMoney(b.money)}</td>
          <td class="num">${fmtMoney(b.assets - b.money)}</td>
          <td class="num"><b>${fmtMoney(b.assets)}</b></td>
          <td class="num ${growth >= 0 ? 'up' : 'down'}">${growth >= 0 ? '+' : ''}${growth.toFixed(0)}%</td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>
  </div>`;
}

// ---- 결과 ----
function renderResult() {
  const board = leaderboard(room.nations, room.resources);
  const myRank = board.findIndex((b) => b.id === myNation) + 1;
  const mine = board[myRank - 1];
  const start = room.meta.startingMoney || 0;
  const growth = start && mine ? ((mine.assets - start) / start) * 100 : 0;

  app.innerHTML = `<div class="wrap-narrow" style="padding:0">
    <div class="card center">
      ${myRank === 1
        ? '<img class="result-trophy" src="/assets/trophy.png" alt="우승 트로피">'
        : `<div style="font-size:3.5rem">${['🥇', '🥈', '🥉'][myRank - 1] || '🏁'}</div>`}
      <h1>${myRank}등!</h1>
      <p class="muted">${room.nations[myNation].emoji} ${esc(room.nations[myNation].name)}</p>
      <div class="row" style="justify-content:center;margin-top:14px">
        <div class="chip">총자산 ${fmtMoney(mine?.assets || 0)}</div>
        <div class="chip">성장률 <b class="${growth >= 0 ? 'up' : 'down'}">${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%</b></div>
      </div>
    </div>
    <div class="card">
      <h3>🏆 최종 순위</h3>
      ${podium(board, myNation)}
      <div style="margin-top:12px">${board.map((b, i) => `<div class="rank-row${b.id === myNation ? ' is-me' : ''}">
        <div class="rank-no">${i + 1}</div>
        <div class="rank-name">${b.emoji} ${esc(b.name)}</div>
        <div class="rank-val">${fmtMoney(b.assets)}</div>
      </div>`).join('')}</div>
    </div>
    <div class="card">
      <h3>👥 우리 모둠 활동</h3>
      ${Object.entries(myMembers()).map(([pid, p]) => {
        const c = room.contrib?.[myNation]?.[pid] || {};
        return `<div class="rank-row">
          <div>${roleEmoji(p.role)}</div>
          <div class="rank-name">${esc(p.name)}
            <div class="tiny muted">제안 ${c.proposals || 0} · 투표 ${c.votes || 0} · 제작 ${c.crafts || 0} · 발언 ${c.messages || 0}</div></div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ---- 기여도 집계 ----
async function bump(field) {
  const cur = room.contrib?.[myNation]?.[me]?.[field] || 0;
  await updatePath(roomCode, `contrib/${myNation}/${me}`, { [field]: cur + 1 });
}

// 모든 선언이 끝난 뒤 시작 (Firebase 미설정이면 안내 화면만 남긴다)
if (initDb()) boot().catch((err) => {
  console.error(err);
  app.innerHTML = `<div class="card"><h2>문제가 발생했어요</h2><p class="small">${esc(err.message)}</p>
    <p class="small muted">새로고침하거나 선생님께 알려주세요.</p></div>`;
});
