#!/usr/bin/env node
// 유지보수자용 점검 스크립트. 게임 배포에는 전혀 쓰이지 않으며, 레포에 playwright를
// 의존성으로 추가하지도 않는다 (package.json 없음). 로컬에서 수동으로 실행할 때만
// `npm install playwright` 등으로 따로 설치해서 쓴다.
//
// docs/manual-template.html의 .plates 레이아웃을 몇 가지 화면 폭에서 렌더링해,
// 같은 줄에 놓인 .plate들의 너비가 고르게 나뉘었는지 검사한다.
// (이전에 flex-wrap 설정 때문에 3장짜리 장면만 2장+1장으로 깨졌던 문제의 재발 방지용)
//
// 사용법: node scripts/build-manual.js && node scripts/check-manual-plates.js

const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('playwright가 설치돼 있지 않습니다. 이 점검은 선택 사항이며,');
  console.error('쓰고 싶다면 별도로 `npm install playwright`를 실행한 뒤 다시 돌려주세요.');
  process.exit(0);
}

const MANUAL_PATH = `file://${path.join(__dirname, '..', 'docs', 'manual.html')}`;
const WIDTHS = [375, 640, 768, 900, 1200];
const TOLERANCE_PX = 2;

async function checkAtWidth(browser, width) {
  const page = await browser.newPage({ viewport: { width, height: 1200 } });
  await page.goto(MANUAL_PATH);

  const groups = await page.$$eval('.plates', (nodes) =>
    nodes.map((node) => {
      const rows = new Map(); // y좌표(줄)별로 묶는다
      [...node.children].forEach((child) => {
        const r = child.getBoundingClientRect();
        const y = Math.round(r.top);
        if (!rows.has(y)) rows.set(y, []);
        rows.get(y).push(Math.round(r.width));
      });
      return [...rows.values()];
    })
  );

  await page.close();

  const problems = [];
  groups.forEach((rows, groupIdx) => {
    rows.forEach((widths, rowIdx) => {
      if (widths.length < 2) return;
      const max = Math.max(...widths);
      const min = Math.min(...widths);
      if (max - min > TOLERANCE_PX) {
        problems.push({ width, groupIdx, rowIdx, widths });
      }
    });
  });
  return problems;
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH });
  let allProblems = [];
  for (const w of WIDTHS) {
    const problems = await checkAtWidth(browser, w);
    allProblems = allProblems.concat(problems);
  }
  await browser.close();

  if (allProblems.length === 0) {
    console.log(`OK — ${WIDTHS.join(', ')}px 폭 모두에서 .plates 한 줄 안의 .plate 너비가 고르게 나뉘었습니다.`);
    process.exit(0);
  }

  console.error('다음 지점에서 같은 줄의 .plate 너비가 고르지 않습니다:');
  for (const p of allProblems) {
    console.error(`  - ${p.width}px 폭, ${p.groupIdx}번째 .plates의 ${p.rowIdx}번째 줄: widths=${JSON.stringify(p.widths)}`);
  }
  process.exit(1);
})();
