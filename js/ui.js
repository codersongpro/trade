// ============================================================
// 공용 UI 컴포넌트 — 교사·학생 화면이 함께 쓰는 마크업 조각
// 모든 함수는 HTML 문자열을 돌려준다 (프레임워크 없음)
// ============================================================

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- 자원 등급 ----------
// 원자재 → 가공품 → 완제품으로 갈수록 희귀한 카드처럼 보이게 한다

export const TIERS = {
  raw:   { label: '원자재', short: '원', cls: 'tier-raw' },
  mid:   { label: '가공품', short: '가', cls: 'tier-mid' },
  final: { label: '완제품', short: '완', cls: 'tier-final' },
};

export function tierOf(res) { return TIERS[res?.tier] || TIERS.raw; }

// 자원 한 칸. 창고·거래·시세 어디서나 같은 모습으로 쓴다.
// opts: { qty, price, dim, sub }
export function resourceCard(res, opts = {}) {
  if (!res) return '';
  const t = tierOf(res);
  const { qty, price, dim, sub } = opts;
  return `<div class="res-card ${t.cls}${dim ? ' is-dim' : ''}">
    <span class="res-face">${res.emoji || '📦'}</span>
    <span class="res-body">
      <span class="res-name">${esc(res.name)}</span>
      ${price != null ? `<span class="res-sub mono">${fmtWon(price)}<span class="res-unit">/${esc(res.unit || '')}</span></span>`
        : sub ? `<span class="res-sub">${sub}</span>` : ''}
    </span>
    ${qty != null ? `<span class="res-qty mono">${qty}</span>` : ''}
  </div>`;
}

// ---------- 참가 단위 명칭 ----------
// 세계 모드는 '나라', 한국 모드는 단위(시군구/시도)에 따라 '지역' 또는 '시·도'

export function regionWord(mode, scale) {
  if (mode !== 'city') return '나라';
  return scale === 'province' ? '시·도' : '지역';
}

export function regionLabel(meta) { return regionWord(meta?.mode, meta?.scale); }

// ---------- 숫자·금액 ----------

export function fmtWon(n) {
  return `${Math.round(n).toLocaleString('ko-KR')}원`;
}

// 큰 금액을 "52만" 처럼 짧게 (좁은 화면의 요약 타일용)
export function fmtShort(n) {
  const v = Math.round(n);
  if (Math.abs(v) >= 100000000) return `${(v / 100000000).toFixed(1).replace(/\.0$/, '')}억`;
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(v % 10000 === 0 ? 0 : 1).replace(/\.0$/, '')}만`;
  return v.toLocaleString('ko-KR');
}

// ---------- 국가 문장(크레스트) ----------
// 윈도우 PC에서는 국기 이모지(🇰🇷)가 "KR" 두 글자로 보인다.
// 그래서 이름에서 고유한 색을 뽑아 테두리에 입혀, 이모지가 안 보여도
// 색만으로 어느 나라인지 구분되게 한다.

export function nationHue(nation) {
  const key = String(nation?.id || nation?.name || '');
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 360;
  return h;
}

export function crest(nation, opts = {}) {
  const { size = 'md', rank } = opts;
  const hue = nationHue(nation);
  const style = `--nation-h:${hue}`;
  return `<span class="crest crest-${size}${rank ? ` crest-rank${rank}` : ''}" style="${style}">
    <span class="crest-face">${nation?.emoji || '🏳️'}</span>
    ${rank && rank <= 3 ? `<span class="crest-medal">${['🥇', '🥈', '🥉'][rank - 1]}</span>` : ''}
  </span>`;
}

// ---------- 요약 타일 ----------
// tone: 'gold' | 'good' | 'bad' | 'plain'
export function statTile({ icon, label, value, sub, tone = 'plain', id }) {
  return `<div class="stat-tile tone-${tone}">
    ${icon ? `<span class="stat-icon">${icon}</span>` : ''}
    <span class="stat-text">
      <span class="stat-label">${esc(label)}</span>
      <span class="stat-value mono"${id ? ` id="${id}"` : ''}>${value}</span>
      ${sub ? `<span class="stat-sub">${sub}</span>` : ''}
    </span>
  </div>`;
}

// ---------- 진행 막대 ----------
// tone: 'good' | 'brand' | 'gold'
export function meter(pct, tone = 'good') {
  const p = Math.max(0, Math.min(100, pct));
  return `<span class="meter"><span class="meter-fill tone-${tone}" style="width:${p}%"></span></span>`;
}

// ---------- 빈 상태 ----------

const EMPTY_ART = {
  box: '📦', trade: '🤝', craft: '🏭', chat: '💬', news: '📰', people: '👥',
};

export function emptyState(kind, title, desc = '') {
  return `<div class="empty">
    <div class="empty-art">${EMPTY_ART[kind] || '📭'}</div>
    <div class="empty-title">${esc(title)}</div>
    ${desc ? `<div class="empty-desc">${esc(desc)}</div>` : ''}
  </div>`;
}

// ---------- 시상대 ----------
// board: [{ name, emoji, assets }] — 상위 3개만 쓴다
export function podium(board, myId) {
  if (board.length < 2) return '';
  const order = [1, 0, 2]; // 2등 · 1등 · 3등 순으로 배치
  return `<div class="podium">
    ${order.filter((i) => board[i]).map((i) => {
      const b = board[i];
      return `<div class="podium-col podium-${i + 1}${b.id === myId ? ' is-me' : ''}">
        <div class="podium-crest">${crest(b, { size: 'lg', rank: i + 1 })}</div>
        <div class="podium-name">${esc(b.name)}</div>
        <div class="podium-val mono">${fmtShort(b.assets)}원</div>
        <div class="podium-block"><span>${i + 1}</span></div>
      </div>`;
    }).join('')}
  </div>`;
}

// ---------- 숫자 카운트업 ----------
// 돈이 늘어나는 걸 눈으로 보게 해서 성취감을 준다
export function countUp(el, to, { duration = 700, suffix = '원' } = {}) {
  if (!el) return;
  const from = Number(el.dataset.value ?? to);
  el.dataset.value = to;
  if (from === to) { el.textContent = to.toLocaleString('ko-KR') + suffix; return; }
  el.classList.remove('bump-up', 'bump-down');
  void el.offsetWidth; // 애니메이션 재시작
  el.classList.add(to > from ? 'bump-up' : 'bump-down');

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = to.toLocaleString('ko-KR') + suffix;
    return;
  }
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - t0) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * eased).toLocaleString('ko-KR') + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------- 화면 알림(토스트) ----------
// alert() 대신 흐름을 끊지 않고 알려준다
export function toast(message, tone = 'info') {
  let host = document.querySelector('.toast-host');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toast-host';
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = `toast tone-${tone}`;
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 320); }, 2600);
}
