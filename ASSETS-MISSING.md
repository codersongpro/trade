# 🧩 빠진 그래픽 에셋 프롬프트 (ASSETS.md 보충)

`ASSETS.md`에 있던 예시들을 실제 게임 데이터(`js/presets.js`)와 대조해 보니, **정작 프롬프트가 없는 항목들**이 있었습니다. 이 문서는 그 빈칸만 채우는 보충 자료입니다.

> 이 문서는 `ASSETS.md`와 짝을 이룹니다. 파일 저장 경로·규격·용량 같은 공통 규칙은 그대로 `ASSETS.md`를 따르고, 여기서는 **내용(프롬프트)만** 다룹니다.

---

## 무엇이 빠져 있었나

| 항목 | 전체 | 예시가 있던 것 | **빠진 것** |
|---|---|---|---|
| 자원 아이콘 (C-1) | 66종 | 62종 | **4종** (한국 완제품) — 그리고 잘못 들어간 항목 1개 |
| 국가 문장 (C-2) | 48종 | 12종 | **36종** (세계 6 + 한국 시/군/구 13 + 한국 시/도 17) |

---

## 공통 스타일 (모든 프롬프트에 공통 적용)

`ASSETS.md`와 동일합니다. 이미 그쪽에서 준비하셨다면 건너뛰어도 됩니다.

```
Art style: flat vector illustration with soft depth and subtle grain texture,
warm and friendly, rounded shapes, thick confident outlines, storybook quality,
suitable for a children's educational game about world trade.
Color palette: deep navy blue #0d1628 and #1e2f52, warm gold #f0b429,
parchment cream #fffdf7, bright blue #3d6ef5, sea green #4f9d69.
No text, no letters, no words, no numbers, no watermark.
```

---

## 1. 자원 아이콘 — 빠진 4개 (한국 완제품)

**용도**: 창고·시세·제작소에 뜨는 자원 칸의 그림. `ASSETS.md`의 한국 지역 예시 묶음(과일·채소 / 축산·수산 / 가공식품)에서 **완제품 5종 중 4종이 빠져 있었습니다** (`dosirak`만 "lunch box"로 들어가 있었고, 나머지는 없었습니다).

**경로**: `assets/resources/{id}.png` · **규격**: 128 × 128 px · PNG · 투명 배경 · 각 12KB 이하

```
A 2x2 grid of simple flat icons in identical art style, identical line weight,
identical lighting, each centered in its own cell on a transparent background.
Chunky rounded shapes with a thick dark navy outline and one soft highlight.
The four icons are: a jar of Korean herbal cosmetic cream with a ginseng leaf motif,
a slice of strawberry shortcake, a bowl of spicy seafood stew with a crab claw visible,
a wrapped gift box of assorted fruit tied with ribbon.
Consistent size and visual weight across all four. No text, no labels.
```

| 파일명 | 무엇 | 프롬프트 속 표현 |
|---|---|---|
| `cosmetic.png` | 한방 화장품 | a jar of Korean herbal cosmetic cream with a ginseng leaf motif |
| `cake.png` | 딸기 케이크 | a slice of strawberry shortcake |
| `seafood_set.png` | 해물탕 세트 | a bowl of spicy seafood stew with a crab claw visible |
| `gift_set.png` | 과일 선물세트 | a wrapped gift box of assorted fruit tied with ribbon |

> 🛠️ **오류 수정**: `ASSETS.md`의 "축산·수산" 묶음 예시에 있던 `an egg`(계란)는 실제 게임에 없는 자원입니다. 그 자리는 원래 `cheese`(치즈, 가공품)였어야 하는데 `축산·수산` 묶음의 "a cheese wedge"와 중복 표기된 채로 `egg`가 잘못 끼어든 것이었습니다. **`egg` 아이콘은 만드실 필요 없습니다.**

---

## 2. 국가 문장 — 빠진 36개

**용도**: 나라 선택 화면·순위표·교사 대시보드에 뜨는 원형 배지. `ASSETS.md`는 문장 안에 **그 지역 특산물을 담는 방식**을 권합니다 (국기를 베끼지 않아도 되고 더 교육적입니다).

**경로**: `assets/nations/{id}.png` · **규격**: 200 × 200 px · PNG · 투명 배경 · 각 15KB 이하

공통 틀:
```
A circular emblem badge in a heraldic shield style, transparent background.
Inside the circle: [아래 표의 내용].
Ring border in [그 나라 대표색] with small decorative notches.
Flat vector, bold simple shapes, readable at 44 pixels.
No text, no letters, no flags.
```

### 2-1. 세계 모드 — 빠진 6개국

`ASSETS.md`에는 한국·미국·사우디·브라질·칠레·호주·프랑스·가나 8개만 있었습니다. 나머지 6개입니다.

| 파일명 | 나라 | 문장에 담을 것 | 실제 근거 (턴당 생산 자원) |
|---|---|---|---|
| `china.png` | 중국 | `a rare earth crystal and a cotton boll` | 희토류·면화 |
| `japan.png` | 일본 | `a fish and a silicon wafer` | 수산물·규소 |
| `russia.png` | 러시아 | `a gas flame and a coal lump` | 천연가스·석탄 |
| `vietnam.png` | 베트남 | `a rice sheaf and a rubber tree tap` | 쌀·고무 |
| `india.png` | 인도 | `a cotton boll and a bowl of rice` | 면화·쌀 |
| `canada.png` | 캐나다 | `a timber log and a wheat sheaf` | 목재·밀 |

### 2-2. 한국 시/군/구 — 빠진 13곳 (청주 포함)

`ASSETS.md`에는 제주·부산·안동·보성 4곳만 있었습니다. 나머지 13곳입니다.

| 파일명 | 지역 | 문장에 담을 것 | 실제 근거 |
|---|---|---|---|
| `hoengseong.png` | 횡성 | `a cow and a milk bottle` | 한우·우유 |
| `seongju.png` | 성주 | `a Korean melon (chamoe) on a vine` | 참외 |
| `gimje.png` | 김제 | `a rice paddy field with a rice sheaf` | 쌀(김제평야) |
| `pyeongchang.png` | 평창 | `potato sacks against a snow-capped mountain` | 감자·눈산(평창 겨울) |
| `wando.png` | 완도 | `an abalone shell with ocean waves` | 전복 |
| `uiseong.png` | 의성 | `braided garlic bulbs` | 마늘 |
| `nonsan.png` | 논산 | `a cluster of strawberries` | 딸기 |
| `yeongdong.png` | 영동 | `a grape bunch on a vine` | 포도 |
| `haenam.png` | 해남 | `a napa cabbage` | 배추 |
| `geumsan.png` | 금산 | `a ginseng root` | 인삼 |
| `cheongyang.png` | 청양 | `a bundle of red chili peppers` | 고추 |
| `icheon.png` | 이천 | `a bowl of rice steaming, resting on a ceramic dish` | 쌀 + 이천 도자기 |
| `cheongju.png` | 청주 | `a fortress wall silhouette with a grape bunch` | 상당산성 + 포도 |

### 2-3. 한국 시/도 — 17곳 전체 (지난번 새로 추가된 모드)

이 세트는 **`ASSETS.md`에 하나도 없던** 완전히 새로운 항목입니다. 실제 각 시/도의 산업·특산 이미지를 살렸습니다.

| 파일명 | 지역 | 문장에 담을 것 | 실제 근거 |
|---|---|---|---|
| `seoul.png` | 서울특별시 | `a ginseng root beside a traditional mortar and pestle` | 경동시장 약령시 |
| `busan.png` | 부산광역시 | `a fish beside a suspension bridge silhouette` | 수산물 + 광안대교 |
| `daegu.png` | 대구광역시 | `an apple` | 대구 사과 |
| `incheon.png` | 인천광역시 | `a cargo ship silhouette beside a napa cabbage` | 인천항 + 강화도 농업 |
| `gwangju.png` | 광주광역시 | `a napa cabbage beside a kimchi jar` | 광주김치 |
| `daejeon.png` | 대전광역시 | `a strawberry beside a laboratory flask` | 딸기 + 대덕연구단지 |
| `ulsan.png` | 울산광역시 | `an industrial crane silhouette beside a milk bottle` | 공업도시 + 목장 |
| `sejong.png` | 세종특별자치시 | `a rice sheaf beside a government building silhouette` | 행정중심복합도시 |
| `gyeonggi.png` | 경기도 | `a grape bunch beside a factory silhouette` | 농업 + 산업 복합 |
| `gangwon.png` | 강원특별자치도 | `a potato against a snow-capped mountain peak` | 감자·눈산 |
| `chungbuk.png` | 충청북도 | `red chili peppers beside an apple` | 괴산 고추·충주 사과 |
| `chungnam.png` | 충청남도 | `a ginseng root beside an oil refinery silhouette` | 금산 인삼 + 서산 석유화학 |
| `jeonbuk.png` | 전북특별자치도 | `red chili peppers beside a rice sheaf` | 고추장 재료 + 곡창지대 |
| `jeonnam.png` | 전라남도 | `a rice sheaf beside a fishing boat` | 곡창지대 + 수산업 |
| `gyeongbuk.png` | 경상북도 | `an apple beside a steel beam` | 경북 사과 + 포항제철 |
| `gyeongnam.png` | 경상남도 | `green tea leaves on a terraced hillside beside a shipbuilding crane` | 하동 녹차 + 거제 조선업 |
| `jeju_do.png` | 제주특별자치도 | `a tangerine against a volcanic mountain peak` | 감귤 + 한라산 |

> 💡 시/군/구의 `busan.png`과 시/도의 `busan.png`은 **같은 파일명**입니다 (서로 다른 폴더 규칙이 없어요). 두 그림을 다르게 만드시려면 위 표의 다리 이미지처럼 소재를 다르게 잡아 구분한 뒤, 파일이 준비되면 저에게 말씀해 주세요 — 코드에서 두 스케일을 구분해 각각 다른 그림을 쓰도록 조정해 드리겠습니다. 지금 상태로는 어느 쪽을 저장하든 둘 다에 같은 그림이 쓰입니다.

---

## 체크리스트

- [ ] 자원 아이콘 4종 (`cosmetic`, `cake`, `seafood_set`, `gift_set`)
- [ ] 국가 문장 — 세계 6개국
- [ ] 국가 문장 — 한국 시/군/구 13곳 (청주 포함)
- [ ] 국가 문장 — 한국 시/도 17곳

다 만드신 뒤 저장 경로는 `ASSETS.md`와 동일합니다 (`assets/resources/`, `assets/nations/`). 파일이 준비되면 알려주세요, 코드에 연결하겠습니다.
