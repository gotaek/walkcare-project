// backend/server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");
const qs = require("qs");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

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

// ✅ 로그인 후 토큰 저장 + user_id 저장
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  const tokenUrl = "https://api.fitbit.com/oauth2/token";
  const authHeader = Buffer.from(
    `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.post(
      tokenUrl,
      qs.stringify({
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
    const now = Math.floor(Date.now() / 1000);
    const expires_at = now + tokenData.expires_in;

    // 💾 토큰 저장
    setToken(tokenData.user_id, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at,
    });

    // 💾 현재 로그인된 user_id 저장
    saveActiveUser(tokenData.user_id);

    console.log(`✅ 토큰 및 user_id 저장 완료: ${tokenData.user_id}`);

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

// ✅ 로그인된 사용자 ID 반환
app.get("/auth/active-user", (req, res) => {
  // const userId = getActiveUser();
  // if (!userId) return res.status(404).json({ error: "로그인된 사용자 없음" });
  // res.json({ user_id: userId });
  res.json({ user_id: "CLYLD9" });
});

// Fitbit API 라우트 등록
app.use("/fitbit", require("./routes/fitbitApi"));

// 기본 라우트
app.get("/", (req, res) => {
  res.send("🚀 WalkCare 백엔드 서버가 실행 중입니다!");
});

// ▶️ 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
