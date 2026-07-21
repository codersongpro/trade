// ============================================================
// 이벤트 카드 데이터 (128종)
// changes: { 자원id: 배율 } — 현재 시세에 곱한다 (1.5 = 50% 상승, 0.7 = 30% 하락)
// rare: true — 낮은 확률(15%)로만 등장하는 재미 이벤트
// 방에 없는 자원은 적용 시 자동으로 무시된다 (난이도 호환)
// ============================================================

export const WORLD_EVENTS = [
  // ----- 일반 이벤트: 실제 사회 현상 반영 -----
  { id: 'ai_boom',      title: 'AI 열풍',             desc: '인공지능 산업이 폭발적으로 성장하며 반도체 수요가 치솟았습니다!', changes: { chip: 1.8, silicon: 1.5, rare_earth: 1.4 } },
  { id: 'ev_boom',      title: '전기차 대중화',       desc: '전기차 판매가 급증하며 배터리 원료 가격이 상승했습니다.', changes: { lithium: 1.8, copper: 1.4, battery: 1.5, car: 1.3 } },
  { id: 'opec_cut',     title: 'OPEC 감산 결정',      desc: '산유국들이 생산량을 줄이기로 하면서 유가가 급등했습니다.', changes: { oil: 1.6, plastic: 1.2 } },
  { id: 'oil_crash',    title: '국제 유가 폭락',      desc: '공급 과잉으로 유가가 폭락했습니다. 산유국 비상!', changes: { oil: 0.5, plastic: 0.8 } },
  { id: 'drought',      title: '대가뭄 발생',         desc: '세계 곡창지대에 가뭄이 들어 곡물 가격이 급등했습니다!', changes: { wheat: 2, rice: 1.8, sugarcane: 1.5 } },
  { id: 'harvest',      title: '세계적 대풍년',       desc: '날씨가 좋아 농산물이 대풍년! 곡물 가격이 내렸습니다.', changes: { wheat: 0.6, rice: 0.6, grape: 0.7, sugarcane: 0.7 } },
  { id: 'cold_wave',    title: '기록적인 한파',       desc: '북반구에 한파가 몰아쳐 난방용 에너지 가격이 급등했습니다.', changes: { gas: 1.8, coal: 1.5, oil: 1.3 } },
  { id: 'heat_wave',    title: '살인적인 폭염',       desc: '폭염으로 냉방 전력 수요가 폭증! 발전 연료 가격이 올랐습니다.', changes: { coal: 1.4, gas: 1.3 } },
  { id: 'pandemic',     title: '전염병 유행',         desc: '전염병으로 외식이 줄고, 재택근무용 전자기기 수요는 늘었습니다.', changes: { seafood: 0.7, beef: 0.7, chip: 1.3, phone: 1.2 } },
  { id: 'logistics',    title: '글로벌 물류 대란',    desc: '컨테이너선 부족으로 운송비가 치솟아 공산품 가격이 올랐습니다.', changes: { plastic: 1.3, steel: 1.3, tire: 1.4 } },
  { id: 'canal_block',  title: '운하 봉쇄 사고',      desc: '대형 화물선이 운하를 막아 에너지 운송에 차질이 생겼습니다!', changes: { oil: 1.5, gas: 1.4 } },
  { id: 'trade_war',    title: '무역 분쟁 격화',      desc: '강대국 간 무역 분쟁으로 희토류 수출이 제한됐습니다.', changes: { rare_earth: 1.7, chip: 1.4 } },
  { id: 'worldcup',     title: '월드컵 개막',         desc: '월드컵 특수! 치킨과 함께 먹을 음식과 응원 유니폼이 불티나게 팔립니다.', changes: { beef: 1.5, clothes: 1.3 } },
  { id: 'olympic',      title: '올림픽 유치 성공',    desc: '올림픽 경기장 건설로 철강과 목재 수요가 급증했습니다.', changes: { steel: 1.4, timber: 1.3 } },
  { id: 'cafe_boom',    title: '카페 창업 붐',        desc: '골목마다 카페가 생겨나며 커피원두 수요가 폭증했습니다.', changes: { coffee: 1.8, sugar: 1.3 } },
  { id: 'valentine',    title: '밸런타인데이 특수',   desc: '기념일을 앞두고 초콜릿이 불티나게 팔립니다.', changes: { chocolate: 1.6, cacao: 1.4 } },
  { id: 'fashion_week', title: '세계 패션위크',       desc: '패션위크의 영향으로 의류와 원단 수요가 늘었습니다.', changes: { clothes: 1.5, fabric: 1.4, cotton: 1.3 } },
  { id: 'housing_boom', title: '주택 건설 붐',        desc: '건설 경기가 살아나며 철강·목재·가구 수요가 급증했습니다.', changes: { steel: 1.5, timber: 1.6, furniture: 1.4 } },
  { id: 'housing_bust', title: '건설 경기 침체',      desc: '부동산 시장이 얼어붙어 건설 자재 가격이 하락했습니다.', changes: { steel: 0.7, timber: 0.7, furniture: 0.8 } },
  { id: 'travel_boom',  title: '해외여행 폭증',       desc: '여행 수요가 폭증해 항공기 주문이 밀려들고 있습니다!', changes: { airplane: 1.5, oil: 1.2 } },
  { id: 'fish_short',   title: '어획량 급감',         desc: '해수 온도 상승으로 어획량이 줄어 수산물 가격이 올랐습니다.', changes: { seafood: 1.7, canned: 1.3 } },
  { id: 'vegan_trend',  title: '채식주의 확산',       desc: '채식 열풍으로 고기 소비가 줄고 곡물 수요가 늘었습니다.', changes: { beef: 0.6, wheat: 1.2 } },
  { id: 'mukbang',      title: '먹방 전성시대',       desc: '먹방 유튜버들의 인기로 먹거리 수요가 전반적으로 올랐습니다.', changes: { beef: 1.4, seafood: 1.3, bread: 1.2 } },
  { id: 'steel_strike', title: '제철소 총파업',       desc: '제철소 노동자들이 파업에 돌입해 철강 공급이 끊겼습니다.', changes: { steel: 1.6 } },
  { id: 'port_strike',  title: '항만 노조 파업',      desc: '항만이 멈추면서 수출입 물품 가격이 들썩입니다.', changes: { canned: 1.3, plastic: 1.2, steel: 1.2 } },
  { id: 'chip_short',   title: '반도체 품귀 현상',    desc: '전 세계 반도체 공장이 풀가동해도 물량이 부족합니다!', changes: { chip: 1.9, car: 1.2, phone: 1.3 } },
  { id: 'phone_launch', title: '신형 스마트폰 공개',  desc: '혁신적인 신제품 발표로 스마트폰 수요가 폭발했습니다.', changes: { phone: 1.5, chip: 1.3, battery: 1.2 } },
  { id: 'battery_issue', title: '배터리 안전성 논란', desc: '배터리 화재 사고가 잇따라 소비자 신뢰가 떨어졌습니다.', changes: { battery: 0.7, phone: 0.9 } },
  { id: 'eco_policy',   title: '탄소중립 정책 강화',  desc: '각국이 화석연료 규제를 강화하고 친환경 에너지에 투자합니다.', changes: { coal: 0.6, oil: 0.8, lithium: 1.4 } },
  { id: 'solar_boom',   title: '태양광 발전 확대',    desc: '태양광 패널 설치 붐으로 규소 수요가 급증했습니다.', changes: { silicon: 1.5, coal: 0.8 } },
  { id: 'wine_award',   title: '와인 품평회 대상',    desc: '국제 품평회 수상 소식에 와인 수집 열풍이 불었습니다.', changes: { wine: 1.6, grape: 1.3 } },
  { id: 'bakery_trend', title: '베이커리 카페 유행',  desc: '빵지순례가 유행하며 제빵 재료 가격이 올랐습니다.', changes: { bread: 1.5, flour: 1.4, sugar: 1.2 } },
  { id: 'rice_decline', title: '쌀 소비 감소',        desc: '식습관 변화로 쌀 소비가 줄어 가격이 하락했습니다.', changes: { rice: 0.7 } },
  { id: 'k_food',       title: 'K-푸드 세계 유행',    desc: '한식이 세계적으로 유행하며 쌀과 수산물 수요가 늘었습니다.', changes: { rice: 1.4, seafood: 1.3 } },
  { id: 'rubber_blight', title: '고무나무 병충해',    desc: '동남아 고무 농장에 병충해가 퍼져 고무 값이 뛰었습니다.', changes: { rubber: 1.7, tire: 1.4 } },
  { id: 'forest_fire',  title: '대형 산불 발생',      desc: '대형 산불로 목재 공급이 크게 줄었습니다.', changes: { timber: 1.8, furniture: 1.3 } },
  { id: 'forest_pact',  title: '산림 보호 협약',      desc: '벌목 제한 협약이 체결되어 목재 공급이 줄었습니다.', changes: { timber: 1.4 } },
  { id: 'cotton_flood', title: '면화 산지 대홍수',    desc: '면화 주산지에 홍수가 나서 면화 가격이 급등했습니다.', changes: { cotton: 1.7, fabric: 1.4 } },
  { id: 'fast_fashion', title: '패스트패션 반대 운동', desc: '옷을 아껴 입자는 운동이 확산되며 의류 소비가 줄었습니다.', changes: { clothes: 0.7, cotton: 0.8 } },
  { id: 'gas_accident', title: '가스관 파손 사고',    desc: '주요 가스관이 파손되어 천연가스 공급이 중단됐습니다!', changes: { gas: 1.7 } },
  { id: 'copper_mine',  title: '대형 구리 광산 발견', desc: '초대형 구리 광산이 발견되어 구리 값이 떨어졌습니다.', changes: { copper: 0.6 } },
  { id: 'lithium_find', title: '리튬 매장지 발견',    desc: '거대한 리튬 매장지가 발견되어 리튬 값이 하락했습니다.', changes: { lithium: 0.6, battery: 0.9 } },
  { id: 'car_recall',   title: '대규모 자동차 리콜',  desc: '결함 발견으로 대규모 리콜 사태! 자동차 신뢰도가 하락했습니다.', changes: { car: 0.7 } },
  { id: 'car_collect',  title: '자동차 소유 열풍',    desc: '차박·드라이브 문화 확산으로 자동차 수요가 늘었습니다.', changes: { car: 1.4, tire: 1.2 } },
  { id: 'plane_order',  title: '항공사 대량 주문',    desc: '세계 항공사들이 신형 항공기를 대량 주문했습니다.', changes: { airplane: 1.6, steel: 1.2 } },
  { id: 'home_cafe',    title: '홈카페 유행',         desc: '집에서 커피를 즐기는 사람이 늘어 원두가 잘 팔립니다.', changes: { coffee: 1.5, sugar: 1.2 } },
  { id: 'sugar_tax',    title: '설탕세 도입',         desc: '건강을 위해 설탕세가 도입되어 단 음식 소비가 줄었습니다.', changes: { sugar: 0.7, chocolate: 0.8, bread: 0.9 } },
  { id: 'protein_boom', title: '단백질 식품 열풍',    desc: '운동 열풍과 함께 고단백 식품 수요가 급증했습니다.', changes: { beef: 1.5, seafood: 1.3 } },
  { id: 'camping_boom', title: '캠핑 열풍',           desc: '캠핑 인구가 늘면서 통조림과 캠핑용품이 잘 팔립니다.', changes: { canned: 1.5, furniture: 1.2 } },
  { id: 'diy_trend',    title: 'DIY 가구 유행',       desc: '직접 가구를 만드는 취미가 유행하며 목재가 잘 팔립니다.', changes: { furniture: 1.5, timber: 1.2 } },
  { id: 'automation',   title: '공장 자동화 확산',    desc: '로봇 자동화 투자가 늘며 반도체와 철강 수요가 증가했습니다.', changes: { chip: 1.4, steel: 1.2 } },
  { id: 'space_race',   title: '우주 개발 경쟁',      desc: '각국의 우주 개발 경쟁으로 첨단 소재 수요가 폭증했습니다.', changes: { rare_earth: 1.6, chip: 1.3, airplane: 1.2 } },
  { id: 'export_boom',  title: '수출 대호황',         desc: '세계 경기 회복으로 공산품 수출이 크게 늘었습니다.', changes: { chip: 1.2, car: 1.2, phone: 1.2 } },
  { id: 'recession',    title: '세계 경기 침체',      desc: '경기 침체로 비싼 물건부터 소비가 줄고 있습니다.', changes: { car: 0.7, phone: 0.7, airplane: 0.7, clothes: 0.8 } },
  { id: 'esports',      title: 'e스포츠 결승전 특수', desc: '세계 e스포츠 대회로 전자기기 수요가 늘었습니다.', changes: { phone: 1.3, chip: 1.2 } },
  { id: 'mega_flood',   title: '기록적인 대홍수',     desc: '아시아 곡창지대에 홍수가 나서 곡물 가격이 뛰었습니다.', changes: { rice: 1.6, wheat: 1.4 } },
  { id: 'choco_movie',  title: '초콜릿 공장 영화 흥행', desc: '초콜릿을 소재로 한 영화가 흥행하며 초콜릿이 잘 팔립니다.', changes: { chocolate: 1.5, cacao: 1.3 } },
  { id: 'noodle_boom',  title: '라면·파스타 유행',    desc: '간편식 열풍으로 밀가루 수요가 크게 늘었습니다.', changes: { flour: 1.5, wheat: 1.3 } },

  // ----- 희귀(재미) 이벤트 -----
  { id: 'alien_coffee', rare: true, title: '👽 외계인의 커피 계약', desc: '지구를 방문한 외계인이 커피 맛에 감동해 은하계 수출 계약을 맺었습니다!', changes: { coffee: 3 } },
  { id: 'asteroid',     rare: true, title: '☄️ 희토류 소행성 채굴', desc: '소행성에서 희토류를 캐오는 데 성공! 희토류 값이 폭락했습니다.', changes: { rare_earth: 0.3 } },
  { id: 'cat_mayor',    rare: true, title: '🐱 고양이 시장 당선', desc: '어느 항구도시에서 고양이가 명예시장에 당선! 공약은 "모두에게 생선을".', changes: { seafood: 2 } },
  { id: 'old_wine',     rare: true, title: '🍷 100년 된 와인 발견', desc: '난파선에서 100년 된 와인이 발견되어 와인 수집 열풍이 불었습니다!', changes: { wine: 2.5 } },
  { id: 'robot_strike', rare: true, title: '🤖 로봇들의 파업 선언', desc: '공장 로봇들이 "우리도 휴가가 필요하다"며 파업했습니다. 반도체 대란!', changes: { chip: 2, battery: 1.5 } },
  { id: 'giant_squid',  rare: true, title: '🦑 대왕오징어 출몰', desc: '전설의 대왕오징어가 나타나 어선들이 출항을 못 하고 있습니다!', changes: { seafood: 2.2 } },
  { id: 'choco_rain',   rare: true, title: '🍫 초콜릿 비 내림', desc: '카카오 산지에 초콜릿 비가 내렸다는 소문에 공급이 넘쳐납니다(!?)', changes: { cacao: 0.4, chocolate: 0.5 } },
  { id: 'penguin_port', rare: true, title: '🐧 펭귄 떼의 항구 점거', desc: '펭귄 떼가 항구를 점거해 통조림 공장이 멈췄습니다. 귀여워서 아무도 못 쫓아냄.', changes: { canned: 1.8, seafood: 1.5 } },
  { id: 'idol_tshirt',  rare: true, title: '⭐ 아이돌의 흰 티셔츠', desc: '세계적인 아이돌이 입은 평범한 티셔츠가 품절 대란을 일으켰습니다!', changes: { clothes: 2.5 } },
  { id: 'dragon_tour',  rare: true, title: '🐉 용 목격설 관광 붐', desc: '하늘을 나는 용이 목격됐다는 소문에 전 세계 관광객이 몰려듭니다!', changes: { airplane: 1.8 } },
  { id: 'bread_meme',   rare: true, title: '🥐 빵 밈 대유행', desc: '고양이가 빵을 쓰고 있는 밈이 유행하며 빵 판매가 폭증했습니다.', changes: { bread: 2.2, flour: 1.5 } },
  { id: 'nap_movement', rare: true, title: '😴 세계 낮잠 운동', desc: '"낮잠은 인권이다" 운동이 확산되며 편안한 가구가 불티나게 팔립니다.', changes: { furniture: 2 } },
  { id: 'hero_movie',   rare: true, title: '🦸 슈퍼히어로 영화 흥행', desc: '슈퍼히어로 영화가 역대급 흥행! 주인공의 자동차와 의상이 유행합니다.', changes: { car: 1.5, clothes: 1.4 } },
];

export const KOREA_EVENTS = [
  // ----- 일반 이벤트: 실제 사회 현상 반영 -----
  { id: 'kimjang',      title: '김장철 도래',         desc: '전국이 김장 준비에 나서며 김장 재료 가격이 급등했습니다!', changes: { cabbage: 2, garlic: 1.6, pepper: 1.6, kimchi: 1.5 } },
  { id: 'typhoon',      title: '태풍 상륙',           desc: '태풍으로 과수 농가 피해가 커서 과일 가격이 올랐습니다.', changes: { apple: 1.8, tangerine: 1.6, grape_kr: 1.5, melon: 1.5 } },
  { id: 'kbeauty',      title: 'K-뷰티 세계 열풍',    desc: '한국 화장품이 세계적으로 인기! 한방 화장품 가격이 급등했습니다.', changes: { cosmetic: 1.6, red_ginseng: 1.4, green_tea: 1.3 } },
  { id: 'holiday_gift', title: '명절 선물 특수',      desc: '명절을 앞두고 선물세트와 한우 수요가 폭증했습니다.', changes: { gift_set: 1.6, hanwoo: 1.5, red_ginseng: 1.3 } },
  { id: 'mukbang_kr',   title: '해물 먹방 유행',      desc: '유명 유튜버의 해물탕 먹방으로 수산물이 대유행 중입니다!', changes: { seafood_set: 1.7, abalone: 1.5, fish_kr: 1.4 } },
  { id: 'harvest_kr',   title: '전국 대풍년',         desc: '올해 농사가 대풍년! 농산물 가격이 하락했습니다.', changes: { rice_kr: 0.6, cabbage: 0.6, potato: 0.7, garlic: 0.7 } },
  { id: 'dessert_cafe', title: '디저트 카페 유행',    desc: '딸기 디저트가 SNS에서 대유행 중입니다!', changes: { cake: 1.7, strawberry: 1.6, milk: 1.3 } },
  { id: 'health_boom',  title: '건강식품 붐',         desc: '건강에 대한 관심이 높아져 인삼·녹차 수요가 늘었습니다.', changes: { ginseng: 1.5, tea_leaf: 1.4, green_tea: 1.4 } },
  { id: 'dosirak_boom', title: '프리미엄 도시락 유행', desc: '고급 도시락이 직장인들 사이에서 큰 인기입니다.', changes: { dosirak: 1.6, tteok: 1.3 } },
  { id: 'cold_kr',      title: '겨울 한파',           desc: '한파로 비닐하우스 난방비가 올라 시설 재배 작물 가격이 상승했습니다.', changes: { strawberry: 1.5, melon: 1.4, cabbage: 1.4 } },
  { id: 'drought_kr',   title: '봄 가뭄',             desc: '가뭄으로 모내기가 어려워져 쌀값이 들썩입니다.', changes: { rice_kr: 1.6, potato: 1.4 } },
  { id: 'monsoon',      title: '기록적인 장마',       desc: '긴 장마로 밭작물이 물에 잠겨 채소 가격이 급등했습니다.', changes: { cabbage: 1.7, pepper: 1.5 } },
  { id: 'school_milk',  title: '우유 급식 확대',      desc: '학교 우유 급식이 확대되어 우유 수요가 늘었습니다.', changes: { milk: 1.5, cheese: 1.3 } },
  { id: 'cheese_food',  title: '치즈 요리 유행',      desc: '치즈를 올린 요리들이 유행하며 치즈가 불티나게 팔립니다.', changes: { cheese: 1.7, milk: 1.4 } },
  { id: 'sool_boom',    title: '전통주 재조명',       desc: '젊은 세대 사이에서 막걸리가 힙한 술로 떠올랐습니다!', changes: { makgeolli: 1.7, rice_kr: 1.2 } },
  { id: 'tteok_cafe',   title: '떡카페 유행',         desc: '전통 떡을 현대적으로 재해석한 떡카페가 인기입니다.', changes: { tteok: 1.6, rice_kr: 1.2 } },
  { id: 'hanwoo_export', title: '한우 수출길 확대',   desc: '한우가 해외 시장에 진출하며 몸값이 올랐습니다.', changes: { hanwoo: 1.6 } },
  { id: 'livestock_ill', title: '가축 전염병 발생',   desc: '가축 전염병으로 축산물 소비 심리가 위축됐습니다.', changes: { hanwoo: 0.6, milk: 0.8 } },
  { id: 'seafood_issue', title: '수산물 위생 논란',   desc: '수산물 위생 문제가 보도되어 소비가 줄었습니다.', changes: { fish_kr: 0.6, abalone: 0.7 } },
  { id: 'jeju_tour',    title: '제주 관광 붐',        desc: '제주 여행객이 급증하며 특산물 판매가 늘었습니다.', changes: { tangerine: 1.5, abalone: 1.3 } },
  { id: 'camping_kr',   title: '캠핑 열풍',           desc: '캠핑장마다 만원! 고기와 감자가 불티나게 팔립니다.', changes: { hanwoo: 1.4, potato: 1.3 } },
  { id: 'garlic_tv',    title: '마늘 효능 방송',      desc: 'TV에서 마늘의 건강 효능이 소개되어 마늘값이 뛰었습니다.', changes: { garlic: 1.8 } },
  { id: 'pepper_short', title: '고춧가루 품귀',       desc: '고추 흉년으로 고춧가루 대란이 벌어졌습니다.', changes: { pepper: 1.8, kimchi: 1.3 } },
  { id: 'apple_gold',   title: '金사과 논란',         desc: '사과 값이 금값이라는 뉴스가 연일 보도되고 있습니다.', changes: { apple: 2 } },
  { id: 'tangerine_max', title: '감귤 대풍년',        desc: '감귤이 대풍년이라 가격이 내려갔습니다.', changes: { tangerine: 0.6, juice: 0.8 } },
  { id: 'berry_export', title: '딸기 수출 급증',      desc: '한국 딸기가 해외에서 명품 과일로 인정받고 있습니다!', changes: { strawberry: 1.6 } },
  { id: 'wine_kr_prize', title: '국산 와인 국제 수상', desc: '국산 포도와인이 국제 대회에서 상을 받았습니다!', changes: { wine_kr: 1.7, grape_kr: 1.3 } },
  { id: 'shine_muscat', title: '포도 품종 열풍',      desc: '고급 포도 품종이 명절 선물 필수템으로 떠올랐습니다.', changes: { grape_kr: 1.8 } },
  { id: 'melon_festa',  title: '참외 축제 대흥행',    desc: '참외 축제에 관광객이 몰려 참외 판매가 급증했습니다.', changes: { melon: 1.6 } },
  { id: 'potato_snack', title: '감자과자 대란',       desc: '한정판 감자과자가 품절 대란을 일으켜 감자 수요가 폭증!', changes: { potato: 1.7 } },
  { id: 'rice_bakery',  title: '쌀빵·쌀디저트 유행',  desc: '밀가루 대신 쌀로 만든 빵이 건강식으로 인기입니다.', changes: { rice_kr: 1.4, tteok: 1.2 } },
  { id: 'abalone_gift', title: '전복 선물 유행',      desc: '명절 선물로 전복 세트가 유행하고 있습니다.', changes: { abalone: 1.6, seafood_set: 1.2 } },
  { id: 'fish_festa',   title: '수산물 축제',         desc: '전국 수산물 축제로 수산물 소비가 크게 늘었습니다.', changes: { fish_kr: 1.5 } },
  { id: 'greentea_latte', title: '녹차라떼 유행',     desc: '녹차라떼와 녹차 디저트가 카페 인기 메뉴가 됐습니다.', changes: { green_tea: 1.6, tea_leaf: 1.4, milk: 1.2 } },
  { id: 'ginseng_export', title: '홍삼 수출 호조',    desc: '홍삼이 해외에서 건강식품으로 인기를 끌고 있습니다.', changes: { red_ginseng: 1.5, ginseng: 1.3 } },
  { id: 'kimchi_export', title: '김치 수출 역대 최대', desc: 'K-푸드 열풍으로 김치 수출이 역대 최대를 기록했습니다!', changes: { kimchi: 1.7, cabbage: 1.3 } },
  { id: 'jam_gift',     title: '수제잼 선물 유행',    desc: '수제 과일잼이 감성 선물로 유행하고 있습니다.', changes: { jam: 1.6, apple: 1.2 } },
  { id: 'juice_detox',  title: '착즙주스 다이어트',   desc: '착즙주스 다이어트가 유행하며 과일주스 수요가 늘었습니다.', changes: { juice: 1.6, tangerine: 1.3 } },
  { id: 'school_lunch', title: '친환경 급식 확대',    desc: '학교 급식에 국산 농산물 사용이 확대됐습니다.', changes: { rice_kr: 1.3, milk: 1.2, kimchi: 1.2 } },
  { id: 'low_birth',    title: '저출산 시대',         desc: '아이가 줄면서 우유와 케이크 소비가 감소했습니다.', changes: { milk: 0.8, cake: 0.9 } },
  { id: 'aging_society', title: '고령화 사회',        desc: '어르신 인구가 늘며 건강식품 수요가 증가했습니다.', changes: { ginseng: 1.4, red_ginseng: 1.3 } },
  { id: 'cook_challenge', title: '요리 챌린지 유행',  desc: 'SNS 요리 챌린지가 유행하며 전통 음식 재료가 잘 팔립니다.', changes: { kimchi: 1.4, tteok: 1.3 } },
  { id: 'drama_food',   title: '드라마 속 음식 화제', desc: '인기 드라마에 나온 도시락과 막걸리가 완판 행진 중입니다!', changes: { dosirak: 1.5, makgeolli: 1.3 } },
  { id: 'vegan_kr',     title: '채식 열풍',           desc: '채식 인구가 늘며 고기 소비는 줄고 채소 수요가 늘었습니다.', changes: { hanwoo: 0.7, potato: 1.2, cabbage: 1.2 } },
  { id: 'local_food',   title: '로컬푸드 운동',       desc: '우리 지역 농산물 먹기 운동이 확산되고 있습니다.', changes: { apple: 1.2, potato: 1.2, rice_kr: 1.2 } },
  { id: 'summer_heat',  title: '무더위 특수',         desc: '무더위에 시원한 참외와 주스가 불티나게 팔립니다.', changes: { melon: 1.3, juice: 1.4 } },

  // ----- 희귀(재미) 이벤트 -----
  { id: 'alien_melon',  rare: true, title: '👽 외계인의 참외 사랑', desc: '지구에 온 외계인이 참외 맛에 반해 우주선 가득 사 갔습니다!', changes: { melon: 3 } },
  { id: 'cat_mayor_kr', rare: true, title: '🐱 고양이 명예시장 취임', desc: '항구도시에 고양이 명예시장이 취임! 첫 공약은 "생선 복지".', changes: { fish_kr: 2 } },
  { id: 'dokkaebi',     rare: true, title: '👹 도깨비 목격담', desc: '밤마다 도깨비가 막걸리를 사 마신다는 소문이 파다합니다!', changes: { makgeolli: 2 } },
  { id: 'mermaid',      rare: true, title: '🧜 인어 목격설', desc: '바다에서 인어를 봤다는 소문에 전복 따러 가는 사람이 급증했습니다.', changes: { abalone: 2, fish_kr: 1.5 } },
  { id: 'giant_cabbage', rare: true, title: '🥬 초대형 배추 등장', desc: '사람 키만 한 배추가 재배에 성공해 배추가 넘쳐납니다!', changes: { cabbage: 0.4, kimchi: 0.8 } },
  { id: 'idol_berry',   rare: true, title: '⭐ 아이돌의 딸기 인증샷', desc: '세계적 아이돌이 딸기 먹는 사진을 올리자 딸기가 완판됐습니다!', changes: { strawberry: 2.5 } },
  { id: 'time_merchant', rare: true, title: '🕰️ 조선시대 상인 등장', desc: '조선에서 시간여행을 온 상인이 인삼과 한우를 싹쓸이하고 있습니다!', changes: { ginseng: 2, hanwoo: 1.5 } },
  { id: 'tangerine_bot', rare: true, title: '🤖 감귤 수확 로봇 발명', desc: '감귤 수확 로봇이 발명되어 감귤 생산량이 폭증했습니다.', changes: { tangerine: 0.5 } },
  { id: 'tteok_world',  rare: true, title: '🏆 떡 세계대회 우승', desc: '한국 떡이 세계 디저트 대회에서 우승! 전 세계가 떡에 열광합니다.', changes: { tteok: 2.2 } },
  { id: 'cheese_moon',  rare: true, title: '🌕 달은 치즈다?', desc: '"달은 사실 치즈"라는 밈이 유행하며 치즈 판매가 폭증했습니다.', changes: { cheese: 2 } },
  { id: 'haenyeo_doc',  rare: true, title: '🎬 해녀 다큐 세계적 흥행', desc: '해녀 다큐멘터리가 국제 영화제에서 수상하며 전복 인기가 치솟았습니다!', changes: { abalone: 1.8, seafood_set: 1.4 } },
];

// ---------- 이벤트 뽑기 ----------

const RARE_CHANCE = 0.15;

export function getEvents(mode) {
  return mode === 'city' ? KOREA_EVENTS : WORLD_EVENTS;
}

// 방에 존재하는 자원에 적용 가능한 미사용 이벤트만 추린다
export function availableEvents(mode, usedIds, roomResourceIds) {
  const used = new Set(usedIds || []);
  return getEvents(mode).filter(
    (e) => !used.has(e.id) && Object.keys(e.changes).some((r) => roomResourceIds.includes(r))
  );
}

// 랜덤 뽑기: 85% 일반 / 15% 희귀 (한쪽이 소진되면 남은 쪽에서)
export function drawRandomEvent(mode, usedIds, roomResourceIds) {
  const pool = availableEvents(mode, usedIds, roomResourceIds);
  if (pool.length === 0) return null;
  const rares = pool.filter((e) => e.rare);
  const normals = pool.filter((e) => !e.rare);
  let pick;
  if (rares.length && (normals.length === 0 || Math.random() < RARE_CHANCE)) pick = rares;
  else pick = normals.length ? normals : rares;
  return pick[Math.floor(Math.random() * pick.length)];
}
