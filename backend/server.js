// backend/server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");
const qs = require("qs"); // 문자열 인코딩을 위한 모듈

const app = express();
const PORT = process.env.PORT || 3000;

// 🔄 로컬 파일 기반 토큰 저장 유틸 함수 import
const { setToken, getToken } = require("./utils/tokenManager");

// 📦 미들웨어 설정
app.use(cors());
app.use(express.json());

// 🧭 기타 라우트 등록
app.use("/recommendation", require("./routes/recommendation"));
app.use("/reviews", require("./routes/reviews"));
app.use("/history", require("./routes/history"));

// 🔐 Fitbit 로그인 요청 → Fitbit OAuth 인증 페이지로 이동
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

// 🔄 Fitbit OAuth Redirect → access_token 교환 후 로컬 JSON 저장
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  const tokenUrl = "https://api.fitbit.com/oauth2/token";
  const authHeader = Buffer.from(
    `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await require("axios").post(
      tokenUrl,
      require("qs").stringify({
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.FITBIT_REDIRECT_URI,
      }),
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const tokenData = response.data;

    // ⏱ 토큰 만료 시점 계산
    const now = Math.floor(Date.now() / 1000);
    const expires_at = now + tokenData.expires_in;

    // 💾 ✅ token 저장
    setToken(tokenData.user_id, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at,
    });

    // 🧪 로그
    console.log(`✅ 토큰 저장 완료: ${tokenData.user_id}`);

    // 응답
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(
      JSON.stringify({
        message: "✅ Token saved to file",
        user_id: tokenData.user_id,
        access_token: tokenData.access_token?.slice(0, 10) + "...",
        refresh_token: tokenData.refresh_token?.slice(0, 10) + "...",
        expires_at,
      })
    );
  } catch (err) {
    console.error("❌ OAuth Error:", err.response?.data || err.message);

    if (err.response) {
      console.error("🔍 상태 코드:", err.response.status);
      console.error("🔍 응답 바디:", err.response.data);
    }

    res.status(500).send("OAuth Failed");
  }
});

// 🏠 기본 라우트
app.get("/", (req, res) => {
  res.send("🚀 WalkCare 백엔드 서버가 실행 중입니다!");
});

// ▶️ 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
