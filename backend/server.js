// backend/server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 📌 라우트 추가
const recommendationRouter = require("./routes/recommendation");
app.use("/recommendation", recommendationRouter);

// 기본 라우트
app.get("/", (req, res) => {
  res.send("🚀 WalkCare 백엔드 서버가 실행 중입니다!");
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
