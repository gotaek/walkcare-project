// 📁 backend/routes/recommendation.js
// 사용자 위치(lat, lon)와 산책 시간(time)을 받아
// 산책이 적절한지 판단하고 추천 결과를 반환하는 API

const express = require("express");
const router = express.Router();

// GET /recommendation?lat=37.55&lon=127.01&time=30
// 🔹 입력: lat, lon, time (쿼리스트링)
// 🔹 출력: { recommendation: '산책 권장', course: '뚝섬공원', estimated_time: '30분' }
router.get("/", (req, res) => {
  const { lat, lon, time } = req.query;

  if (!lat || !lon || !time) {
    return res
      .status(400)
      .json({ error: "위치(lat, lon)와 시간(time)은 필수입니다." });
  }

  // TODO: 머신러닝 기반 예측으로 대체 예정
  // 임시 더미 로직
  const recommendation = Math.random() > 0.5 ? "산책 권장" : "실내 운동 권장";

  return res.json({
    recommendation,
    course: recommendation === "산책 권장" ? "뚝섬한강공원" : null,
    estimated_time: `${time}분`,
  });
});

module.exports = router;
