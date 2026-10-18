// ============================================================
// Firebase Realtime Database 연동 계층
// ============================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase, ref, set, get, update, remove, onValue, push, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { firebaseConfig, isConfigured } from './firebase-config.js';

let db = null;
let ready = null; // 익명 로그인 완료 Promise (보안 규칙이 auth != null 을 요구)

export function initDb() {
  if (!isConfigured()) {
    showConfigError();
    return null;
  }
  if (!db) {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    ready = signInAnonymously(getAuth(app)).catch((err) => {
      // 콘솔에서 익명 로그인을 켜지 않았을 때 가장 흔히 나는 오류
      throw new Error(`Firebase 익명 로그인에 실패했어요 (${err.code || err.message}). `
        + 'Firebase 콘솔 → Authentication → 로그인 방법에서 "익명"을 사용 설정해 주세요.');
    });
  }
  return db;
}

// 모든 DB 작업은 로그인이 끝난 뒤에 실행한다
async function authed() {
  initDb();
  await ready;
  return db;
}

function showConfigError() {
  document.body.innerHTML = `
    <div class="config-error">
      <h1>⚙️ Firebase 설정이 필요해요</h1>
      <p><code>js/firebase-config.js</code> 파일에 Firebase 프로젝트 설정값을 넣어주세요.</p>
      <ol>
        <li><a href="https://console.firebase.google.com" target="_blank" rel="noopener">Firebase 콘솔</a>에서 프로젝트를 만듭니다 (무료).</li>
        <li>왼쪽 메뉴 <b>빌드 → Realtime Database</b> → <b>데이터베이스 만들기</b>를 누르고, <b>규칙</b> 탭에 <code>database.rules.json</code> 내용을 붙여넣어 게시합니다.</li>
        <li><b>빌드 → Authentication → 로그인 방법</b>에서 <b>익명</b>을 사용 설정합니다.</li>
        <li>톱니바퀴 <b>프로젝트 설정 → 일반 → 내 앱</b>에서 웹 앱(<code>&lt;/&gt;</code>)을 추가합니다.</li>
        <li>화면에 나오는 <code>firebaseConfig</code> 값을 <code>js/firebase-config.js</code>에 붙여넣고 저장한 뒤 새로고침하세요.</li>
      </ol>
      <p>자세한 안내는 <code>README.md</code>에 있습니다.</p>
    </div>`;
}

// ---------- 경로 헬퍼 ----------

export const roomRef = (code, path = '') => ref(initDb(), `rooms/${code}${path ? '/' + path : ''}`);

export async function readPath(code, path = '') {
  await authed();
  const snap = await get(roomRef(code, path));
  return snap.exists() ? snap.val() : null;
}

// 로그인 전에 불려도 되도록, 구독은 로그인 후 시작하고 해제 함수는 바로 돌려준다
export function watch(code, path, cb) {
  let off = null, cancelled = false;
  authed().then(() => {
    if (!cancelled) off = onValue(roomRef(code, path), (snap) => cb(snap.exists() ? snap.val() : null));
  });
  return () => { cancelled = true; if (off) off(); };
}

export async function writePath(code, path, value) {
  await authed();
  await set(roomRef(code, path), value);
}

export async function updatePath(code, path, value) {
  await authed();
  await update(roomRef(code, path), value);
}

export async function removePath(code, path) {
  await authed();
  await remove(roomRef(code, path));
}

// 여러 경로 동시 갱신 (예: {'nations/korea/money': 100, 'meta/turn': 2})
export async function multiUpdate(code, updates) {
  await authed();
  await update(roomRef(code), updates);
}

export async function pushTo(code, path, value) {
  await authed();
  const r = push(roomRef(code, path));
  await set(r, value);
  return r.key;
}

export async function roomExists(code) {
  await authed();
  const snap = await get(roomRef(code, 'meta'));
  return snap.exists();
}

// ---------- 방 밖의 경로 (방 목록 등) ----------

export async function readAny(path) {
  await authed();
  const snap = await get(ref(initDb(), path));
  return snap.exists() ? snap.val() : null;
}

export async function writeAny(path, value) {
  await authed();
  await set(ref(initDb(), path), value);
}

// ---------- 방 목록 (오래된 방 자동 정리용) ----------
// roomIndex/{만든 날(1970년 이후 일수)}/{방코드} = 만든 시각
// 보안 규칙상 만든 지 2일이 지난 날짜 묶음만 읽을 수 있어, 진행 중인 방 코드는 노출되지 않는다.

export const dayKey = (ms) => String(Math.floor(ms / 86400000));

export async function indexRoom(code, createdAt) {
  await writeAny(`roomIndex/${dayKey(createdAt)}/${code}`, createdAt);
}

// fromDay ~ toDay(포함) 날짜 묶음에 들어 있는 [날짜, 방코드] 목록
export async function readIndexedRooms(fromDay, toDay) {
  const out = [];
  for (let d = fromDay; d <= toDay; d++) {
    const day = await readAny(`roomIndex/${d}`);
    for (const code of Object.keys(day || {})) out.push([String(d), code]);
  }
  return out;
}

export { serverTimestamp };

// ---------- 로컬 신원 저장 ----------

const K = {
  playerId: 'trade_player_id',
  session: 'trade_session',   // { code, nationId, name, role }
  teacher: 'trade_teacher',   // { code, token }
};

export function getPlayerId() {
  let id = localStorage.getItem(K.playerId);
  if (!id) {
    id = 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem(K.playerId, id);
  }
  return id;
}

export function saveSession(s) { localStorage.setItem(K.session, JSON.stringify(s)); }
export function loadSession() {
  try { return JSON.parse(localStorage.getItem(K.session)); } catch { return null; }
}
export function clearSession() { localStorage.removeItem(K.session); }

export function saveTeacher(t) { localStorage.setItem(K.teacher, JSON.stringify(t)); }
export function loadTeacher() {
  try { return JSON.parse(localStorage.getItem(K.teacher)); } catch { return null; }
}
export function clearTeacher() { localStorage.removeItem(K.teacher); }
