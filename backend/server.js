// backend/server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");
const qs = require("qs");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5000;

// 🔄 로컬 토큰 유틸
const { setToken, getToken } = require("./utils/tokenManager");

// ✅ 로그인된 사용자 ID 저장 경로
const activeUserPath = path.join(__dirname, "tokens/active_user.json");

// 로그인 시 현재 사용자 저장
function saveActiveUser(user_id) {
  fs.writeFileSync(activeUserPath, JSON.stringify({ user_id }));
}

// 현재 로그인된 사용자 반환
function getActiveUser() {
  if (!fs.existsSync(activeUserPath)) return null;
  const data = fs.readFileSync(activeUserPath, "utf-8");
  try {
    return JSON.parse(data).user_id;
  } catch {
    return null;
  }
}

// 📦 미들웨어 설정
app.use(cors());
app.use(express.json());

// 🧭 기타 라우트 등록
app.use("/recommendation", require("./routes/recommendation"));
app.use("/reviews", require("./routes/reviews"));
app.use("/history", require("./routes/history"));

// 🔐 Fitbit 로그인 요청
app.get("/auth/fitbit", (req, res) => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.FITBIT_CLIENT_ID,
    redirect_uri: process.env.FITBIT_REDIRECT_URI,
    scope: "activity heartrate sleep profile",
  });

  const authUrl = `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
  console.log("🔗 Redirecting to Fitbit Auth:", authUrl);
  res.redirect(authUrl);
});

// ✅ Fitbit 인증 후 code를 받아 클라이언트 WebView에 전달
app.get("/callback", (req, res) => {
  const code = req.query.code;

  console.log(`📥 Fitbit OAuth callback code: ${code}`);

  // ✅ WebView에게 code 전달하는 HTML
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
          // ✅ React Native WebView에 code 전송
          window.ReactNativeWebView?.postMessage("${code}");
        </script>
      </body>
    </html>
  `);
});

// Fitbit API 라우트 등록
app.use("/fitbit", require("./routes/fitbitApi"));

app.use("/", require("./routes/exchange"));

// 기본 라우트
app.get("/", (req, res) => {
  res.send("🚀 WalkCare 백엔드 서버가 실행 중입니다!");
});

// ▶️ 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
