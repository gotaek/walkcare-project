// 📁 backend/routes/history.js
// 사용자의 과거 산책 추천 및 피드백 기록을 조회하는 API

const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

// GET /history?user_id=1
// 🔹 입력: user_id (쿼리스트링)
// 🔹 출력: 날짜, 코스명, 시간, 피드백 점수 리스트

router.get("/", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "user_id는 필수입니다." });
  }

  try {
    const sql = `
      SELECT date, course_name AS course, time_slot AS time, feedback_rating AS feedback
      FROM recommendations
      WHERE user_id = ?
      ORDER BY date DESC, time_slot
    `;
    const [rows] = await pool.execute(sql, [user_id]);

    res.json(rows);
  } catch (err) {
    console.error("DB 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
