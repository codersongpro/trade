// 미리보기 전용: db.js를 대체하는 가짜(인메모리) 데이터베이스.
// 여러 iframe이 window.top의 저장소를 공유해 실시간 동기화를 흉내낸다.
// Firebase 없이 게임 전체를 체험할 수 있지만, 창을 닫으면 데이터는 사라진다.

const T = window.top;
if (!T.__MOCK__) T.__MOCK__ = { rooms: {}, watchers: [], seq: 0 };
const M = T.__MOCK__;

const clone = (v) => (v === undefined ? null : JSON.parse(JSON.stringify(v)));

function node(code, path, create = false) {
  if (!M.rooms[code] && create) M.rooms[code] = {};
  let cur = M.rooms[code];
  if (!path) return cur;
  const parts = path.split('/').filter(Boolean);
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur == null) return null;
    if (cur[parts[i]] == null) { if (!create) return null; cur[parts[i]] = {}; }
    cur = cur[parts[i]];
  }
  return { parent: cur, key: parts[parts.length - 1] };
}

function readAt(code, path) {
  if (!path) return M.rooms[code] ?? null;
  let cur = M.rooms[code];
  for (const p of path.split('/').filter(Boolean)) {
    if (cur == null) return null;
    cur = cur[p];
  }
  return cur ?? null;
}

function notify() {
  M.seq++;
  for (const w of [...M.watchers]) w.cb(clone(readAt(w.code, w.path)));
}

export function initDb() { return M; }
export const roomRef = () => null;

export async function readPath(code, path = '') { return clone(readAt(code, path)); }

export function watch(code, path, cb) {
  const w = { code, path, cb };
  M.watchers.push(w);
  cb(clone(readAt(code, path)));
  return () => { M.watchers = M.watchers.filter((x) => x !== w); };
}

export async function writePath(code, path, value) {
  if (!path) {
    if (value === null) delete M.rooms[code]; else M.rooms[code] = clone(value);
  } else {
    const n = node(code, path, true);
    if (value === null) delete n.parent[n.key]; else n.parent[n.key] = clone(value);
  }
  notify();
}

export async function updatePath(code, path, value) {
  for (const [k, v] of Object.entries(value)) {
    const full = path ? `${path}/${k}` : k;
    const n = node(code, full, true);
    if (v === null) delete n.parent[n.key]; else n.parent[n.key] = clone(v);
  }
  notify();
}

export async function removePath(code, path) {
  const n = node(code, path);
  if (n?.parent) delete n.parent[n.key];
  notify();
}

export async function multiUpdate(code, updates) { await updatePath(code, '', updates); }

export async function pushTo(code, path, value) {
  const key = 'k_' + (M.seq++) + '_' + Math.random().toString(36).slice(2, 6);
  await updatePath(code, path, { [key]: value });
  return key;
}

export async function roomExists(code) { return !!M.rooms[code]; }

// 방 밖의 경로 (미리보기에서는 방 목록만 흉내 낸다)
export async function readAny(path) {
  if (path === 'roomIndex') return clone(M.roomIndex || null);
  return null;
}
export async function writeAny(path, value) {
  const m = path.match(/^roomIndex\/(.+)$/);
  if (m) { M.roomIndex ||= {}; if (value === null) delete M.roomIndex[m[1]]; else M.roomIndex[m[1]] = clone(value); return; }
  const r = path.match(/^rooms\/([^/]+)$/);
  if (r && value === null) { delete M.rooms[r[1]]; notify(); }
}
export const serverTimestamp = () => Date.now();

// 로컬 신원: iframe 이름으로 플레이어를 구분한다
const who = window.name || 'anon';
const KS = { pid: `mock_pid_${who}`, ses: `mock_ses_${who}`, tch: `mock_tch_${who}` };

export function getPlayerId() {
  let id = sessionStorage.getItem(KS.pid);
  if (!id) { id = 'p_' + who + '_' + Math.random().toString(36).slice(2, 6); sessionStorage.setItem(KS.pid, id); }
  return id;
}
export function saveSession(s) { sessionStorage.setItem(KS.ses, JSON.stringify(s)); }
export function loadSession() { try { return JSON.parse(sessionStorage.getItem(KS.ses)); } catch { return null; } }
export function clearSession() { sessionStorage.removeItem(KS.ses); }
export function saveTeacher(t) { sessionStorage.setItem(KS.tch, JSON.stringify(t)); }
export function loadTeacher() { try { return JSON.parse(sessionStorage.getItem(KS.tch)); } catch { return null; } }
export function clearTeacher() { sessionStorage.removeItem(KS.tch); }
