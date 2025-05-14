// backend/server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// recommendation 라우트
const recommendationRouter = require("./routes/recommendation");
app.use("/recommendation", recommendationRouter);

// review 라우트
const reviewsRouter = require("./routes/reviews");
app.use("/reviews", reviewsRouter);

// history 라우트
const historyRouter = require("./routes/history");
app.use("/history", historyRouter);

//사용자가 로그인 버튼을 누르면 호출되는 라우트
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

//Fitbit 로그인 & 동의 후 리디렉션되는 경로
//여기서 access_token, refresh_token을 교환받음
app.get("/callback", async (req, res) => {
  console.log("🔍 Received callback with query:", req.query);
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

    console.log("✅ Token Response:", response.data);
    res.json(response.data);
  } catch (err) {
    console.error("❌ OAuth Error:", err.response?.data || err.message);
    res.status(500).send("OAuth Failed");
  }
});

// 기본 라우트
app.get("/", (req, res) => {
  res.send("🚀 WalkCare 백엔드 서버가 실행 중입니다!");
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
