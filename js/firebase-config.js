// ============================================================
// Firebase 설정
//
// ★ 여기에 본인의 Firebase 프로젝트 설정값을 붙여넣으세요! ★
//
// 1. https://console.firebase.google.com 접속 → 프로젝트 만들기
// 2. 빌드 → Realtime Database → 데이터베이스 만들기 (테스트 모드)
// 3. 프로젝트 설정(톱니바퀴) → 일반 → 내 앱 → 웹 앱 추가(</>)
// 4. 나오는 firebaseConfig 값을 아래에 그대로 붙여넣기
//
// 자세한 방법은 README.md 참고
// ============================================================

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000",
};

export function isConfigured() {
  return firebaseConfig.apiKey !== "YOUR_API_KEY";
}
