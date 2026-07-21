# assets 폴더

여기에 그림 파일을 넣습니다. 프롬프트와 규격은 프로젝트 폴더의 **`ASSETS.md`** 를 보세요.

```
assets/
├── hero-port.png       랜딩 화면 항구 그림      1600×900
├── bg-map.png          배경 지도 텍스처(반복)   512×512  투명
├── icon-512.png        파비콘                  512×512
├── og-image.png        링크 공유 이미지         1200×630
├── podium.png          시상대                  900×400  투명
├── trophy.png          트로피                  300×300  투명
│
├── empty/              빈 화면 그림 3종         400×300  투명
│   ├── warehouse.png
│   ├── trade.png
│   └── meeting.png
│
├── frames/             자원 등급 테두리 3종     300×120  투명
│   ├── tier-raw.png
│   ├── tier-mid.png
│   └── tier-final.png
│
├── roles/              역할 아바타 4종          256×256  투명
│   ├── trader.png
│   ├── producer.png
│   ├── finance.png
│   └── analyst.png
│
├── events/             이벤트 배너 배경 6종     800×200
│   ├── weather.png
│   ├── economy.png
│   ├── tech.png
│   ├── trend.png
│   ├── accident.png
│   └── rare.png
│
├── resources/          자원 아이콘 66종         128×128  투명
│   └── {자원id}.png        (id 목록은 ASSETS.md 부록 참고)
│
└── nations/            나라 문장 30종           200×200  투명
    └── {나라id}.png        (id 목록은 ASSETS.md 부록 참고)
```

## 넣을 때 지킬 것

- **파일 이름을 위와 똑같이** 지어주세요. 다르면 코드가 못 찾습니다.
- **폴더 전체가 3MB를 넘지 않게** 해주세요. 학교 와이파이에서 30명이 동시에 받습니다.
  용량이 크면 [squoosh.app](https://squoosh.app)에서 압축하세요.
- **일부만 넣어도 됩니다.** 없는 그림은 지금처럼 이모지로 나오게 되어 있어 화면이 깨지지 않습니다.
