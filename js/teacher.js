// ============================================================
// 교사 화면: 방 만들기 마법사 + 진행 대시보드
// ============================================================

import {
  initDb, readPath, watch, writePath, updatePath, multiUpdate, pushTo,
  roomExists, readAny, writeAny, saveTeacher, loadTeacher, clearTeacher,
} from './db.js';
import {
  getPreset, filterByDifficulty, DIFFICULTIES, SCALES, DEFAULT_SETTINGS, ROLES,
} from './presets.js';
import { getEvents, availableEvents, drawRandomEvent, eventCategory } from './events.js';
import {
  fmtMoney, calcAssets, leaderboard, applyEventChanges, processTurn,
  makeGuard, detectTampering, genRoomCode, genId, majorityNeeded,
} from './game.js';
import { esc, resourceCard, statTile, crest, podium, emptyState, toast, fmtShort, regionWord, regionLabel } from './ui.js';

const app = document.getElementById('app');
const tbInfo = document.getElementById('tbInfo');

let room = null;      // 실시간 방 데이터
let roomCode = null;
let unsub = null;
let tab = 'nations';
let busy = false;

async function boot() {
  const saved = loadTeacher();
  if (saved?.code && (await roomExists(saved.code))) {
    roomCode = saved.code;
    subscribe();
  } else {
    clearTeacher();
    renderWizard();
    cleanupOldRooms();  // 여러 학교가 한 주소를 함께 쓰므로 묵은 방을 치운다
  }
}

// 만든 지 3일 지난 방을 지운다. 목록만 훑으므로 데이터 사용량이 거의 없다.
const ROOM_TTL = 3 * 24 * 60 * 60 * 1000;
async function cleanupOldRooms() {
  try {
    const index = await readAny('roomIndex');
    if (!index) return;
    const now = Date.now();
    for (const [code, info] of Object.entries(index)) {
      if (now - (info?.createdAt || 0) < ROOM_TTL) continue;
      await writeAny(`rooms/${code}`, null);
      await writeAny(`roomIndex/${code}`, null);
    }
  } catch (err) {
    console.warn('오래된 방 정리를 건너뜁니다:', err.message);
  }
}

function subscribe() {
  if (unsub) unsub();
  unsub = watch(roomCode, '', (data) => {
    if (!data) { clearTeacher(); location.reload(); return; }
    room = data;
    render();
  });
}

// ============================================================
// 1. 방 만들기 마법사
// ============================================================

const wiz = {
  step: 1,
  mode: 'country',
  scale: 'county',    // 한국 모드일 때만 쓰임: county(시군구) / province(시도)
  difficulty: 'normal',
  nations: [],       // [{id, name, emoji, production:{}}]
  settings: { ...DEFAULT_SETTINGS },
};

function loadWizNations() {
  const preset = getPreset(wiz.mode, wiz.scale);
  wiz.nations = preset.nations.map((n) => ({ ...n, production: { ...n.production } }));
}

// 현재 모드/단위의 전체 프리셋 나라 목록 (특산품이 이미 채워져 있음)
function presetNationList() { return getPreset(wiz.mode, wiz.scale).nations; }

// 아직 안 쓴 프리셋 나라 하나를 (특산품째로) 복제해 반환. 다 썼으면 null
function nextPresetNation() {
  const used = new Set(wiz.nations.map((n) => n.id));
  const p = presetNationList().find((n) => !used.has(n.id));
  return p ? { ...p, production: { ...p.production } } : null;
}

// 나라 한 개 추가: 실제 대표 나라(특산품 포함)를 우선 채우고, 없으면 빈 나라
function addOneNation() {
  const preset = nextPresetNation();
  if (preset) { wiz.nations.push(preset); return; }
  const { resources } = wizResources();
  const rawIds = Object.entries(resources).filter(([, r]) => r.tier === 'raw').map(([id]) => id);
  wiz.nations.push({ id: genId('n_'), name: '새 나라', emoji: '🏳️', production: { [rawIds[0]]: 5 } });
}

// 나라 수를 target으로 맞춘다 (줄이면 뒤에서 제거, 늘리면 대표 나라 자동 추가)
function setNationCount(target) {
  target = Math.max(2, Math.floor(target) || 2);
  while (wiz.nations.length > target) wiz.nations.pop();
  while (wiz.nations.length < target) addOneNation();
}

function wizResources() {
  const p = getPreset(wiz.mode, wiz.scale);
  return filterByDifficulty(p.resources, p.recipes, wiz.difficulty);
}

function renderWizard() {
  if (wiz.nations.length === 0) loadWizNations();
  tbInfo.textContent = '새 방 만들기';
  const dots = [1, 2, 3].map((i) => `<div class="dot ${i <= wiz.step ? 'on' : ''}"></div>`).join('');
  app.innerHTML = `<div class="wrap-narrow" style="padding:0">
    <div class="step-dots">${dots}</div>
    <div id="stepBody"></div>
  </div>`;
  const body = document.getElementById('stepBody');
  if (wiz.step === 1) renderStep1(body);
  else if (wiz.step === 2) renderStep2(body);
  else renderStep3(body);
}

function renderStep1(el) {
  const showScale = wiz.mode === 'city';
  const diffStepNo = showScale ? 3 : 2;

  el.innerHTML = `
  <div class="card">
    <h2>1. 어떤 무대에서 무역할까요?</h2>
    <div class="grid grid-2" style="margin-top:12px">
      <button class="pick ${wiz.mode === 'country' ? 'selected' : ''}" data-mode="country">
        <div class="pick-title">🌍 세계 국가</div>
        <div class="pick-desc">한국·미국·브라질 등 14개 나라. 석유·철광석·반도체 등 국제 무역을 체험해요.</div>
      </button>
      <button class="pick ${wiz.mode === 'city' ? 'selected' : ''}" data-mode="city">
        <div class="pick-title">🇰🇷 한국 지역</div>
        <div class="pick-desc">제주·안동·부산 등 시/군/구, 또는 서울·경기 등 시/도 단위로 무역해요.</div>
      </button>
    </div>
  </div>

  ${showScale ? `
  <div class="card">
    <h2>2. 어떤 단위로 나눌까요?</h2>
    <div class="grid grid-2" style="margin-top:12px">
      ${SCALES.map((s) => `
        <button class="pick ${wiz.scale === s.id ? 'selected' : ''}" data-scale="${s.id}">
          <div class="pick-title">${s.emoji} ${s.name}</div>
          <div class="pick-desc">${s.desc}</div>
        </button>`).join('')}
    </div>
  </div>` : ''}

  <div class="card">
    <h2>${diffStepNo}. 난이도를 골라주세요</h2>
    <div class="grid" style="margin-top:12px">
      ${DIFFICULTIES.map((d) => `
        <button class="pick ${wiz.difficulty === d.id ? 'selected' : ''}" data-diff="${d.id}">
          <div class="pick-title">${d.emoji} ${d.name}</div>
          <div class="pick-desc">${d.desc}</div>
        </button>`).join('')}
    </div>
    <div class="banner info" style="margin-top:14px;margin-bottom:0">
      <div class="small" id="diffSummary"></div>
    </div>
  </div>

  <button class="lg block" id="next1">다음 단계 →</button>`;

  el.querySelectorAll('[data-mode]').forEach((b) => b.onclick = () => {
    wiz.mode = b.dataset.mode; loadWizNations(); renderWizard();
  });
  el.querySelectorAll('[data-scale]').forEach((b) => b.onclick = () => {
    wiz.scale = b.dataset.scale; loadWizNations(); renderWizard();
  });
  el.querySelectorAll('[data-diff]').forEach((b) => b.onclick = () => {
    wiz.difficulty = b.dataset.diff; renderWizard();
  });
  document.getElementById('next1').onclick = () => { wiz.step = 2; renderWizard(); };

  const { resources, recipes } = wizResources();
  const cnt = (t) => Object.values(resources).filter((r) => r.tier === t).length;
  const breakdown = `원자재 ${cnt('raw')}종${cnt('mid') ? ` · 1차 가공품 ${cnt('mid')}종` : ''}${cnt('final') ? ` · 완제품 ${cnt('final')}종` : ''}`;
  document.getElementById('diffSummary').innerHTML =
    `이 난이도에서는 <b>자원 ${Object.keys(resources).length}종</b>(${breakdown})을 사용합니다. ` +
    (Object.keys(recipes).length
      ? `자원을 조합하는 <b>제작 레시피 ${Object.keys(recipes).length}개</b>가 함께 열립니다.`
      : `<b>제작(가공)은 없고</b> 사고파는 무역에만 집중합니다.`);
}

function renderStep2(el) {
  const { resources } = wizResources();
  const rawIds = Object.entries(resources).filter(([, r]) => r.tier === 'raw').map(([id]) => id);
  const opts = (sel) => rawIds.map((id) => `<option value="${id}" ${id === sel ? 'selected' : ''}>${resources[id].emoji} ${esc(resources[id].name)}</option>`).join('');

  el.innerHTML = `
  <div class="card">
    <div class="card-head">
      <h2>${wiz.mode === 'city' ? 4 : 3}. 참가할 ${regionWord(wiz.mode, wiz.scale)} 설정</h2>
      <span class="badge brand">${wiz.nations.length}개</span>
    </div>
    <p class="small muted">학생 모둠 수에 맞춰 <b>참가 ${regionWord(wiz.mode, wiz.scale)} 수</b>를 정하세요.
    대표 ${regionWord(wiz.mode, wiz.scale)}가 특산품과 함께 자동으로 채워집니다. 특산품·생산량은 아래에서 바꿀 수 있어요.</p>
    <div class="field" style="margin-bottom:14px">
      <label>참가 ${regionWord(wiz.mode, wiz.scale)} 수</label>
      <div class="row" style="align-items:center;gap:8px;max-width:220px">
        <button class="ghost" id="cntMinus" aria-label="줄이기" style="min-width:44px">−</button>
        <input type="number" id="nationCount" min="2" max="${presetNationList().length}"
               value="${wiz.nations.length}" style="text-align:center" aria-label="참가 나라 수">
        <button class="ghost" id="cntPlus" aria-label="늘리기" style="min-width:44px">+</button>
      </div>
      <div class="tiny muted" style="margin-top:5px">최대 ${presetNationList().length}개까지 대표 ${regionWord(wiz.mode, wiz.scale)}가 자동으로 채워져요.</div>
    </div>
    <div id="nationList" class="grid" style="gap:10px"></div>
    <button class="ghost sm" id="addNation" style="margin-top:10px">+ 하나 더 추가</button>
  </div>
  <div class="row">
    <button class="ghost" id="back2">← 이전</button>
    <button id="next2">다음 단계 →</button>
  </div>`;

  const list = document.getElementById('nationList');
  const draw = () => {
    list.innerHTML = wiz.nations.map((n, i) => {
      const value = Object.entries(n.production).reduce((s, [r, q]) => s + (resources[r]?.basePrice || 0) * q, 0);
      return `
      <div class="item">
        <div class="nation-edit">
          <div>
            <div class="row" style="margin-bottom:8px">
              <input style="max-width:64px;text-align:center;font-size:1.2rem" value="${esc(n.emoji)}" data-f="emoji" data-i="${i}">
              <input value="${esc(n.name)}" data-f="name" data-i="${i}">
            </div>
            <div data-prods="${i}">
              ${Object.entries(n.production).map(([rid, q]) => `
                <div class="prod-row">
                  <select data-pf="res" data-i="${i}" data-r="${rid}">${opts(rid)}</select>
                  <input type="number" min="1" value="${q}" data-pf="qty" data-i="${i}" data-r="${rid}">
                  <button class="ghost sm" data-delprod="${i}" data-r="${rid}">✕</button>
                </div>`).join('')}
            </div>
            <button class="ghost sm" data-addprod="${i}">+ 특산품</button>
            <div class="tiny muted" style="margin-top:6px">턴당 생산 가치 <b class="mono">${fmtMoney(value)}</b></div>
          </div>
          <button class="danger sm" data-del="${i}">삭제</button>
        </div>
      </div>`;
    }).join('');
    bind();
  };

  const bind = () => {
    list.querySelectorAll('[data-f]').forEach((inp) => inp.onchange = () => {
      wiz.nations[+inp.dataset.i][inp.dataset.f] = inp.value.trim() || '?';
    });
    list.querySelectorAll('[data-pf="qty"]').forEach((inp) => inp.onchange = () => {
      const n = wiz.nations[+inp.dataset.i];
      n.production[inp.dataset.r] = Math.max(1, parseInt(inp.value) || 1);
      draw();
    });
    list.querySelectorAll('[data-pf="res"]').forEach((sel) => sel.onchange = () => {
      const n = wiz.nations[+sel.dataset.i];
      const old = sel.dataset.r;
      if (sel.value === old) return;
      const q = n.production[old];
      delete n.production[old];
      n.production[sel.value] = (n.production[sel.value] || 0) + q;
      draw();
    });
    list.querySelectorAll('[data-delprod]').forEach((b) => b.onclick = () => {
      const n = wiz.nations[+b.dataset.delprod];
      if (Object.keys(n.production).length <= 1) { toast('특산품은 최소 1개는 있어야 해요.', 'bad'); return; }
      delete n.production[b.dataset.r];
      draw();
    });
    list.querySelectorAll('[data-addprod]').forEach((b) => b.onclick = () => {
      const n = wiz.nations[+b.dataset.addprod];
      const free = rawIds.find((id) => !(id in n.production));
      if (!free) { toast('추가할 수 있는 자원이 없어요.', 'bad'); return; }
      n.production[free] = 1;
      draw();
    });
    list.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => {
      if (wiz.nations.length <= 2) { toast('최소 2개는 있어야 무역이 가능해요.', 'bad'); return; }
      wiz.nations.splice(+b.dataset.del, 1);
      const cnt = document.getElementById('nationCount'); if (cnt) cnt.value = wiz.nations.length;
      const badge = document.querySelector('.card-head .badge.brand'); if (badge) badge.textContent = `${wiz.nations.length}개`;
      draw();
    });
  };

  draw();

  const countEl = document.getElementById('nationCount');
  const applyCount = (target) => {
    setNationCount(target);
    countEl.value = wiz.nations.length;
    document.querySelector('.card-head .badge.brand').textContent = `${wiz.nations.length}개`;
    draw();
  };
  countEl.onchange = () => applyCount(parseInt(countEl.value) || wiz.nations.length);
  document.getElementById('cntMinus').onclick = () => applyCount(wiz.nations.length - 1);
  document.getElementById('cntPlus').onclick = () => applyCount(wiz.nations.length + 1);
  document.getElementById('addNation').onclick = () => { applyCount(wiz.nations.length + 1); };

  document.getElementById('back2').onclick = () => { wiz.step = 1; renderWizard(); };
  document.getElementById('next2').onclick = () => { wiz.step = 3; renderWizard(); };
}

function renderStep3(el) {
  el.innerHTML = `
  <div class="card">
    <h2>${wiz.mode === 'city' ? 5 : 4}. 게임 규칙 설정</h2>
    <div class="field">
      <label>시작 자금 (원)</label>
      <input type="number" id="sMoney" value="${wiz.settings.startingMoney}" step="10000" min="0">
      <div class="tiny muted" style="margin-top:4px">모든 나라가 똑같이 받는 시작 돈이에요.</div>
    </div>
    <div class="field">
      <label>목표 턴 수</label>
      <input type="number" id="sTurns" value="${wiz.settings.maxTurns}" min="1" max="50">
      <div class="tiny muted" style="margin-top:4px">이 턴에 도달하면 알려드려요. 언제든 조기 종료할 수 있어요.</div>
    </div>
    <div class="field">
      <label>모둠 승인 방식</label>
      <button class="pick ${wiz.settings.teamApproval ? 'selected' : ''}" data-ta="1">
        <div class="pick-title">🗳️ 팀 투표 (추천)</div>
        <div class="pick-desc">거래를 보내거나 수락할 때 모둠원 <b>과반수 찬성</b>이 필요해요. 모두가 참여하게 됩니다.</div>
      </button>
      <button class="pick ${!wiz.settings.teamApproval ? 'selected' : ''}" data-ta="0" style="margin-top:8px">
        <div class="pick-title">⚡ 자유 결정</div>
        <div class="pick-desc">모둠원 누구나 혼자서 바로 거래를 확정할 수 있어요. 진행이 빠릅니다.</div>
      </button>
    </div>
  </div>
  <div class="row">
    <button class="ghost" id="back3">← 이전</button>
    <button class="lg" id="create">🚀 방 만들기</button>
  </div>`;

  el.querySelectorAll('[data-ta]').forEach((b) => b.onclick = () => {
    wiz.settings.teamApproval = b.dataset.ta === '1';
    renderWizard();
  });
  document.getElementById('back3').onclick = () => { wiz.step = 2; renderWizard(); };
  document.getElementById('create').onclick = async (e) => {
    wiz.settings.startingMoney = Math.max(0, parseInt(document.getElementById('sMoney').value) || 0);
    wiz.settings.maxTurns = Math.max(1, parseInt(document.getElementById('sTurns').value) || 10);
    e.target.disabled = true;
    e.target.textContent = '만드는 중…';
    try { await createRoom(); } catch (err) {
      alert('방 만들기에 실패했어요: ' + err.message);
      e.target.disabled = false; e.target.textContent = '🚀 방 만들기';
    }
  };
}

async function createRoom() {
  const { resources, recipes } = wizResources();
  // 이벤트로 시세가 변해도 원래 가격을 기억해 두어 급변을 제한한다
  const res = {};
  for (const [id, r] of Object.entries(resources)) res[id] = { ...r, originalPrice: r.basePrice };

  let code;
  for (let i = 0; i < 10; i++) {
    code = genRoomCode();
    if (!(await roomExists(code))) break;
  }

  const nations = {};
  for (const n of wiz.nations) {
    const nation = {
      name: n.name, emoji: n.emoji,
      money: wiz.settings.startingMoney,
      production: n.production,
      stock: Object.fromEntries(Object.keys(res).map((r) => [r, 0])),
      members: {},
    };
    nation.guard = makeGuard(nation);
    nations[n.id] = nation;
  }

  const token = genId('t_');
  await writePath(code, '', {
    meta: {
      mode: wiz.mode, scale: wiz.mode === 'city' ? wiz.scale : null,
      difficulty: wiz.difficulty, status: 'lobby', turn: 1,
      createdAt: Date.now(), teacherToken: token,
      teamApproval: wiz.settings.teamApproval,
      maxTurns: wiz.settings.maxTurns,
      startingMoney: wiz.settings.startingMoney,
    },
    resources: res,
    recipes,
    nations,
    usedEvents: {},
  });
  await writeAny(`roomIndex/${code}`, { createdAt: Date.now() });
  saveTeacher({ code, token });
  roomCode = code;
  subscribe();
}

// ============================================================
// 2. 대시보드
// ============================================================

function render() {
  if (!room) return;
  const m = room.meta;
  const players = Object.values(room.nations || {}).reduce((s, n) => s + Object.keys(n.members || {}).length, 0);
  tbInfo.innerHTML = `코드 <b class="mono">${roomCode}</b> · ${m.status === 'lobby' ? '대기중' : m.status === 'ended' ? '종료됨' : `${m.turn}턴 진행중`} · 참가자 ${players}명`;

  if (m.status === 'lobby') return renderLobby();
  if (m.status === 'ended') return renderEnded();
  renderDashboard();
}

// ---- 로비 ----
function renderLobby() {
  const nations = room.nations || {};
  const joined = Object.values(nations).filter((n) => Object.keys(n.members || {}).length > 0).length;
  const players = Object.values(nations).reduce((s, n) => s + Object.keys(n.members || {}).length, 0);
  // 학생 전용 입장 링크 — 코드가 들어 있어 스캔·클릭하면 코드 입력 없이 바로 입장
  const base = location.href.replace(/teacher\.html.*$/, '');
  const joinUrl = `${base}student.html?code=${roomCode}`;

  app.innerHTML = `
  <div class="card center">
    <h2>학생들을 초대하세요</h2>
    <div class="join-grid">
      <div>
        <p class="tiny muted" style="margin:0 0 4px">① QR 코드를 스캔하면 바로 입장</p>
        <div id="qrBox" class="qr-box"><div class="tiny muted">QR 코드 만드는 중…</div></div>
      </div>
      <div class="join-or">또는</div>
      <div>
        <p class="tiny muted" style="margin:0 0 4px">② 코드를 직접 입력</p>
        <div class="room-code">${roomCode}</div>
        <p class="tiny muted" style="margin:10px 0 4px">학생 입장 주소</p>
        <div class="join-link mono">${esc(joinUrl)}</div>
      </div>
    </div>
    <div class="row" style="justify-content:center;max-width:520px;margin:16px auto 0">
      <button class="ghost" id="copyCode">📋 코드 복사</button>
      <button class="ghost" id="copyUrl">🔗 학생 링크 복사</button>
    </div>
    <p class="tiny muted" style="margin-top:12px">학생이 자기 기기에서 이 주소를 열거나 QR을 스캔하면 이름만 입력하고 나라를 고르면 됩니다.</p>
  </div>

  <div class="card">
    <div class="card-head">
      <h2>👥 참가 현황</h2>
      <span class="badge brand">${joined}개 ${regionLabel(room.meta)} · ${players}명</span>
    </div>
    <div class="grid grid-3">
      ${Object.entries(nations).map(([id, n]) => {
        const mem = Object.values(n.members || {});
        return `<div class="nation-card ${mem.length ? '' : 'empty'}">
          <div style="display:flex;align-items:center;gap:9px">
            ${crest({ id, ...n }, { size: 'md' })}
            <div style="min-width:0">
              <div style="font-weight:800">${esc(n.name)}</div>
              <div class="tiny muted">특산품 ${Object.entries(n.production || {}).map(([r, q]) => `${room.resources[r]?.emoji || ''}${q}`).join(' ')}</div>
            </div>
          </div>
          <div style="margin-top:9px">${mem.length
            ? mem.map((p) => `<span class="chip tiny" style="margin:2px 3px 0 0">${roleEmoji(p.role)} ${esc(p.name)}</span>`).join('')
            : '<span class="tiny muted">아직 아무도 없어요</span>'}</div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <div class="row">
    <button class="danger ghost" id="delRoom">방 삭제</button>
    <button class="lg success" id="startGame" ${joined < 2 ? 'disabled' : ''}>
      ${joined < 2 ? '2개 이상의 나라에 학생이 들어와야 시작할 수 있어요' : '🚀 게임 시작!'}
    </button>
  </div>`;

  document.getElementById('copyCode').onclick = () => copy(roomCode, '코드를 복사했어요!');
  document.getElementById('copyUrl').onclick = () => copy(joinUrl, '학생 링크를 복사했어요!');
  renderQR(document.getElementById('qrBox'), joinUrl);
  document.getElementById('startGame').onclick = async () => {
    await updatePath(roomCode, 'meta', { status: 'playing' });
    await log(`🚀 게임을 시작합니다! (1턴)`);
  };
  document.getElementById('delRoom').onclick = deleteRoom;
}

function roleEmoji(id) {
  return ROLES.find((r) => r.id === id)?.emoji || '🙂';
}

// ---- 진행 대시보드 ----
function renderDashboard() {
  const m = room.meta;
  const resources = room.resources || {};
  const nations = room.nations || {};
  const board = leaderboard(nations, resources);
  const trades = Object.entries(room.trades || {});
  const pendingAccepted = trades.filter(([, t]) => t.status === 'accepted' && t.turn === m.turn);
  const inNegotiation = trades.filter(([, t]) => (t.status === 'draft' || t.status === 'proposed') && t.turn === m.turn);
  const crafts = Object.entries(room.crafts || {}).filter(([, c]) => c.status === 'queued');

  // 협상 중에 돈·재고가 바뀐 나라 = 개발자도구로 값을 고쳤을 가능성
  const tampered = Object.entries(nations)
    .map(([id, n]) => [id, n, detectTampering(n)])
    .filter(([, , t]) => t);

  app.innerHTML = `
  ${tampered.length ? `<div class="banner" style="background:#fdeaea;border-color:#f3b1b1">
    <div class="item-head">
      <h3 style="margin:0">⚠️ 값이 이상하게 바뀐 ${regionLabel(room.meta)}가 있어요</h3>
      <button class="sm danger" id="fixTamper">원래대로 되돌리기</button>
    </div>
    <p class="small" style="margin:6px 0 0">턴 진행이나 교사 조정 없이 돈·자원이 바뀌었습니다.
      학생이 브라우저 개발자도구로 값을 고쳤을 수 있어요.</p>
    ${tampered.map(([id, n, t]) => `<div class="tiny" style="margin-top:6px">
      <b>${n.emoji} ${esc(n.name)}</b>
      ${t.money ? ` · 현금 <span class="up">${t.money > 0 ? '+' : ''}${fmtMoney(t.money)}</span>` : ''}
      ${t.resources.map((r) => ` · ${resources[r.id]?.emoji || ''}${esc(resources[r.id]?.name || r.id)} <span class="up">${r.diff > 0 ? '+' : ''}${r.diff}</span>`).join('')}
    </div>`).join('')}
  </div>` : ''}
  <div class="grid grid-2" style="grid-template-columns: 1fr 320px; align-items:start">
    <div>
      <div class="card">
        <div class="card-head">
          <h2>${m.turn}턴 진행 중 <span class="small muted">/ 목표 ${m.maxTurns}턴</span></h2>
          <span class="badge ${m.turn >= m.maxTurns ? 'gold' : 'brand'}">${m.turn >= m.maxTurns ? '목표 턴 도달!' : `${m.maxTurns - m.turn}턴 남음`}</span>
        </div>
        <div class="row" style="margin-bottom:10px">
          <div class="chip">🤝 합의 완료 <b>${pendingAccepted.length}</b>건</div>
          <div class="chip">💬 협상 중 <b>${inNegotiation.length}</b>건</div>
          ${Object.keys(room.recipes || {}).length ? `<div class="chip">🔧 제작 예약 <b>${crafts.length}</b>건</div>` : ''}
        </div>
        <button class="lg block success" id="nextTurn" ${busy ? 'disabled' : ''}>
          ⏭️ ${m.turn}턴 진행하기 — 합의된 거래 체결 + 생산${Object.keys(room.recipes || {}).length ? ' + 제작' : ''}
        </button>
        <div class="tiny muted center" style="margin-top:8px">협상이 충분히 끝났을 때 눌러주세요. 되돌릴 수 없어요.</div>
      </div>

      <div class="tabs">
        <button data-tab="nations" class="${tab === 'nations' ? 'active' : ''}">🌍 나라 현황</button>
        <button data-tab="trades" class="${tab === 'trades' ? 'active' : ''}">🤝 거래 현황</button>
        <button data-tab="events" class="${tab === 'events' ? 'active' : ''}">🎲 이벤트 카드</button>
        <button data-tab="market" class="${tab === 'market' ? 'active' : ''}">📈 시세표</button>
        <button data-tab="members" class="${tab === 'members' ? 'active' : ''}">👥 모둠 참여도</button>
        <button data-tab="log" class="${tab === 'log' ? 'active' : ''}">📜 기록</button>
        <button data-tab="admin" class="${tab === 'admin' ? 'active' : ''}">⚙️ 조정</button>
      </div>
      <div id="tabBody"></div>
    </div>

    <div>
      <div class="card">
        <h3>🏆 총자산 순위</h3>
        ${board.length ? podium(board) : ''}
        <div style="margin-top:10px">${board.map((b, i) => `
          <div class="rank-row">
            <div class="rank-no">${i + 1}</div>
            <div class="rank-name">${b.emoji} ${esc(b.name)}</div>
            <div class="rank-val">${fmtMoney(b.assets)}</div>
          </div>`).join('') || emptyState('people', '참가한 나라가 없어요')}</div>
        <div class="tiny muted" style="margin-top:8px">총자산 = 보유 현금 + 보유 자원의 현재 시세 합</div>
      </div>
      <div class="card">
        <h3>방 코드</h3>
        <div class="mono" style="font-size:2rem;font-weight:800;letter-spacing:.1em;color:var(--brand-dark)">${roomCode}</div>
        <button class="ghost sm block" id="endGame" style="margin-top:10px">🏁 게임 종료하고 결과 보기</button>
      </div>
    </div>
  </div>`;

  app.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; render(); });
  document.getElementById('nextTurn').onclick = advanceTurn;

  const fixBtn = document.getElementById('fixTamper');
  if (fixBtn) fixBtn.onclick = async () => {
    if (!confirm('바뀐 값들을 마지막 턴 종료 시점으로 되돌릴까요?')) return;
    const updates = {};
    for (const [id, n] of tampered) {
      updates[`nations/${id}/money`] = n.guard.money;
      updates[`nations/${id}/stock`] = n.guard.stock || {};
    }
    await multiUpdate(roomCode, updates);
    for (const [, n] of tampered) await log(`🛡️ ${n.emoji} ${n.name}의 값을 원래대로 되돌렸습니다.`);
  };
  document.getElementById('endGame').onclick = async () => {
    if (!confirm('게임을 종료하고 최종 결과를 발표할까요?')) return;
    await updatePath(roomCode, 'meta', { status: 'ended' });
    await log('🏁 게임이 종료되었습니다!');
  };

  const body = document.getElementById('tabBody');
  ({ nations: tabNations, trades: tabTrades, events: tabEvents, market: tabMarket, members: tabMembers, log: tabLog, admin: tabAdmin })[tab](body);
}

function tabNations(el) {
  const resources = room.resources || {};
  el.innerHTML = `<div class="grid grid-2">${Object.entries(room.nations || {}).map(([id, n]) => {
    const mem = Object.values(n.members || {});
    const stock = Object.entries(n.stock || {}).filter(([, q]) => q > 0);
    const t = detectTampering(n);
    return `<div class="card nation-card${t ? ' alert' : ''}${mem.length ? '' : ' empty'}" style="margin:0">
      <div class="card-head">
        <h3 style="display:flex;align-items:center;gap:9px">
          ${crest({ id, ...n }, { size: 'md' })} ${esc(n.name)}
          ${t ? '<span class="badge bad">⚠️ 값 이상</span>' : ''}
        </h3>
        <span class="badge ${mem.length ? 'brand' : ''}">${mem.length}명</span>
      </div>
      <div class="row" style="margin-bottom:10px">
        ${statTile({ icon: '💰', label: '현금', value: fmtShort(n.money || 0) + '원', tone: 'gold' })}
        ${statTile({ icon: '📊', label: '총자산', value: fmtShort(calcAssets(n, resources)) + '원' })}
      </div>
      <div class="tiny muted">턴당 생산: ${Object.entries(n.production || {}).map(([r, q]) => `${resources[r]?.emoji || ''}${esc(resources[r]?.name || r)} ${q}`).join(', ')}</div>
      <div class="grid grid-4" style="gap:7px;margin-top:11px">
        ${stock.length ? stock.map(([r, q]) => resourceCard(resources[r], { qty: q, id: r })).join('')
          : '<span class="tiny muted">보유 자원 없음</span>'}
      </div>
    </div>`;
  }).join('')}</div>`;
}

function tabTrades(el) {
  const resources = room.resources || {};
  const nations = room.nations || {};
  const nm = (id) => nations[id] ? `${nations[id].emoji} ${esc(nations[id].name)}` : id;
  const all = Object.entries(room.trades || {}).sort(([, a], [, b]) => (b.createdAt || 0) - (a.createdAt || 0));
  const label = { draft: ['우리 팀 검토 중', ''], proposed: ['상대 답변 대기', 'pending'], accepted: ['✅ 합의 완료', 'ok'], rejected: ['거절됨', 'no'], executed: ['체결 완료', 'ok'], failed: ['체결 실패', 'no'] };

  el.innerHTML = all.length ? all.map(([tid, t]) => {
    const [txt, cls] = label[t.status] || [t.status, ''];
    return `<div class="item ${cls}">
      <div class="item-head">
        <div>
          <b>${nm(t.from)}</b> → <b>${nm(t.to)}</b>
          &nbsp;${resources[t.resId]?.emoji || ''} ${esc(resources[t.resId]?.name || t.resId)} <b>${t.qty}</b>개
          · <b class="mono">${fmtMoney(t.totalPrice)}</b>
        </div>
        <span class="badge ${cls === 'ok' ? 'good' : cls === 'no' ? 'bad' : 'warn'}">${txt}</span>
      </div>
      <div class="tiny muted" style="margin-top:4px">
        ${t.turn}턴 · 개당 ${fmtMoney(t.totalPrice / Math.max(1, t.qty))}
        ${t.memo ? ` · 메모: ${esc(t.memo)}` : ''}
        ${t.failReason ? ` · <span class="up">${esc(t.failReason)}</span>` : ''}
      </div>
    </div>`;
  }).join('') : emptyState('trade', '아직 거래가 없어요', '학생들이 협상을 시작하면 여기에 나타나요.');
}

function tabEvents(el) {
  const mode = room.meta.mode;
  const used = Object.keys(room.usedEvents || {});
  const resIds = Object.keys(room.resources || {});
  const all = getEvents(mode);
  const avail = availableEvents(mode, used, resIds);
  const availIds = new Set(avail.map((e) => e.id));
  const recent = Object.entries(room.events || {}).sort(([, a], [, b]) => (b.ts || 0) - (a.ts || 0)).slice(0, 3);

  el.innerHTML = `
  <div class="card">
    <div class="card-head">
      <h3>🎲 이벤트 카드</h3>
      <span class="badge brand">남은 카드 ${avail.length}개 / 전체 ${all.length}개</span>
    </div>
    <p class="small muted">카드를 발동하면 시세가 바뀌고 학생 화면에 속보로 뜹니다. 한 번 쓴 카드는 다시 나오지 않아요.</p>
    <button class="block lg warn" id="randomEvent" ${avail.length ? '' : 'disabled'}>🎰 랜덤 카드 뽑기</button>
  </div>

  ${recent.length ? `<div class="card"><h3>최근 발동한 이벤트</h3>
    ${recent.map(([, e]) => `<div class="item ${e.rare ? 'ok' : ''}"><b>${esc(e.title)}</b> <span class="tiny muted">${e.turn}턴</span><div class="tiny muted">${esc(e.desc)}</div></div>`).join('')}
  </div>` : ''}

  <div class="card">
    <h3>카드 목록에서 직접 고르기</h3>
    <div class="event-list" style="margin-top:10px">
      ${all.map((e) => {
        const ok = availIds.has(e.id);
        const effects = Object.entries(e.changes).filter(([r]) => resIds.includes(r))
          .map(([r, mul]) => `<span class="${mul > 1 ? 'up' : 'down'}">${room.resources[r].emoji}${mul > 1 ? '▲' : '▼'}${Math.round(Math.abs(mul - 1) * 100)}%</span>`).join(' ');
        return `<button class="event-card ${e.rare ? 'rare' : ''}" data-ev="${e.id}" ${ok ? '' : 'disabled'}>
          <div style="font-weight:800">${e.rare ? '✨ ' : ''}${esc(e.title)} ${used.includes(e.id) ? '<span class="badge">사용함</span>' : ''}</div>
          <div class="tiny muted" style="margin:3px 0">${esc(e.desc)}</div>
          <div class="tiny">${effects || '<span class="muted">이 방에 해당 자원 없음</span>'}</div>
        </button>`;
      }).join('')}
    </div>
  </div>`;

  document.getElementById('randomEvent').onclick = () => {
    const ev = drawRandomEvent(mode, used, resIds);
    if (!ev) return toast('더 이상 뽑을 카드가 없어요.', 'bad');
    fireEvent(ev);
  };
  el.querySelectorAll('[data-ev]').forEach((b) => b.onclick = () => {
    const ev = all.find((e) => e.id === b.dataset.ev);
    if (ev) fireEvent(ev);
  });
}

function tabMarket(el) {
  const resources = room.resources || {};
  const tierName = { raw: '원자재', mid: '1차 가공품', final: '완제품' };
  const recipes = room.recipes || {};
  el.innerHTML = ['raw', 'mid', 'final'].map((tier) => {
    const items = Object.entries(resources).filter(([, r]) => r.tier === tier);
    if (!items.length) return '';
    return `<div class="card"><h3>${tierName[tier]}</h3>
      <div class="table-scroll"><table>
        <thead><tr><th>자원</th><th class="num">현재 시세</th><th class="num">기준 대비</th><th>재료</th></tr></thead>
        <tbody>${items.map(([id, r]) => {
          const diff = r.basePrice / (r.originalPrice || r.basePrice);
          const rec = Object.values(recipes).find((x) => x.out === id);
          return `<tr>
            <td>${r.emoji} ${esc(r.name)} <span class="tiny muted">/${esc(r.unit)}</span></td>
            <td class="num"><b>${fmtMoney(r.basePrice)}</b></td>
            <td class="num ${diff > 1.01 ? 'up' : diff < 0.99 ? 'down' : 'muted'}">${diff === 1 ? '-' : `${diff > 1 ? '+' : ''}${Math.round((diff - 1) * 100)}%`}</td>
            <td class="tiny muted">${rec ? Object.entries(rec.inputs).map(([r2, q]) => `${resources[r2]?.emoji || ''}${esc(resources[r2]?.name || r2)}×${q}`).join(' + ') : '-'}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>`;
  }).join('');
}

function tabMembers(el) {
  const nations = room.nations || {};
  const c = room.contrib || {};
  el.innerHTML = `<div class="card">
    <h3>👥 모둠원 참여도</h3>
    <p class="small muted">누가 얼마나 활동했는지 확인해 평가 자료로 활용하세요.</p>
    ${Object.entries(nations).filter(([, n]) => Object.keys(n.members || {}).length).map(([nid, n]) => `
      <h4 style="margin-top:16px">${n.emoji} ${esc(n.name)}</h4>
      <div class="table-scroll"><table>
        <thead><tr><th>이름</th><th>역할</th><th class="num">거래 제안</th><th class="num">투표</th><th class="num">제작</th><th class="num">회의 발언</th><th class="num">합계</th></tr></thead>
        <tbody>${Object.entries(n.members).map(([pid, p]) => {
          const s = c[nid]?.[pid] || {};
          const total = (s.proposals || 0) + (s.votes || 0) + (s.crafts || 0) + (s.messages || 0);
          return `<tr><td><b>${esc(p.name)}</b></td><td class="tiny">${roleEmoji(p.role)} ${esc(ROLES.find((r) => r.id === p.role)?.name || '-')}</td>
            <td class="num">${s.proposals || 0}</td><td class="num">${s.votes || 0}</td><td class="num">${s.crafts || 0}</td><td class="num">${s.messages || 0}</td>
            <td class="num"><b>${total}</b></td></tr>`;
        }).join('')}</tbody>
      </table></div>`).join('') || '<p class="muted">참가자가 없어요.</p>'}
  </div>`;
}

function tabLog(el) {
  const logs = Object.entries(room.log || {}).sort(([, a], [, b]) => (b.ts || 0) - (a.ts || 0));
  el.innerHTML = `<div class="card"><h3>📜 진행 기록</h3>
    <div class="table-scroll" style="max-height:520px">
      ${logs.map(([, l]) => `<div style="padding:6px 0;border-bottom:1px solid var(--line)">
        <span class="badge">${l.turn}턴</span> ${esc(l.text)}</div>`).join('') || '<p class="muted">기록이 없어요.</p>'}
    </div></div>`;
}

function tabAdmin(el) {
  const nations = room.nations || {};
  const resources = room.resources || {};
  el.innerHTML = `<div class="card">
    <h3>⚙️ 수동 조정</h3>
    <p class="small muted">진행이 꼬였을 때 특정 나라의 돈이나 자원을 직접 조정할 수 있어요. 조정 내역은 기록에 남습니다.</p>
    <div class="field"><label>대상</label>
      <select id="adjNation">${Object.entries(nations).map(([id, n]) => `<option value="${id}">${n.emoji} ${esc(n.name)}</option>`).join('')}</select>
    </div>
    <div class="field"><label>무엇을</label>
      <select id="adjWhat"><option value="money">💰 현금</option>
        ${Object.entries(resources).map(([id, r]) => `<option value="${id}">${r.emoji} ${esc(r.name)}</option>`).join('')}</select>
    </div>
    <div class="field"><label>얼마나 (음수면 차감)</label><input type="number" id="adjAmt" value="0"></div>
    <button id="doAdjust">적용하기</button>
  </div>
  <div class="card">
    <h3>🗑️ 방 관리</h3>
    <button class="danger" id="delRoom2">방 완전히 삭제하기</button>
    <div class="tiny muted" style="margin-top:6px">모든 데이터가 사라지고 학생들도 나가집니다.</div>
  </div>`;

  document.getElementById('doAdjust').onclick = async () => {
    const nid = document.getElementById('adjNation').value;
    const what = document.getElementById('adjWhat').value;
    const amt = parseInt(document.getElementById('adjAmt').value) || 0;
    if (!amt) return;
    const n = JSON.parse(JSON.stringify(room.nations[nid]));
    if (what === 'money') {
      n.money = Math.max(0, (n.money || 0) + amt);
      await updatePath(roomCode, `nations/${nid}`, { money: n.money, guard: makeGuard(n) });
      await log(`⚙️ 교사 조정: ${n.emoji} ${n.name} 현금 ${amt > 0 ? '+' : ''}${fmtMoney(amt)}`);
    } else {
      n.stock = n.stock || {};
      n.stock[what] = Math.max(0, (n.stock[what] || 0) + amt);
      await updatePath(roomCode, `nations/${nid}`, { stock: n.stock, guard: makeGuard(n) });
      await log(`⚙️ 교사 조정: ${n.emoji} ${n.name} ${resources[what].name} ${amt > 0 ? '+' : ''}${amt}`);
    }
    document.getElementById('adjAmt').value = 0;
    toast('⚙️ 적용했어요.', 'good');
  };
  document.getElementById('delRoom2').onclick = deleteRoom;
}

// ---- 종료 화면 ----
function renderEnded() {
  const resources = room.resources || {};
  const board = leaderboard(room.nations || {}, resources);
  const start = room.meta.startingMoney || 0;
  const medal = ['🥇', '🥈', '🥉'];

  app.innerHTML = `
  <div class="card center">
    <h1>🏁 최종 결과</h1>
    <p class="muted">${room.meta.turn - 1}턴 동안의 무역이 끝났습니다!</p>
  </div>
  <div class="card">
    <h2>🏆 최종 순위</h2>
    <div class="table-scroll"><table>
      <thead><tr><th>순위</th><th>나라</th><th class="num">현금</th><th class="num">자원 가치</th><th class="num">총자산</th><th class="num">시작 대비</th></tr></thead>
      <tbody>${board.map((b, i) => {
        const growth = start ? ((b.assets - start) / start) * 100 : 0;
        return `<tr>
          <td><b>${medal[i] || i + 1}</b></td>
          <td><b>${b.emoji} ${esc(b.name)}</b></td>
          <td class="num">${fmtMoney(b.money)}</td>
          <td class="num">${fmtMoney(b.assets - b.money)}</td>
          <td class="num"><b>${fmtMoney(b.assets)}</b></td>
          <td class="num ${growth >= 0 ? 'up' : 'down'}">${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%</td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>
  </div>
  <div class="card">
    <h3>📜 전체 기록</h3>
    <div class="table-scroll" style="max-height:400px">
      ${Object.entries(room.log || {}).sort(([, a], [, b]) => (a.ts || 0) - (b.ts || 0))
        .map(([, l]) => `<div style="padding:5px 0;border-bottom:1px solid var(--line)"><span class="badge">${l.turn}턴</span> ${esc(l.text)}</div>`).join('')}
    </div>
  </div>
  <div class="row">
    <button class="ghost" id="reopen">게임 다시 진행하기</button>
    <button class="danger" id="delRoom3">방 삭제하기</button>
  </div>`;

  document.getElementById('reopen').onclick = async () => {
    await updatePath(roomCode, 'meta', { status: 'playing' });
  };
  document.getElementById('delRoom3').onclick = deleteRoom;
}

// ============================================================
// 3. 동작
// ============================================================

async function advanceTurn() {
  if (busy) return;
  const m = room.meta;
  const accepted = Object.values(room.trades || {}).filter((t) => t.status === 'accepted').length;
  const queued = Object.values(room.crafts || {}).filter((c) => c.status === 'queued').length;
  if (!confirm(`${m.turn}턴을 진행할까요?\n\n· 합의된 거래 ${accepted}건이 체결됩니다\n· 모든 나라가 특산품을 생산합니다${Object.keys(room.recipes || {}).length ? `\n· 예약된 제작 ${queued}건이 실행됩니다` : ''}\n\n되돌릴 수 없어요.`)) return;

  busy = true;
  render();
  try {
    const result = processTurn(room);
    const updates = {};
    for (const [nid, n] of Object.entries(result.nations)) {
      updates[`nations/${nid}/money`] = n.money;
      updates[`nations/${nid}/stock`] = n.stock || {};
      updates[`nations/${nid}/guard`] = makeGuard(n);
    }
    for (const [tid, s] of Object.entries(result.tradeStatus)) {
      updates[`trades/${tid}/status`] = s.status;
      if (s.failReason) updates[`trades/${tid}/failReason`] = s.failReason;
    }
    for (const [cid, s] of Object.entries(result.craftStatus)) {
      updates[`crafts/${cid}/status`] = s.status;
      if (s.failReason) updates[`crafts/${cid}/failReason`] = s.failReason;
    }
    // 미합의 상태로 남은 제안은 만료 처리
    for (const [tid, t] of Object.entries(room.trades || {})) {
      if (t.status === 'draft' || t.status === 'proposed') updates[`trades/${tid}/status`] = 'expired';
    }
    updates['meta/turn'] = m.turn + 1;
    await multiUpdate(roomCode, updates);

    for (const text of result.logs) await log(text, m.turn);
    await log(`▶️ ${m.turn + 1}턴이 시작되었습니다. 새로운 협상을 시작하세요!`, m.turn + 1);
  } catch (err) {
    alert('턴 진행 중 문제가 발생했어요: ' + err.message);
  } finally {
    busy = false;
    render();
  }
}

async function fireEvent(ev) {
  if (!confirm(`「${ev.title}」 카드를 발동할까요?\n\n${ev.desc}`)) return;
  const applied = applyEventChanges(room.resources || {}, ev.changes);
  if (Object.keys(applied).length === 0) return toast('이 방에는 해당 자원이 없어 적용할 수 없어요.', 'bad');

  const updates = {};
  for (const [rid, { after }] of Object.entries(applied)) updates[`resources/${rid}/basePrice`] = after;
  updates[`usedEvents/${ev.id}`] = true;
  const eid = genId('e_');
  updates[`events/${eid}`] = {
    title: ev.title, desc: ev.desc, rare: !!ev.rare, cat: eventCategory(ev), turn: room.meta.turn, ts: Date.now(),
    applied: Object.fromEntries(Object.entries(applied).map(([r, v]) => [r, v.after])),
    before: Object.fromEntries(Object.entries(applied).map(([r, v]) => [r, v.before])),
  };
  await multiUpdate(roomCode, updates);

  const summary = Object.entries(applied)
    .map(([r, v]) => `${room.resources[r].name} ${fmtMoney(v.before)}→${fmtMoney(v.after)}`).join(', ');
  await log(`🎲 이벤트「${ev.title}」 발동! ${summary}`);
}

async function log(text, turn) {
  await pushTo(roomCode, 'log', { text, turn: turn ?? room?.meta?.turn ?? 1, ts: Date.now() });
}

async function deleteRoom() {
  if (!confirm('정말 이 방을 삭제할까요? 모든 데이터가 사라집니다.')) return;
  if (unsub) unsub();
  await writePath(roomCode, '', null);
  clearTeacher();
  location.reload();
}

function copy(text, msg) {
  navigator.clipboard?.writeText(text).then(
    () => toast(msg, 'good'),
    () => prompt('복사해서 사용하세요:', text)
  );
}

// QR 코드 생성 — 라이브러리는 필요할 때만 CDN에서 불러온다.
// 네트워크가 막혀 실패해도 코드·링크가 그대로 있으므로 안내만 바꾼다.
let _qrLib = null;
async function renderQR(box, text) {
  if (!box) return;
  try {
    if (!_qrLib) {
      const mod = await import('https://esm.sh/qrcode@1.5.4');
      _qrLib = mod.default || mod;
    }
    const dataUrl = await _qrLib.toDataURL(text, {
      width: 260, margin: 1, errorCorrectionLevel: 'M',
      color: { dark: '#14203a', light: '#ffffff' },
    });
    box.innerHTML = `<img src="${dataUrl}" alt="학생 입장 QR 코드" width="220" height="220">`;
  } catch (err) {
    box.innerHTML = '<div class="tiny muted">QR을 못 불러왔어요.<br>옆의 코드나 링크를 이용해 주세요.</div>';
  }
}

// 모든 선언이 끝난 뒤 시작 (Firebase 미설정이면 안내 화면만 남긴다)
if (initDb()) boot().catch((err) => {
  console.error(err);
  app.innerHTML = `<div class="card"><h2>문제가 발생했어요</h2><p class="small">${esc(err.message)}</p>
    <p class="small muted">Firebase 설정(<code>js/firebase-config.js</code>)이 올바른지 확인해 주세요.</p></div>`;
});
