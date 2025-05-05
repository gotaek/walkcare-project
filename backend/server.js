// backend/server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

// 기본 라우트
app.get("/", (req, res) => {
  res.send("🚀 WalkCare 백엔드 서버가 실행 중입니다!");
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
