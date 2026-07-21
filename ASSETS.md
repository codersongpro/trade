# 🎨 그래픽 에셋 제작 가이드

이 문서는 무역 게임에 넣을 그림들을 **이미지 생성 AI로 만들기 위한 프롬프트 모음**입니다.
프롬프트를 복사해 붙여넣고, 나온 그림을 지정된 경로에 저장한 뒤 알려주시면 코드에 연결해 드립니다.

> **지금도 게임은 완전히 작동합니다.** 현재는 이모지와 CSS만으로 화면을 그리고 있어요.
> 여기 있는 그림들은 전부 **없어도 되는 추가 장식**이고, 하나씩 넣을 때마다 화면이 좋아집니다.
> 우선순위 A부터 만드시면 효과가 가장 큽니다.

---

## 목차
- [시작하기 전에](#시작하기-전에)
- [공통 스타일 프롬프트](#공통-스타일-프롬프트) ← **모든 프롬프트 앞에 붙이세요**
- [A. 꼭 필요한 것](#a-꼭-필요한-것)
- [B. 있으면 좋은 것](#b-있으면-좋은-것)
- [C. 여유가 되면](#c-여유가-되면)
- [만든 뒤 할 일](#만든-뒤-할-일)

---

## 시작하기 전에

### 어떤 도구를 쓰면 되나요
| 도구 | 비용 | 특징 |
|---|---|---|
| **ChatGPT (이미지 생성)** | 유료 플랜 | 한글로 대화하며 수정 요청이 쉬움. 가장 추천 |
| **Microsoft Copilot / Designer** | 무료 | 무료로 쓸 만함. 투명 배경은 별도 처리 필요 |
| **Midjourney** | 유료 | 품질 최상, 일관성 좋음. 디스코드 사용법 익혀야 함 |
| **Adobe Firefly** | 무료 한도 있음 | 상업적 이용이 명확해서 안심 |

### 반드시 지켜야 할 3가지

1. **그림 안에 글자를 넣지 마세요.**
   이미지 AI는 한글을 제대로 못 씁니다. 글자는 전부 코드에서 얹으니 그림에는 넣지 마세요.
   프롬프트 끝에 항상 `no text, no letters, no words` 를 붙이세요.

2. **파일 용량을 줄여주세요.**
   학교 와이파이에서 30명이 동시에 접속합니다. 저장 전에
   [squoosh.app](https://squoosh.app) 같은 무료 도구로 압축하세요. 목표 용량은 각 항목에 적어뒀습니다.

3. **배경이 투명해야 하는 것과 아닌 것을 구분하세요.**
   각 항목에 `투명 배경 필요` 라고 표시해 뒀습니다. PNG로 저장하되, 투명이 필요 없으면 JPG가 더 가볍습니다.

### 파일은 어디에 저장하나요

프로젝트 폴더 안에 `assets` 폴더를 만들고 그 안에 넣어주세요.

```
trading/
├── assets/          ← 새로 만드세요
│   ├── hero-port.png
│   ├── bg-map.png
│   └── empty/
│       ├── warehouse.png
│       └── ...
├── css/
├── js/
└── index.html
```

---

## 공통 스타일 프롬프트

**모든 프롬프트 앞이나 뒤에 이 문단을 붙이세요.** 그래야 그림들이 서로 어울립니다.

```
Art style: flat vector illustration with soft depth and subtle grain texture,
warm and friendly, rounded shapes, thick confident outlines, storybook quality,
suitable for a children's educational game about world trade.
Color palette: deep navy blue #0d1628 and #1e2f52, warm gold #f0b429,
parchment cream #fffdf7, bright blue #3d6ef5, sea green #4f9d69.
Clean composition, generous negative space, no clutter.
No text, no letters, no words, no numbers, no watermark.
```

**한글 설명:** 평면 벡터 일러스트, 부드러운 입체감과 은은한 종이 질감, 따뜻하고 친근한 분위기,
둥근 형태와 또렷한 외곽선, 그림책 같은 완성도. 색은 짙은 남색·황금색·크림색·파랑·초록 계열.
글자는 절대 넣지 않음.

> 💡 **일관성 비법**: 첫 그림이 마음에 들면 그 이미지를 다음 프롬프트에 **참고 이미지로 첨부**하고
> "같은 스타일로" 라고 요청하세요. 훨씬 잘 맞습니다.

---

## A. 꼭 필요한 것

### A-1. 랜딩 화면 히어로 일러스트

**용도**: 첫 화면 맨 위. 학생이 접속했을 때 처음 보는 그림이라 첫인상을 좌우합니다.
**경로**: `assets/hero-port.png`
**규격**: 1600 × 900 px · PNG 또는 JPG · **투명 배경 불필요** (짙은 남색 배경으로) · 목표 250KB 이하

```
A bustling harbor at golden hour, seen from a slight bird's eye view.
Several colorful cargo ships docked, wooden crates and barrels stacked on the pier,
cranes lifting containers, small sailboats in the distance, gentle waves.
Warm golden light from the low sun, deep navy blue sky with a few soft clouds.
The scene feels cheerful, busy and inviting — a place where goods from
many countries meet. Wide cinematic composition with the horizon in the upper third.
```

**한글 설명:** 노을 지는 항구를 살짝 위에서 내려다본 풍경. 화물선 몇 척, 나무 상자와 통이
쌓인 부두, 컨테이너를 드는 크레인, 멀리 돛단배, 잔잔한 파도. 여러 나라 물건이 모이는
활기차고 정겨운 느낌. 수평선은 위쪽 3분의 1 지점에.

---

### A-2. 배경 지도 텍스처 (반복 패턴)

**용도**: 모든 화면의 바탕. 지금은 단순한 점 무늬인데, 이걸 넣으면 "항해도 위에서 게임하는" 느낌이 납니다.
**경로**: `assets/bg-map.png`
**규격**: 512 × 512 px · PNG · **투명 배경 필요** · 목표 60KB 이하
**중요**: 반드시 **이음매 없이 반복되는(seamless tiling)** 패턴이어야 합니다.

```
A seamless tileable pattern of antique nautical chart elements,
drawn as thin delicate white lines on a fully transparent background.
Include: faint latitude and longitude grid lines, small compass roses,
tiny wave marks, dotted sailing routes, small star markers.
Very subtle and sparse — this is a background texture, it must not distract.
Line opacity around 10 percent. The pattern must repeat seamlessly on all four edges.
No text, no letters, no numbers, no land masses.
```

**한글 설명:** 옛 항해도 요소(위경도 격자, 작은 나침반, 파도 표시, 점선 항로, 별 표시)를
아주 얇은 흰 선으로 그린 반복 패턴. 투명 배경. **배경용이라 아주 옅고 성글게** —
불투명도 10% 정도. 사방이 이음매 없이 이어져야 함.

> ⚠️ 이음매 없는 패턴은 AI가 어려워합니다. "seamless tileable" 을 여러 번 강조하고,
> 결과물을 좌우로 이어붙여 선이 끊기지 않는지 꼭 확인하세요.

---

### A-3. 파비콘 · 앱 아이콘

**용도**: 브라우저 탭에 뜨는 작은 아이콘. 학생이 여러 탭을 열어도 우리 게임을 바로 찾습니다.
**경로**: `assets/icon-512.png`
**규격**: 512 × 512 px · PNG · **투명 배경 불필요** · 목표 40KB 이하

```
A simple bold app icon: a stylized cargo ship viewed from the side,
carrying three colorful containers, on a circular deep navy blue background
with a thin golden ring border. Minimal geometric shapes, very few details,
must stay recognizable at 32 pixels. Centered, symmetrical, flat design.
```

**한글 설명:** 단순하고 굵직한 앱 아이콘. 옆에서 본 화물선이 알록달록한 컨테이너 세 개를 싣고
있고, 짙은 남색 원형 배경에 얇은 금색 테두리. **32픽셀로 줄여도 알아볼 수 있게** 아주 단순하게.

---

### A-4. 링크 공유 이미지 (OG 이미지)

**용도**: 카톡·문자·클래스룸에 주소를 보낼 때 뜨는 미리보기 그림. 학생들이 낚이는 지점입니다.
**경로**: `assets/og-image.png`
**규격**: 1200 × 630 px · PNG 또는 JPG · 목표 150KB 이하

```
A wide banner illustration for an educational trading game.
Left side: a cheerful cargo ship sailing on stylized waves.
Right side: floating icons of trade goods — a barrel of oil, a sack of grain,
a gold coin, a gear, a crate — arranged in a loose arc with dotted trade routes
connecting them. Deep navy blue background with a warm golden glow from the lower right.
Leave the center-bottom area relatively empty so a title can be placed there later.
```

**한글 설명:** 가로형 배너. 왼쪽엔 파도 위를 항해하는 화물선, 오른쪽엔 무역품 아이콘들
(기름통, 곡물 자루, 금화, 톱니바퀴, 나무상자)이 점선 항로로 연결된 채 떠 있음.
짙은 남색 배경에 오른쪽 아래에서 금빛이 번짐. **가운데 아래는 비워두세요** (나중에 제목 얹음).

---

### A-5. 빈 화면 일러스트 3종

**용도**: 자원이 없을 때, 거래가 없을 때, 회의를 시작할 때 뜨는 그림. 지금은 이모지 하나뿐이라
휑한데, 그림이 들어가면 "아직 시작 전이구나"가 부드럽게 전달됩니다.
**경로**: `assets/empty/warehouse.png`, `assets/empty/trade.png`, `assets/empty/meeting.png`
**규격**: 각 400 × 300 px · PNG · **투명 배경 필요** · 각 40KB 이하

**A-5-1 빈 창고** (`warehouse.png`)
```
A small empty wooden warehouse interior with open doors, a few loose straws
on the floor and one tipped-over empty crate. Slightly melancholy but cute,
inviting the viewer to fill it up. Transparent background, centered object,
soft shadow underneath.
```
> 문이 열린 작고 텅 빈 나무 창고. 바닥에 지푸라기 몇 가닥, 넘어진 빈 상자 하나.
> 조금 쓸쓸하지만 귀엽게 — "채우고 싶다"는 느낌.

**A-5-2 거래 없음** (`trade.png`)
```
Two friendly cartoon hands reaching toward each other but not yet touching,
with a small dotted line and a question mark shape (as a graphic symbol, not a letter)
in the gap between them. Warm and hopeful, transparent background.
```
> 서로를 향해 뻗었지만 아직 닿지 않은 두 손, 그 사이에 점선. 따뜻하고 기대되는 느낌.

**A-5-3 회의 시작** (`meeting.png`)
```
A round wooden meeting table seen from above with four empty chairs around it,
a rolled map and a quill pen on the table. Cozy and inviting.
Transparent background, soft shadow.
```
> 위에서 본 둥근 나무 회의 탁자와 빈 의자 넷, 탁자 위에 말린 지도와 깃펜. 아늑한 느낌.

---

## B. 있으면 좋은 것

### B-1. 자원 등급 프레임 3종

**용도**: 자원 카드의 테두리 장식. 원자재→가공품→완제품으로 갈수록 화려해져서
학생이 "이건 귀한 거다"를 색과 장식으로 느낍니다. 지금은 왼쪽에 색 띠만 있습니다.
**경로**: `assets/frames/tier-raw.png`, `tier-mid.png`, `tier-final.png`
**규격**: 각 300 × 120 px · PNG · **투명 배경 필요** · 각 25KB 이하
**중요**: 가운데는 비어 있고 **테두리 장식만** 있어야 합니다 (내용은 코드가 채웁니다).

```
[원자재] A simple thin rectangular card border frame in sea green #4f9d69,
with tiny leaf and wheat motifs in the corners. Plain and humble.
The center must be completely empty and transparent.

[가공품] A rectangular card border frame in bright blue #3d6ef5,
slightly thicker, with small gear and rivet motifs in the corners
and a subtle metallic sheen. The center must be completely empty and transparent.

[완제품] An ornate rectangular card border frame in royal purple #9333ea
with golden #f0b429 accents, small sparkle and crown motifs in the corners,
a luxurious glowing edge. The center must be completely empty and transparent.
```

**한글 설명:** 순서대로 (1) 초록 얇은 테두리에 잎·밀 무늬, 소박하게 (2) 파랑 조금 두꺼운
테두리에 톱니·리벳 무늬와 금속 광택 (3) 보라 화려한 테두리에 금색 포인트, 반짝임·왕관 무늬.
**가운데는 완전히 비어 있어야 합니다.**

---

### B-2. 역할 아바타 4종

**용도**: 학생이 입장할 때 고르는 역할(무역대표/생산부장/재무관/정보분석가).
지금은 이모지라서 밋밋한데, 캐릭터가 있으면 "내 역할"이라는 애착이 생깁니다.
**경로**: `assets/roles/trader.png`, `producer.png`, `finance.png`, `analyst.png`
**규격**: 각 256 × 256 px · PNG · **투명 배경 필요** · 각 30KB 이하
**중요**: 네 개를 **한 번에 한 장으로 뽑고 나눠 자르면** 스타일이 잘 맞습니다.

```
Four cute character avatars in a 2x2 grid, same art style, same proportions,
head-and-shoulders portraits, friendly cartoon faces, diverse and gender-neutral,
each on a transparent background:
1) a trade negotiator wearing a travel cloak, holding a rolled contract
2) a factory manager wearing a hard hat and work apron, holding a wrench
3) a treasurer wearing a neat vest, holding a small money pouch and coin
4) an analyst wearing round glasses, holding a magnifying glass over a small chart
Simple flat shapes, no facial detail beyond friendly dot eyes and a small smile.
```

**한글 설명:** 2×2 격자로 캐릭터 넷을 같은 스타일·같은 비율의 상반신으로.
(1) 여행용 망토를 두르고 말린 계약서를 든 무역대표 (2) 안전모와 작업 앞치마에 렌치를 든 생산부장
(3) 단정한 조끼에 돈주머니와 동전을 든 재무관 (4) 동그란 안경에 돋보기로 그래프를 보는 분석가.
얼굴은 점 눈에 작은 미소 정도로 단순하게.

---

### B-3. 시상대 · 트로피

**용도**: 게임 끝난 뒤 결과 발표 화면. 수업의 마지막 장면이라 임팩트가 필요합니다.
지금은 CSS 사각형 단상인데, 그림이 들어가면 훨씬 축제 같아집니다.
**경로**: `assets/podium.png`, `assets/trophy.png`
**규격**: 시상대 900 × 400 px / 트로피 300 × 300 px · PNG · **투명 배경 필요**

```
[시상대] A three-tier award podium viewed straight from the front,
made of polished wood with golden trim. The tallest block in the center,
medium on the left, shortest on the right. Confetti and small sparkles
floating around it. Festive and celebratory. Transparent background.
No numbers on the blocks.

[트로피] A shiny golden trophy cup with two handles on a small wooden base,
decorated with a tiny ship engraving, radiating soft golden light.
Transparent background, centered.
```

**한글 설명:** 정면에서 본 3단 시상대. 광택 나는 나무에 금색 테두리, 가운데가 가장 높고
왼쪽이 중간, 오른쪽이 가장 낮게. 주변에 색종이와 반짝임. **단상에 숫자는 넣지 마세요.**
트로피는 손잡이 둘 달린 금색 우승컵에 작은 배 문양.

---

### B-4. 이벤트 카드 배경 6종

**용도**: 이벤트 발동 시 뜨는 속보 배너의 배경. 이벤트가 128종이라 하나씩은 불가능하니
**분류별로 6장**만 만들어 돌려 씁니다.
**경로**: `assets/events/weather.png`, `economy.png`, `tech.png`, `trend.png`, `accident.png`, `rare.png`
**규격**: 각 800 × 200 px · PNG 또는 JPG · 각 50KB 이하
**중요**: 위에 흰 글자가 얹히므로 **어둡고 단순해야** 합니다.

```
Six wide dark banner backgrounds, each 4:1 ratio, subtle and low contrast
so white text can be placed on top. Vignette darkening on the left side.
1) WEATHER: storm clouds, rain streaks and a lightning flash over a rough sea
2) ECONOMY: abstract rising and falling line graphs with coins and bar shapes
3) TECHNOLOGY: circuit board traces, glowing chip shapes, soft blue light
4) TREND: floating hearts, sparkles and speech bubble shapes, warm pink and gold
5) ACCIDENT: cracked ground, warning stripes, drifting smoke, muted orange
6) RARE: cosmic purple nebula with stars and magical golden sparkles
All must be dark enough for white text overlay. No text, no letters, no numbers.
```

**한글 설명:** 가로로 긴 어두운 배너 배경 6종. 흰 글자를 얹을 거라 **대비가 낮고 어두워야** 합니다.
순서대로 (1) 날씨: 먹구름·빗줄기·번개 (2) 경제: 오르내리는 선 그래프와 동전 (3) 기술: 회로 기판과
반도체, 푸른빛 (4) 유행: 하트·반짝임·말풍선, 분홍과 금색 (5) 사고: 갈라진 땅·경고 줄무늬·연기
(6) 희귀: 보랏빛 우주와 별, 금빛 마법 반짝임.

---

## C. 여유가 되면

> 아래 두 가지는 **개수가 많아 품이 많이 듭니다.** 먼저 A와 B를 끝낸 뒤에 도전하세요.
> 안 만들어도 지금처럼 이모지로 잘 돌아갑니다.

### C-1. 자원 아이콘 세트

**용도**: 지금은 자원이 이모지(🛢️ 🌾 💾)로 표시됩니다. 기기마다 모양이 달라 보이는데,
직접 만든 아이콘을 쓰면 어디서나 똑같이 보이고 훨씬 통일감 있습니다.
**개수**: 세계 모드 36종 + 한국 지역 모드 30종 = 총 66종
**경로**: `assets/resources/{자원id}.png` (예: `oil.png`, `steel.png`, `tangerine.png`)
**규격**: 각 128 × 128 px · PNG · **투명 배경 필요** · 각 12KB 이하

> 자원 id 전체 목록은 `js/presets.js` 파일 안에 있습니다. 필요하시면 목록만 따로 뽑아 드릴게요.

**한 번에 9개씩 뽑는 방법을 권합니다** (그래야 스타일이 맞습니다):

```
A 3x3 grid of simple flat icons in identical art style, identical line weight,
identical lighting, each centered in its own cell on a transparent background.
Chunky rounded shapes with a thick dark navy outline and one soft highlight.
The nine icons are: [여기에 9개를 영어로 나열]
Consistent size and visual weight across all nine. No text, no labels.
```

**9개 묶음 예시** (세계 모드):
| 묶음 | 프롬프트에 넣을 목록 |
|---|---|
| 에너지·광물 1 | `an oil barrel, a gas flame, a coal lump, an iron ore rock, a copper ingot, a lithium battery cell, a rare earth crystal, a silicon wafer, a timber log` |
| 농산물 | `a wheat sheaf, a rice bowl, a coffee bean sack, a cacao pod, a sugarcane stalk, a grape bunch, a cotton boll, a rubber tree tap, a fish` |
| 1차 가공품 | `a steel beam, a plastic bottle, a computer chip, a battery pack, a fabric roll, a sugar bag, a flour sack, a wine bottle, a car tire` |
| 완제품 | `a small car, a smartphone, an airplane, a folded t-shirt, a chocolate bar, a croissant, a food can, a wooden chair, a beef steak` |

**한국 지역 모드 예시**:
| 묶음 | 프롬프트에 넣을 목록 |
|---|---|
| 과일·채소 | `a tangerine, an apple, a Korean melon, a strawberry, a grape bunch, a potato, a napa cabbage, a garlic bulb, a red chili pepper` |
| 축산·수산 | `a cow, a milk bottle, a fish, an abalone shell, a ginseng root, a green tea leaf, a rice sack, a cheese wedge, an egg` |
| 가공식품 | `a kimchi jar, a juice carton, a jam jar, a rice cake skewer, a traditional Korean liquor bottle, a red ginseng extract jar, a tea box, a wine bottle, a lunch box` |

---

### C-2. 국가 문장(엠블럼) 세트

**용도**: 지금은 국기 이모지를 쓰는데, **윈도우 PC에서는 국기가 "KR" 같은 두 글자로 보입니다.**
직접 만든 문장을 쓰면 어느 기기에서나 똑같이 보입니다.
**개수**: 세계 14개국 + 한국 16개 지역 = 30종
**경로**: `assets/nations/{나라id}.png` (예: `korea.png`, `jeju.png`)
**규격**: 각 200 × 200 px · PNG · **투명 배경 필요** · 각 15KB 이하

**나라마다 특산품을 문장에 담는 방식**을 권합니다. 국기를 그대로 베끼지 않아도 되고,
오히려 그게 더 게임답고 교육적입니다.

```
A circular emblem badge in a heraldic shield style, transparent background.
Inside the circle: [그 나라의 대표 특산품 1~2개를 영어로].
Ring border in [그 나라 대표색] with small decorative notches.
Flat vector, bold simple shapes, readable at 44 pixels.
No text, no letters, no flags.
```

**나라별 소재 예시**
| 나라 | 문장에 담을 것 |
|---|---|
| 한국 | `a computer chip and a fish` |
| 미국 | `a wheat sheaf and an oil derrick` |
| 사우디아라비아 | `an oil derrick with desert dunes` |
| 브라질 | `coffee beans and a rainforest leaf` |
| 칠레 | `a copper ingot and mountain peaks` |
| 호주 | `an iron ore rock and a sheep` |
| 프랑스 | `a grape bunch and a wheat stalk` |
| 가나 | `a cacao pod and a timber log` |
| 제주 | `a tangerine and a volcanic peak` |
| 부산 | `a fish and harbor waves` |
| 안동 | `an apple and a cow` |
| 보성 | `green tea leaves on terraced hills` |

---

## 만든 뒤 할 일

### 1. 파일을 제자리에 넣으세요
위에 적힌 경로 그대로 `assets/` 폴더 안에 저장하세요. 파일 이름이 다르면 연결이 안 됩니다.

### 2. 용량을 확인하세요
```
assets 폴더 전체가 3MB를 넘지 않는 게 좋습니다.
```
넘으면 [squoosh.app](https://squoosh.app)에서 품질을 조금 낮춰 다시 저장하세요.

### 3. 저에게 알려주세요
어떤 파일을 만들었는지 말씀해 주시면 코드에 연결하겠습니다. 연결할 때 이렇게 처리합니다.

- **그림이 없으면 지금 모습 그대로 나오게** 만듭니다. 일부만 만드셔도 화면이 깨지지 않습니다.
- 화면 크기에 맞춰 자동으로 조절되게 하고, 느린 인터넷에서는 나중에 불러오도록 합니다.
- 시각장애 학생을 위해 그림마다 설명(alt)을 붙입니다.

### 4. 직접 연결하고 싶다면

대부분은 `css/style.css` 한 곳만 고치면 됩니다.

**배경 지도 (A-2)** — `css/style.css`의 `body` 안 `background-image`에서
`url("data:image/svg+xml,...")` 부분을 `url("../assets/bg-map.png")` 으로 바꾸세요.

**파비콘 (A-3)** — 각 HTML 파일 `<head>`의 `<link rel="icon" ...>` 줄을 이렇게 바꾸세요.
```html
<link rel="icon" href="assets/icon-512.png">
```

**공유 이미지 (A-4)** — `index.html`의 `<head>` 안에 아래를 추가하세요.
```html
<meta property="og:title" content="세계로 무역 게임">
<meta property="og:description" content="나라끼리 협상하며 자원을 사고파는 교실용 무역 게임">
<meta property="og:image" content="assets/og-image.png">
```

**히어로 그림 (A-1)** — `index.html`의 `<div class="hero">` 안, `<div class="logo">🚢</div>` 를
아래로 바꾸세요.
```html
<img class="hero-img" src="assets/hero-port.png" alt="여러 나라의 배가 드나드는 항구 풍경" loading="lazy">
```
그리고 `css/style.css` 아무 곳에나 아래를 추가하세요.
```css
.hero-img { width: 100%; max-width: 620px; height: auto; border-radius: 18px; }
```

나머지(등급 프레임, 역할 아바타, 자원 아이콘 등)는 자바스크립트도 함께 고쳐야 하니
저에게 맡겨 주시는 편이 빠릅니다.

---

## 체크리스트

만드신 것에 표시해 두시면 진행 상황을 알기 쉽습니다.

**A. 꼭 필요한 것**
- [ ] A-1 히어로 일러스트 `assets/hero-port.png`
- [ ] A-2 배경 지도 텍스처 `assets/bg-map.png`
- [ ] A-3 파비콘 `assets/icon-512.png`
- [ ] A-4 링크 공유 이미지 `assets/og-image.png`
- [ ] A-5 빈 화면 3종 `assets/empty/`

**B. 있으면 좋은 것**
- [ ] B-1 등급 프레임 3종 `assets/frames/`
- [ ] B-2 역할 아바타 4종 `assets/roles/`
- [ ] B-3 시상대·트로피 `assets/podium.png`, `assets/trophy.png`
- [ ] B-4 이벤트 배경 6종 `assets/events/`

**C. 여유가 되면**
- [ ] C-1 자원 아이콘 66종 `assets/resources/`
- [ ] C-2 국가 문장 30종 `assets/nations/`

---

## 부록: 파일 이름표

C-1, C-2를 만드실 때 **파일 이름을 아래 id 그대로** 지어주세요. 그래야 코드가 자동으로 찾습니다.

### 세계 모드 자원 36종 → `assets/resources/{id}.png`

**원자재 19종**
| id | 지금 이모지 | 이름 | id | 지금 이모지 | 이름 |
|---|---|---|---|---|---|
| `oil` | 🛢️ | 석유 | `cotton` | ☁️ | 면화 |
| `gas` | 🔥 | 천연가스 | `rubber` | 🛞 | 고무 |
| `coal` | ⚫ | 석탄 | `timber` | 🪵 | 목재 |
| `iron_ore` | 🪨 | 철광석 | `seafood` | 🐟 | 수산물 |
| `copper` | 🥉 | 구리 | `beef` | 🥩 | 소고기 |
| `lithium` | 🔋 | 리튬 | `wheat` | 🌾 | 밀 |
| `rare_earth` | 💎 | 희토류 | `rice` | 🍚 | 쌀 |
| `silicon` | 🧪 | 규소 | `coffee` | ☕ | 커피원두 |
| `cacao` | 🍫 | 카카오 | `sugarcane` | 🎋 | 사탕수수 |
| `grape` | 🍇 | 포도 | | | |

**1차 가공품 10종**
`steel`(철강) · `plastic`(플라스틱) · `chip`(반도체) · `battery`(배터리) · `fabric`(원단) ·
`sugar`(설탕) · `flour`(밀가루) · `wine`(와인) · `tire`(타이어) · `furniture`(가구)

**완제품 7종**
`car`(자동차) · `phone`(스마트폰) · `airplane`(항공기) · `clothes`(의류) ·
`chocolate`(초콜릿) · `bread`(빵·과자) · `canned`(수산물 통조림)

### 한국 지역 모드 자원 30종 → `assets/resources/{id}.png`

**원자재 16종**
`cabbage`(배추) · `garlic`(마늘) · `pepper`(고추) · `rice_kr`(쌀) · `potato`(감자) ·
`tangerine`(감귤) · `apple`(사과) · `melon`(참외) · `strawberry`(딸기) · `grape_kr`(포도) ·
`ginseng`(인삼) · `tea_leaf`(녹차잎) · `milk`(우유) · `hanwoo`(한우) · `fish_kr`(수산물) · `abalone`(전복)

**1차 가공품 9종**
`kimchi`(김치) · `juice`(감귤주스) · `jam`(사과잼) · `tteok`(떡) · `makgeolli`(막걸리) ·
`cheese`(치즈) · `red_ginseng`(홍삼정) · `green_tea`(녹차) · `wine_kr`(포도와인)

**완제품 5종**
`dosirak`(프리미엄 도시락) · `cosmetic`(한방 화장품) · `cake`(딸기 케이크) ·
`seafood_set`(해물탕 세트) · `gift_set`(과일 선물세트)

### 나라·지역 30종 → `assets/nations/{id}.png`

**세계 14개국**
`korea`(한국) · `usa`(미국) · `china`(중국) · `japan`(일본) · `saudi`(사우디아라비아) ·
`russia`(러시아) · `australia`(호주) · `brazil`(브라질) · `vietnam`(베트남) · `india`(인도) ·
`chile`(칠레) · `france`(프랑스) · `ghana`(가나) · `canada`(캐나다)

**한국 16개 지역**
`jeju`(제주) · `andong`(안동) · `hoengseong`(횡성) · `seongju`(성주) · `boseong`(보성) ·
`gimje`(김제) · `pyeongchang`(평창) · `busan`(부산) · `wando`(완도) · `uiseong`(의성) ·
`nonsan`(논산) · `yeongdong`(영동) · `haenam`(해남) · `geumsan`(금산) ·
`cheongyang`(청양) · `icheon`(이천)

> 💡 **한국 지역 문장은 이렇게 만들면 좋습니다**: 그 지역 특산물 + 그 지역 상징물.
> 예를 들어 제주는 감귤과 한라산, 부산은 물고기와 바다·다리, 평창은 감자와 눈 덮인 산,
> 완도는 전복과 파도, 담양 대신 들어간 보성은 계단식 차밭.

---

## 저작권 참고

수업에 쓰실 자료이니 **직접 생성한 이미지를 쓰는 것이 가장 안전합니다.**
인터넷에서 찾은 그림이나 실제 국기·기업 로고를 넣지 마세요.
생성 AI로 만든 이미지도 도구마다 이용 약관이 다르니, 학교 밖에 공개하실 계획이라면
사용하신 도구의 약관을 한 번 확인해 보세요.
