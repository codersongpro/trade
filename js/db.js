// ============================================================
// Firebase Realtime Database 연동 계층
// ============================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase, ref, set, get, update, remove, onValue, push, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import { firebaseConfig, isConfigured } from './firebase-config.js';

let db = null;

export function initDb() {
  if (!isConfigured()) {
    showConfigError();
    return null;
  }
  if (!db) {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  }
  return db;
}

function showConfigError() {
  document.body.innerHTML = `
    <div class="config-error">
      <h1>⚙️ Firebase 설정이 필요해요</h1>
      <p><code>js/firebase-config.js</code> 파일에 Firebase 프로젝트 설정값을 넣어주세요.</p>
      <ol>
        <li><a href="https://console.firebase.google.com" target="_blank" rel="noopener">Firebase 콘솔</a>에서 프로젝트를 만듭니다 (무료).</li>
        <li>왼쪽 메뉴 <b>빌드 → Realtime Database</b> → <b>데이터베이스 만들기</b> → <b>테스트 모드로 시작</b>을 선택합니다.</li>
        <li>톱니바퀴 <b>프로젝트 설정 → 일반 → 내 앱</b>에서 웹 앱(<code>&lt;/&gt;</code>)을 추가합니다.</li>
        <li>화면에 나오는 <code>firebaseConfig</code> 값을 <code>js/firebase-config.js</code>에 붙여넣고 저장한 뒤 새로고침하세요.</li>
      </ol>
      <p>자세한 안내는 <code>README.md</code>에 있습니다.</p>
    </div>`;
}

// ---------- 경로 헬퍼 ----------

export const roomRef = (code, path = '') => ref(initDb(), `rooms/${code}${path ? '/' + path : ''}`);

export async function readPath(code, path = '') {
  const snap = await get(roomRef(code, path));
  return snap.exists() ? snap.val() : null;
}

export function watch(code, path, cb) {
  return onValue(roomRef(code, path), (snap) => cb(snap.exists() ? snap.val() : null));
}

export async function writePath(code, path, value) {
  await set(roomRef(code, path), value);
}

export async function updatePath(code, path, value) {
  await update(roomRef(code, path), value);
}

export async function removePath(code, path) {
  await remove(roomRef(code, path));
}

// 여러 경로 동시 갱신 (예: {'nations/korea/money': 100, 'meta/turn': 2})
export async function multiUpdate(code, updates) {
  await update(roomRef(code), updates);
}

export async function pushTo(code, path, value) {
  const r = push(roomRef(code, path));
  await set(r, value);
  return r.key;
}

export async function roomExists(code) {
  const snap = await get(roomRef(code, 'meta'));
  return snap.exists();
}

// ---------- 방 밖의 경로 (방 목록 등) ----------

export async function readAny(path) {
  const snap = await get(ref(initDb(), path));
  return snap.exists() ? snap.val() : null;
}

export async function writeAny(path, value) {
  await set(ref(initDb(), path), value);
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
