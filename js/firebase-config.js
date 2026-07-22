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
  apiKey: "AIzaSyDUhFkAxnn_Mdfs85HSrnOwL5P0hMhrWTc",
  authDomain: "trade-342dd.firebaseapp.com",
  databaseURL: "https://trade-342dd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "trade-342dd",
  storageBucket: "trade-342dd.firebasestorage.app",
  messagingSenderId: "935752856087",
  appId: "1:935752856087:web:c0500954946ffcb82d6252",
  measurementId: "G-0PG93H4GX5",
};

export function isConfigured() {
  return firebaseConfig.apiKey !== "YOUR_API_KEY";
}
