// backend/routes/recommendation.js

const express = require("express");
const router = express.Router();

// GET /recommendation?lat=37.55&lon=127.01&time=30
router.get("/", (req, res) => {
  const { lat, lon, time } = req.query;

  if (!lat || !lon || !time) {
    return res
      .status(400)
      .json({ error: "위치(lat, lon)와 시간(time)은 필수입니다." });
  }

  // TODO: 여기서 머신러닝 모델 예측을 연결할 수 있음

  // 임시 더미 로직
  const recommendation = Math.random() > 0.5 ? "산책 권장" : "실내 운동 권장";

  return res.json({
    recommendation,
    course: recommendation === "산책 권장" ? "뚝섬한강공원" : null,
    estimated_time: `${time}분`,
  });
});

module.exports = router;
