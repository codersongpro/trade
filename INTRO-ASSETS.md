# 🎬 인트로 화면 그래픽 에셋 가이드

첫 화면에 나오는 **환영 + 게임 방법 인트로**(6장 슬라이드)에 쓸 그림 프롬프트입니다.
지금은 큰 **이모지**로 예쁘게 돌아가고 있어요. 아래 그림을 만들어 넣으면 더 근사한 인트로가 됩니다.

> **그림이 없어도 인트로는 완성돼 있습니다.** 각 슬라이드는 이모지로 나오고,
> 같은 이름의 그림 파일을 `assets/intro/` 에 넣으면 **자동으로 그림으로 바뀝니다.** (코드 수정 불필요)

---

## 저장 위치와 규칙

```
assets/intro/
├── welcome.png     환영 (마스코트/로고)   → 없으면 🚢
├── produce.png     ① 생산                → 없으면 🌾
├── trade.png       ② 무역                → 없으면 🤝
├── decide.png      ③ 의사결정            → 없으면 🗳️
├── craft.png       ④ 가공·수출           → 없으면 🏭
└── win.png         ⑤ 목표                → 없으면 🏆
```

- **규격**: 각 정사각형 권장 **512 × 512 px**, PNG, **투명 배경**. (화면에는 180px로 표시)
- **용량**: 각 60KB 이하 권장. 여섯 장 합쳐 300KB를 넘지 않게 [squoosh.app](https://squoosh.app)에서 압축.
- **파일 이름을 위와 똑같이** 지어야 자동으로 연결됩니다.
- **일부만 넣어도 됩니다.** 넣은 것만 그림이 되고 나머지는 이모지로 남아요.

---

## 공통 스타일 (모든 프롬프트에 붙이세요)

기존 게임 그림(`ASSETS.md`)과 같은 결로 맞춥니다.

```
Art style: flat vector illustration with soft depth and subtle grain texture,
warm and friendly, rounded shapes, thick confident outlines, storybook quality,
cheerful mascot-driven scene for a children's educational trade game.
Color palette: deep navy blue #0d1628, warm gold #f0b429, parchment cream #fffdf7,
bright blue #3d6ef5, sea green #4f9d69. Centered subject, transparent background.
No text, no letters, no words, no numbers, no watermark.
```

**한글 요약:** 평면 벡터, 둥글고 친근한 형태, 또렷한 외곽선, 그림책 느낌. 남색·금색·크림·파랑·초록.
가운데 정렬, 투명 배경. **글자 절대 금지.**

> 💡 **일관성 비법**: 마스코트를 하나 정하면(예: 항해모를 쓴 귀여운 무역상 아이),
> 모든 슬라이드에 같은 마스코트를 등장시키면 통일감이 확 올라갑니다.
> 첫 그림이 맘에 들면 그걸 참고 이미지로 첨부하고 "같은 캐릭터·같은 스타일로"라고 요청하세요.

---

## 슬라이드별 프롬프트

### welcome.png — 환영 (마스코트)
```
A cute cheerful young merchant mascot wearing a sailor cap, waving hello,
standing on a small trading ship deck with colorful cargo crates.
Friendly dot eyes and a big smile. This is the game's welcome mascot.
```
**한글:** 항해모를 쓴 귀여운 꼬마 무역상 마스코트가 손을 흔들며 인사. 화물 상자가 실린 작은 배 위.
점 눈에 활짝 웃는 얼굴. 게임의 환영 캐릭터.

### produce.png — ① 생산
```
A happy farm-and-harbor scene: golden wheat, fruit crates and a fishing net
piled up, with a small "+1 each turn" feeling of things appearing.
The mascot happily gathering the goods into a basket.
```
**한글:** 밀·과일 상자·그물이 쌓인 밝은 농장&항구. 마스코트가 바구니에 특산품을 담는 모습.
매 턴 물건이 생겨나는 느낌.

### trade.png — ② 무역
```
Two friendly mascots shaking hands across a market stall, exchanging a crate
of goods for a bag of gold coins. Speech-bubble shapes (no text) suggesting
negotiation. Warm, lively marketplace.
```
**한글:** 시장 좌판을 사이에 두고 두 마스코트가 악수하며 물건 상자와 금화 주머니를 교환.
협상을 뜻하는 말풍선(글자 없이). 활기찬 시장.

### decide.png — ③ 의사결정 (강조 슬라이드)
```
A small team of three mascots around a round table raising their hands to vote,
a checkmark and a ballot shape floating above. Democratic, collaborative,
warm feeling of a group agreeing together.
```
**한글:** 둥근 탁자에 둘러앉은 세 마스코트가 손을 들어 투표. 위에 체크표시와 투표용지 모양.
함께 합의하는 민주적·협력적 분위기. (이 슬라이드가 "의사결정 학습"을 상징합니다)

### craft.png — ④ 가공·수출
```
A cheerful little factory turning raw materials (iron, oil) into a shiny finished
product (a car), with an arrow showing the value going up, and a cargo ship
sailing off to export it. Coins sparkle to show profit.
```
**한글:** 원자재(철·기름)를 반짝이는 완제품(자동차)으로 바꾸는 작은 공장, 값이 오르는 화살표,
수출하러 떠나는 화물선. 이익을 뜻하는 반짝이는 동전.

### win.png — ⑤ 목표
```
The mascot standing proudly on top of a gold winner's podium holding a trophy,
confetti and sparkles around, a stack of coins and treasure nearby.
Triumphant and celebratory.
```
**한글:** 마스코트가 금색 시상대 위에서 트로피를 들고 당당히 선 모습. 색종이와 반짝임,
옆에 동전·보물 더미. 승리의 축제 분위기.

---

## 만든 뒤

`assets/intro/` 에 파일을 넣기만 하면 새로고침 시 자동으로 인트로 그림이 바뀝니다.
넣고 나서 알려주시면 실제로 잘 뜨는지 확인해 드리겠습니다. (안 넣으셔도 이모지로 잘 돌아갑니다.)

## 체크리스트
- [ ] welcome.png (마스코트)
- [ ] produce.png (생산)
- [ ] trade.png (무역)
- [ ] decide.png (의사결정)
- [ ] craft.png (가공·수출)
- [ ] win.png (목표)
