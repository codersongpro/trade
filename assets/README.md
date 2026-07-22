# assets 폴더

게임 화면에 쓰이는 그림 파일들입니다. 프롬프트와 규격은 프로젝트 폴더의 **`ASSETS.md`** / **`ASSETS-MISSING.md`** 를 보세요.

> 불투명한 그림(항구·파비콘·공유이미지·이벤트배너)은 용량을 줄이려고 **JPG**로,
> 투명 배경이 필요한 그림은 **PNG**로 저장돼 있습니다. 코드가 이 확장자에 맞춰 불러옵니다.

```
assets/
├── hero-port.jpg       랜딩 화면 항구 그림      1600×900        연결됨 (index.html)
├── bg-map.png          배경 지도 텍스처(반복)   512×512  투명   연결됨 (모든 화면 배경)
├── icon-512.jpg        파비콘                  512×512         연결됨 (index.html)
├── og-image.jpg        링크 공유 이미지         1200×630        연결됨 (index.html)
├── podium.png          시상대(미사용 예비)      900×400  투명
├── trophy.png          트로피                  300×300  투명   연결됨 (순위·결과 화면)
│
├── empty/              빈 화면 그림 3종         400×300  투명   연결됨 (창고·거래·회의)
│   ├── warehouse.png       빈 창고
│   ├── trade.png           거래 없음
│   └── meeting.png         회의 시작
│
├── frames/             자원 등급 테두리 3종     300×120  투명   연결됨 (자원 카드)
│   ├── tier-raw.png
│   ├── tier-mid.png
│   └── tier-final.png
│
├── roles/              역할 아바타 4종          256×256  투명   연결됨 (역할 선택·모둠)
│   ├── trader.png
│   ├── producer.png
│   ├── finance.png
│   └── analyst.png
│
├── events/             이벤트 배너 배경 6종     800×200         연결됨 (이벤트 속보 배너)
│   ├── weather.jpg         날씨·기후
│   ├── economy.jpg         경제·시세
│   ├── tech.jpg            기술·산업
│   ├── trend.jpg           유행·문화
│   ├── accident.jpg        사고·파업·규제
│   └── rare.jpg            희귀(특종) 이벤트
│
├── resources/          자원 아이콘             128×128  투명   연결됨 (있는 것만, 나머지는 이모지)
│   └── {자원id}.png        현재 4종: cake, cosmetic, seafood_set, gift_set
│
└── nations/            나라·지역 문장          200×200  투명   연결됨 (있는 것만, 나머지는 이모지+색)
    └── {나라id}.png        현재 36종 (ASSETS-MISSING.md 목록 참고)
```

## 그림이 어떻게 쓰이나

- **그림이 있으면 그림, 없으면 이모지**로 자동 대체됩니다. 그래서 일부만 있어도 화면이 깨지지 않습니다.
  - 자원 아이콘: `js/ui.js`의 `RESOURCE_ICONS` 목록에 있는 자원만 그림을 씁니다.
  - 나라 문장: `js/ui.js`의 `NATION_CRESTS` 목록에 있는 나라만 그림을 씁니다.
  - 새 그림을 추가하면 그 목록에 id를 더해야 화면에 나타납니다.
- 이미지 경로는 `/assets/...`(맨 앞 슬래시) 절대경로입니다. Vercel처럼 최상위(root)에 배포할 때 맞습니다.

## 넣을 때 지킬 것

- **파일 이름을 위와 똑같이** 지어주세요. 다르면 코드가 못 찾습니다.
- **폴더 전체가 3MB를 넘지 않게** 해주세요(현재 약 1.4MB). 학교 와이파이에서 30명이 동시에 받습니다.
  용량이 크면 [squoosh.app](https://squoosh.app)에서 압축하세요.
