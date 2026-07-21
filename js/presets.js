// ============================================================
// 무역 게임 프리셋 데이터
// 자원 3계층: raw(원자재) → mid(1차 가공품) → final(완제품)
// 가격 단위: 원(₩)
//
// [밸런스 규칙]
// 모든 나라의 턴당 생산 가치(Σ 생산량 × 기준가)를 약 5만원 ±10%로 맞춘다.
// 개발 중 검증: 콘솔에서 checkBalance() 실행
// ============================================================

// ---------- 세계 국가 모드 ----------

export const WORLD_RESOURCES = {
  // 원자재 (tier: raw)
  oil:        { name: '석유',     emoji: '🛢️', unit: '배럴', tier: 'raw', basePrice: 8000 },
  gas:        { name: '천연가스', emoji: '🔥', unit: '톤',   tier: 'raw', basePrice: 6000 },
  coal:       { name: '석탄',     emoji: '⚫', unit: '톤',   tier: 'raw', basePrice: 5000 },
  iron_ore:   { name: '철광석',   emoji: '🪨', unit: '톤',   tier: 'raw', basePrice: 7000 },
  copper:     { name: '구리',     emoji: '🥉', unit: '톤',   tier: 'raw', basePrice: 12000 },
  lithium:    { name: '리튬',     emoji: '🔋', unit: '톤',   tier: 'raw', basePrice: 15000 },
  rare_earth: { name: '희토류',   emoji: '💎', unit: '톤',   tier: 'raw', basePrice: 20000 },
  silicon:    { name: '규소',     emoji: '🧪', unit: '톤',   tier: 'raw', basePrice: 6000 },
  wheat:      { name: '밀',       emoji: '🌾', unit: '톤',   tier: 'raw', basePrice: 3000 },
  rice:       { name: '쌀',       emoji: '🍚', unit: '톤',   tier: 'raw', basePrice: 4000 },
  coffee:     { name: '커피원두', emoji: '☕', unit: '자루', tier: 'raw', basePrice: 5000 },
  cacao:      { name: '카카오',   emoji: '🍫', unit: '자루', tier: 'raw', basePrice: 5000 },
  sugarcane:  { name: '사탕수수', emoji: '🎋', unit: '톤',   tier: 'raw', basePrice: 2000 },
  grape:      { name: '포도',     emoji: '🍇', unit: '상자', tier: 'raw', basePrice: 3000 },
  cotton:     { name: '면화',     emoji: '☁️', unit: '더미', tier: 'raw', basePrice: 3000 },
  rubber:     { name: '고무',     emoji: '🛞', unit: '톤',   tier: 'raw', basePrice: 4000 },
  timber:     { name: '목재',     emoji: '🪵', unit: '톤',   tier: 'raw', basePrice: 5000 },
  seafood:    { name: '수산물',   emoji: '🐟', unit: '상자', tier: 'raw', basePrice: 6000 },
  beef:       { name: '소고기',   emoji: '🥩', unit: '상자', tier: 'raw', basePrice: 10000 },

  // 1차 가공품 (tier: mid) — 재료비 대비 30~40% 이윤
  steel:      { name: '철강',     emoji: '🏗️', unit: '톤',   tier: 'mid', basePrice: 26000 },
  plastic:    { name: '플라스틱', emoji: '🧴', unit: '톤',   tier: 'mid', basePrice: 22000 },
  chip:       { name: '반도체',   emoji: '💾', unit: '상자', tier: 'mid', basePrice: 45000 },
  battery:    { name: '배터리',   emoji: '🪫', unit: '개',   tier: 'mid', basePrice: 58000 },
  fabric:     { name: '원단',     emoji: '🧵', unit: '롤',   tier: 'mid', basePrice: 13000 },
  sugar:      { name: '설탕',     emoji: '🧂', unit: '포대', tier: 'mid', basePrice: 9000 },
  flour:      { name: '밀가루',   emoji: '🫓', unit: '포대', tier: 'mid', basePrice: 8500 },
  wine:       { name: '와인',     emoji: '🍷', unit: '상자', tier: 'mid', basePrice: 14000 },
  tire:       { name: '타이어',   emoji: '⭕', unit: '세트', tier: 'mid', basePrice: 12000 },
  furniture:  { name: '가구',     emoji: '🪑', unit: '세트', tier: 'mid', basePrice: 21000 },

  // 완제품 (tier: final)
  car:        { name: '자동차',   emoji: '🚗', unit: '대',   tier: 'final', basePrice: 170000 },
  phone:      { name: '스마트폰', emoji: '📱', unit: '상자', tier: 'final', basePrice: 175000 },
  airplane:   { name: '항공기',   emoji: '✈️', unit: '대',   tier: 'final', basePrice: 280000 },
  clothes:    { name: '의류',     emoji: '👕', unit: '상자', tier: 'final', basePrice: 38000 },
  chocolate:  { name: '초콜릿',   emoji: '🍬', unit: '상자', tier: 'final', basePrice: 28000 },
  bread:      { name: '빵·과자',  emoji: '🥐', unit: '상자', tier: 'final', basePrice: 37000 },
  canned:     { name: '수산물 통조림', emoji: '🥫', unit: '상자', tier: 'final', basePrice: 54000 },
};

// 레시피: inputs 자원을 소모해 out 자원을 outQty 만큼 생산
export const WORLD_RECIPES = {
  r_steel:     { out: 'steel',     outQty: 1, inputs: { iron_ore: 2, coal: 1 } },
  r_plastic:   { out: 'plastic',   outQty: 1, inputs: { oil: 2 } },
  r_chip:      { out: 'chip',      outQty: 1, inputs: { silicon: 2, rare_earth: 1 } },
  r_battery:   { out: 'battery',   outQty: 1, inputs: { lithium: 2, copper: 1 } },
  r_fabric:    { out: 'fabric',    outQty: 1, inputs: { cotton: 3 } },
  r_sugar:     { out: 'sugar',     outQty: 1, inputs: { sugarcane: 3 } },
  r_flour:     { out: 'flour',     outQty: 1, inputs: { wheat: 2 } },
  r_wine:      { out: 'wine',      outQty: 1, inputs: { grape: 3 } },
  r_tire:      { out: 'tire',      outQty: 1, inputs: { rubber: 2 } },
  r_furniture: { out: 'furniture', outQty: 1, inputs: { timber: 3 } },
  r_car:       { out: 'car',       outQty: 1, inputs: { steel: 2, battery: 1, tire: 1 } },
  r_phone:     { out: 'phone',     outQty: 1, inputs: { chip: 1, battery: 1, plastic: 1 } },
  r_airplane:  { out: 'airplane',  outQty: 1, inputs: { steel: 4, chip: 2 } },
  r_clothes:   { out: 'clothes',   outQty: 1, inputs: { fabric: 2 } },
  r_chocolate: { out: 'chocolate', outQty: 1, inputs: { cacao: 2, sugar: 1 } },
  r_bread:     { out: 'bread',     outQty: 1, inputs: { flour: 2, sugar: 1 } },
  r_canned:    { out: 'canned',    outQty: 1, inputs: { seafood: 2, steel: 1 } },
};

// 국가 프리셋: production = 매 턴 자동 생산되는 원자재
// (턴당 생산 가치를 주석으로 표기 — 목표 5만원 ±10%)
export const WORLD_NATIONS = [
  { id: 'korea',   name: '한국',   emoji: '🇰🇷', production: { silicon: 5, seafood: 4 } },      // 30+24=54
  { id: 'usa',     name: '미국',   emoji: '🇺🇸', production: { wheat: 6, oil: 4 } },            // 18+32=50
  { id: 'china',   name: '중국',   emoji: '🇨🇳', production: { rare_earth: 2, cotton: 3 } },    // 40+9=49
  { id: 'japan',   name: '일본',   emoji: '🇯🇵', production: { seafood: 5, silicon: 3 } },      // 30+18=48
  { id: 'saudi',   name: '사우디아라비아', emoji: '🇸🇦', production: { oil: 6 } },              // 48
  { id: 'russia',  name: '러시아', emoji: '🇷🇺', production: { gas: 5, coal: 4 } },             // 30+20=50
  { id: 'australia', name: '호주', emoji: '🇦🇺', production: { iron_ore: 3, coal: 2, beef: 2 } }, // 21+10+20=51
  { id: 'brazil',  name: '브라질', emoji: '🇧🇷', production: { coffee: 5, sugarcane: 5, iron_ore: 2 } }, // 25+10+14=49
  { id: 'vietnam', name: '베트남', emoji: '🇻🇳', production: { rice: 7, rubber: 5 } },          // 28+20=48
  { id: 'india',   name: '인도',   emoji: '🇮🇳', production: { cotton: 8, rice: 6 } },          // 24+24=48
  { id: 'chile',   name: '칠레',   emoji: '🇨🇱', production: { copper: 2, lithium: 2 } },       // 24+30=54
  { id: 'france',  name: '프랑스', emoji: '🇫🇷', production: { grape: 9, wheat: 7 } },          // 27+21=48
  { id: 'ghana',   name: '가나',   emoji: '🇬🇭', production: { cacao: 7, timber: 3 } },         // 35+15=50
  { id: 'canada',  name: '캐나다', emoji: '🇨🇦', production: { timber: 7, wheat: 5 } },         // 35+15=50
];

// ---------- 한국 지역 모드 ----------

export const KOREA_RESOURCES = {
  // 원자재 (지역 특산물)
  cabbage:   { name: '배추',     emoji: '🥬', unit: '망',   tier: 'raw', basePrice: 3000 },
  garlic:    { name: '마늘',     emoji: '🧄', unit: '접',   tier: 'raw', basePrice: 4000 },
  pepper:    { name: '고추',     emoji: '🌶️', unit: '근',   tier: 'raw', basePrice: 5000 },
  rice_kr:   { name: '쌀',       emoji: '🍚', unit: '가마', tier: 'raw', basePrice: 5000 },
  potato:    { name: '감자',     emoji: '🥔', unit: '상자', tier: 'raw', basePrice: 3000 },
  tangerine: { name: '감귤',     emoji: '🍊', unit: '상자', tier: 'raw', basePrice: 3000 },
  apple:     { name: '사과',     emoji: '🍎', unit: '상자', tier: 'raw', basePrice: 4000 },
  melon:     { name: '참외',     emoji: '🍈', unit: '상자', tier: 'raw', basePrice: 4000 },
  strawberry:{ name: '딸기',     emoji: '🍓', unit: '상자', tier: 'raw', basePrice: 5000 },
  grape_kr:  { name: '포도',     emoji: '🍇', unit: '상자', tier: 'raw', basePrice: 4000 },
  ginseng:   { name: '인삼',     emoji: '🌿', unit: '채',   tier: 'raw', basePrice: 15000 },
  tea_leaf:  { name: '녹차잎',   emoji: '🍃', unit: '포대', tier: 'raw', basePrice: 6000 },
  milk:      { name: '우유',     emoji: '🥛', unit: '통',   tier: 'raw', basePrice: 3000 },
  hanwoo:    { name: '한우',     emoji: '🐂', unit: '세트', tier: 'raw', basePrice: 20000 },
  fish_kr:   { name: '수산물',   emoji: '🐟', unit: '상자', tier: 'raw', basePrice: 6000 },
  abalone:   { name: '전복',     emoji: '🦪', unit: '상자', tier: 'raw', basePrice: 12000 },

  // 1차 가공품
  kimchi:    { name: '김치',     emoji: '🥡', unit: '통',   tier: 'mid', basePrice: 20000 },
  juice:     { name: '감귤주스', emoji: '🧃', unit: '박스', tier: 'mid', basePrice: 13000 },
  jam:       { name: '사과잼',   emoji: '🍯', unit: '박스', tier: 'mid', basePrice: 17000 },
  tteok:     { name: '떡',       emoji: '🍡', unit: '박스', tier: 'mid', basePrice: 14000 },
  makgeolli: { name: '막걸리',   emoji: '🍶', unit: '박스', tier: 'mid', basePrice: 21000 },
  cheese:    { name: '치즈',     emoji: '🧀', unit: '박스', tier: 'mid', basePrice: 13000 },
  red_ginseng: { name: '홍삼정', emoji: '🫙', unit: '박스', tier: 'mid', basePrice: 42000 },
  green_tea: { name: '녹차',     emoji: '🍵', unit: '박스', tier: 'mid', basePrice: 17000 },
  wine_kr:   { name: '포도와인', emoji: '🍷', unit: '박스', tier: 'mid', basePrice: 17000 },

  // 완제품
  dosirak:   { name: '프리미엄 도시락', emoji: '🍱', unit: '세트', tier: 'final', basePrice: 62000 },
  cosmetic:  { name: '한방 화장품',    emoji: '💄', unit: '세트', tier: 'final', basePrice: 85000 },
  cake:      { name: '딸기 케이크',    emoji: '🍰', unit: '박스', tier: 'final', basePrice: 24000 },
  seafood_set: { name: '해물탕 세트',  emoji: '🍲', unit: '세트', tier: 'final', basePrice: 34000 },
  gift_set:  { name: '과일 선물세트',  emoji: '🎁', unit: '세트', tier: 'final', basePrice: 31000 },
};

export const KOREA_RECIPES = {
  k_kimchi:    { out: 'kimchi',    outQty: 1, inputs: { cabbage: 2, garlic: 1, pepper: 1 } },
  k_juice:     { out: 'juice',     outQty: 1, inputs: { tangerine: 3 } },
  k_jam:       { out: 'jam',       outQty: 1, inputs: { apple: 3 } },
  k_tteok:     { out: 'tteok',     outQty: 1, inputs: { rice_kr: 2 } },
  k_makgeolli: { out: 'makgeolli', outQty: 1, inputs: { rice_kr: 3 } },
  k_cheese:    { out: 'cheese',    outQty: 1, inputs: { milk: 3 } },
  k_red_ginseng: { out: 'red_ginseng', outQty: 1, inputs: { ginseng: 2 } },
  k_green_tea: { out: 'green_tea', outQty: 1, inputs: { tea_leaf: 2 } },
  k_wine:      { out: 'wine_kr',   outQty: 1, inputs: { grape_kr: 3 } },
  k_dosirak:   { out: 'dosirak',   outQty: 1, inputs: { rice_kr: 1, kimchi: 1, hanwoo: 1 } },
  k_cosmetic:  { out: 'cosmetic',  outQty: 1, inputs: { green_tea: 1, red_ginseng: 1 } },
  k_cake:      { out: 'cake',      outQty: 1, inputs: { strawberry: 2, milk: 2 } },
  k_seafood_set: { out: 'seafood_set', outQty: 1, inputs: { fish_kr: 2, abalone: 1 } },
  k_gift_set:  { out: 'gift_set',  outQty: 1, inputs: { tangerine: 2, apple: 2, melon: 2 } },
};

export const KOREA_NATIONS = [
  { id: 'jeju',     name: '제주',   emoji: '🍊', production: { tangerine: 12, fish_kr: 2 } },  // 36+12=48
  { id: 'andong',   name: '안동',   emoji: '🍎', production: { apple: 8, hanwoo: 1 } },        // 32+20=52
  { id: 'hoengseong', name: '횡성', emoji: '🐂', production: { hanwoo: 2, milk: 4 } },         // 40+12=52
  { id: 'seongju',  name: '성주',   emoji: '🍈', production: { melon: 12 } },                  // 48
  { id: 'boseong',  name: '보성',   emoji: '🍃', production: { tea_leaf: 8 } },                // 48
  { id: 'gimje',    name: '김제',   emoji: '🌾', production: { rice_kr: 10 } },                // 50
  { id: 'pyeongchang', name: '평창', emoji: '🥔', production: { potato: 12, milk: 4 } },       // 36+12=48
  { id: 'busan',    name: '부산',   emoji: '🐟', production: { fish_kr: 8 } },                 // 48
  { id: 'wando',    name: '완도',   emoji: '🦪', production: { abalone: 3, fish_kr: 2 } },     // 36+12=48
  { id: 'uiseong',  name: '의성',   emoji: '🧄', production: { garlic: 12 } },                 // 48
  { id: 'nonsan',   name: '논산',   emoji: '🍓', production: { strawberry: 10 } },             // 50
  { id: 'yeongdong', name: '영동',  emoji: '🍇', production: { grape_kr: 12 } },               // 48
  { id: 'haenam',   name: '해남',   emoji: '🥬', production: { cabbage: 16 } },                // 48
  { id: 'geumsan',  name: '금산',   emoji: '🌿', production: { ginseng: 3 } },                 // 45
  { id: 'cheongyang', name: '청양', emoji: '🌶️', production: { pepper: 10 } },                 // 50
  { id: 'icheon',   name: '이천',   emoji: '🍚', production: { rice_kr: 10 } },                // 50 (김제와 쌀 경쟁 구도)
  { id: 'cheongju', name: '청주', emoji: '🏯', production: { rice_kr: 6, grape_kr: 5 } },      // 30+20=50 (청원생명쌀·남이포도)
];

// 시/도 단위 프리셋 — 17개 광역자치단체. 자원·레시피는 시/군/구 모드와 동일하게 공유한다.
export const KOREA_PROVINCES = [
  { id: 'seoul',    name: '서울특별시',   emoji: '🏙️', production: { ginseng: 3 } },                        // 45 (경동시장 약령시)
  { id: 'busan',    name: '부산광역시',   emoji: '🌊', production: { fish_kr: 8 } },                        // 48
  { id: 'daegu',    name: '대구광역시',   emoji: '🍎', production: { apple: 12 } },                         // 48
  { id: 'incheon',  name: '인천광역시',   emoji: '🛳️', production: { potato: 8, cabbage: 8 } },             // 24+24=48 (강화도 농업)
  { id: 'gwangju',  name: '광주광역시',   emoji: '🥬', production: { cabbage: 16 } },                       // 48 (광주김치)
  { id: 'daejeon',  name: '대전광역시',   emoji: '🍓', production: { strawberry: 10 } },                    // 50
  { id: 'ulsan',    name: '울산광역시',   emoji: '🏭', production: { milk: 10, potato: 6 } },                // 30+18=48
  { id: 'sejong',   name: '세종특별자치시', emoji: '🌾', production: { rice_kr: 10 } },                      // 50
  { id: 'gyeonggi', name: '경기도',       emoji: '🍇', production: { grape_kr: 12 } },                      // 48
  { id: 'gangwon',  name: '강원특별자치도', emoji: '🥔', production: { potato: 10, hanwoo: 1 } },            // 30+20=50
  { id: 'chungbuk', name: '충청북도',     emoji: '🌶️', production: { pepper: 6, apple: 5 } },               // 30+20=50 (괴산 고추·충주 사과)
  { id: 'chungnam', name: '충청남도',     emoji: '🌿', production: { ginseng: 3 } },                        // 45 (금산 인삼)
  { id: 'jeonbuk',  name: '전북특별자치도', emoji: '🌶️', production: { pepper: 8, rice_kr: 2 } },            // 40+10=50 (순창 고추장 재료)
  { id: 'jeonnam',  name: '전라남도',     emoji: '🐟', production: { rice_kr: 6, fish_kr: 3 } },             // 30+18=48 (곡창지대+수산업)
  { id: 'gyeongbuk', name: '경상북도',    emoji: '🍎', production: { apple: 12 } },                         // 48 (경북 사과)
  { id: 'gyeongnam', name: '경상남도',    emoji: '🍵', production: { tea_leaf: 8 } },                       // 48 (하동 녹차)
  { id: 'jeju_do',  name: '제주특별자치도', emoji: '🍊', production: { tangerine: 12, fish_kr: 2 } },        // 36+12=48
];

// ---------- 지역 단위 ----------
// county: 시/군/구 (기존) / province: 시/도
export const SCALES = [
  { id: 'county',   name: '시·군·구', emoji: '🏘️', desc: '제주·안동·부산 등 17개 시/군/구. 좁은 단위의 지역 특산물로 무역해요.' },
  { id: 'province', name: '시·도',   emoji: '🗺️', desc: '서울·경기·부산 등 17개 시/도. 더 넓은 단위로 무역해요.' },
];

// ---------- 난이도 ----------
// easy: 원자재만 / normal: 원자재+1차 가공품 / hard: 전체
export const DIFFICULTIES = [
  { id: 'easy',   name: '쉬움',   emoji: '🌱', desc: '특산품(원자재)만으로 무역해요. 제작 없이 사고팔기에 집중!' },
  { id: 'normal', name: '보통',   emoji: '🌿', desc: '원자재를 조합해 1차 가공품을 만들 수 있어요.' },
  { id: 'hard',   name: '어려움', emoji: '🌳', desc: '가공품을 다시 조합해 완제품까지! 긴 생산 사슬에 도전!' },
];

const TIER_BY_DIFFICULTY = { easy: ['raw'], normal: ['raw', 'mid'], hard: ['raw', 'mid', 'final'] };

// 난이도에 맞는 자원/레시피만 남긴다 (방 생성 시 사용)
export function filterByDifficulty(resources, recipes, difficulty) {
  const tiers = TIER_BY_DIFFICULTY[difficulty] || TIER_BY_DIFFICULTY.hard;
  const res = {};
  for (const [id, r] of Object.entries(resources)) {
    if (tiers.includes(r.tier)) res[id] = r;
  }
  const rec = {};
  for (const [id, r] of Object.entries(recipes)) {
    const outOk = res[r.out];
    const inputsOk = Object.keys(r.inputs).every((k) => res[k]);
    if (outOk && inputsOk) rec[id] = r;
  }
  return { resources: res, recipes: rec };
}

// ---------- 공통 설정 ----------

export const DEFAULT_SETTINGS = {
  startingMoney: 500000,    // 시작 자금 50만원
  teamApproval: true,       // 모둠 과반 승인제
  maxTurns: 10,             // 목표 턴 수 (교사가 조기 종료 가능)
};

export const ROLES = [
  { id: 'trader',   name: '무역대표', emoji: '🤝', desc: '다른 나라와의 협상과 거래 제안을 주도해요' },
  { id: 'producer', name: '생산부장', emoji: '🏭', desc: '자원 생산과 제작(가공) 계획을 담당해요' },
  { id: 'finance',  name: '재무관',   emoji: '💰', desc: '나라의 돈 관리와 거래 손익 계산을 담당해요' },
  { id: 'analyst',  name: '정보분석가', emoji: '🔍', desc: '시세와 다른 나라 상황을 분석하고 전략을 세워요' },
];

export function getPreset(mode, scale = 'county') {
  if (mode === 'city') {
    const nations = scale === 'province' ? KOREA_PROVINCES : KOREA_NATIONS;
    return { resources: KOREA_RESOURCES, recipes: KOREA_RECIPES, nations };
  }
  return { resources: WORLD_RESOURCES, recipes: WORLD_RECIPES, nations: WORLD_NATIONS };
}

// 개발용: 나라별 턴당 생산 가치 확인
export function checkBalance() {
  for (const [label, nations, resources] of [
    ['세계', WORLD_NATIONS, WORLD_RESOURCES],
    ['한국(시군구)', KOREA_NATIONS, KOREA_RESOURCES],
    ['한국(시도)', KOREA_PROVINCES, KOREA_RESOURCES],
  ]) {
    console.group(`${label} 모드 턴당 생산 가치`);
    for (const n of nations) {
      const v = Object.entries(n.production).reduce((s, [r, q]) => s + resources[r].basePrice * q, 0);
      console.log(`${n.emoji} ${n.name}: ${v.toLocaleString()}원`);
    }
    console.groupEnd();
  }
}
