// ✅ 경로: backend/server.js
// WalkCare 백엔드 서버 진입점
// 주요 기능: Fitbit OAuth 인증, 라우팅 처리, API 서버 실행

const express = require("express");
const cors = require("cors");
require("dotenv").config(); // 환경 변수 로딩
const axios = require("axios");
const qs = require("qs");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5000;

// 🔹 로그인된 사용자 ID 저장 경로
const activeUserPath = path.join(__dirname, "tokens/active_user.json");

// 🔹 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 본문 파싱

// 🔹 라우트 등록 (기능별 모듈화된 경로)
app.use("/recommendation", require("./routes/recommendation")); // 산책 추천
app.use("/reviews", require("./routes/reviews")); // 리뷰 저장 및 조회
app.use("/history", require("./routes/history")); // 사용자 기록 확인 및 삭제

// 🔐 Fitbit 로그인 요청 처리
app.get("/auth/fitbit", (req, res) => {
  // Fitbit OAuth2 인증 URL 생성
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.FITBIT_CLIENT_ID,
    redirect_uri: process.env.FITBIT_REDIRECT_URI,
    scope: "activity heartrate sleep profile", // 요청 권한 범위
  });

  const authUrl = `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
  console.log("🔗 Redirecting to Fitbit Auth:", authUrl);

  // Fitbit 로그인 페이지로 리디렉션
  res.redirect(authUrl);
});

// 🔐 Fitbit 인증 후, WebView로 인증 코드 전송
app.get("/callback", (req, res) => {
  const code = req.query.code;
  console.log(`📥 Fitbit OAuth callback code: ${code}`);

  // 인증 코드를 React Native WebView로 전달하는 HTML 응답
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>WalkCare 로그인 완료</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 2rem; }
        </style>
      </head>
      <body>
        <h2>WalkCare 로그인 중...</h2>
        <p>잠시만 기다려 주세요</p>
        <script>
          // WebView로 code 전달
          window.ReactNativeWebView?.postMessage("${code}");
        </script>
      </body>
    </html>
  `);
});

// 🔹 Fitbit API 관련 라우트
app.use("/fitbit", require("./routes/fitbitApi")); // Fitbit API 호출 처리

// 🔹 인증 코드 → access_token 교환 라우트
app.use("/", require("./routes/exchange")); // /exchange 엔드포인트 처리

// 🔹 기본 라우트 - 서버 상태 확인용
app.get("/", (req, res) => {
  res.send("🚀 WalkCare 백엔드 서버가 실행 중입니다!");
});

// ▶️ 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
