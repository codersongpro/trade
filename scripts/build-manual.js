#!/usr/bin/env node
// docs/manual-template.html 의 {{IMG:key}} 자리를 docs/assets/manual/key.webp 참조로 바꿔
// docs/manual.html 을 생성한다. 이미지를 base64로 통째로 박아넣지 않고 실제 파일로 참조하므로
// 수정 때마다 git diff가 가벼워지고, 플레이트 이미지는 loading="lazy"로 지연 로딩된다.
//
// 사용법: node scripts/build-manual.js

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TEMPLATE_PATH = path.join(ROOT, 'docs/manual-template.html');
const OUTPUT_PATH = path.join(ROOT, 'docs/manual.html');
const ASSETS_DIR = path.join(ROOT, 'docs/assets/manual');

// 뷰포트 최상단에서 바로 보이는 이미지는 지연 로딩을 걸지 않는다 (LCP 저하 방지).
const EAGER_KEYS = new Set(['landing_hero']);

function findAssetFile(key) {
  const candidates = fs.readdirSync(ASSETS_DIR).filter((f) => f.startsWith(`${key}.`));
  if (candidates.length === 0) {
    throw new Error(`docs/assets/manual/ 에 "${key}"로 시작하는 이미지 파일이 없습니다.`);
  }
  if (candidates.length > 1) {
    throw new Error(`"${key}"에 매칭되는 파일이 여러 개입니다: ${candidates.join(', ')}`);
  }
  return candidates[0];
}

function build() {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  const imgTagRe = /<img\s+src="\{\{IMG:([a-zA-Z0-9_]+)\}\}"([^>]*)>/g;
  const usedKeys = new Set();

  const html = template.replace(imgTagRe, (full, key, rest) => {
    usedKeys.add(key);
    const file = findAssetFile(key);
    const lazy = EAGER_KEYS.has(key) ? '' : ' loading="lazy"';
    return `<img src="assets/manual/${file}"${rest}${lazy}>`;
  });

  if (html.includes('{{IMG:')) {
    const leftover = html.match(/\{\{IMG:[a-zA-Z0-9_]+\}\}/g);
    throw new Error(`치환되지 않은 {{IMG:...}} 자리가 남아있습니다: ${leftover.join(', ')}`);
  }

  fs.writeFileSync(OUTPUT_PATH, html);

  const outSize = fs.statSync(OUTPUT_PATH).size;
  console.log(`docs/manual.html 생성 완료 (이미지 ${usedKeys.size}개 참조, 본문 ${(outSize / 1024).toFixed(1)}KB)`);
}

build();
