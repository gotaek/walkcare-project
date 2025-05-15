// 📁 backend/routes/reviews.js
// 사용자의 산책 피드백 저장 API

const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { v4: uuidv4 } = require("uuid");

// POST /reviews
// 🔹 입력: course_name, ended_at, rating, comment (JSON Body)
// 🔹 출력: 삽입 성공 여부 및 생성된 walk_id
router.post("/", async (req, res) => {
  const { course_name, ended_at, rating, comment } = req.body;

  if (!course_name || !ended_at || !rating) {
    return res.status(400).json({ error: "필수 항목 누락" });
  }

  try {
    const walk_id = uuidv4(); // walk_id는 UUID로 생성
    const user_id = "CLYLD9"; // 실제 구현 시 로그인 세션 등에서 동적으로 받아야 함
    const end_time = new Date(ended_at);
    const start_time = new Date(end_time.getTime() - 30 * 60000); // 30분 산책 가정
    const total_calories = 180.0; // 가상 데이터 (추후 Fitbit API에서 계산 가능)
    const created_at = new Date();

    await db.execute(
      `INSERT INTO walk_log 
        (walk_id, user_id, course_name, start_time, end_time, total_calories, rating, comment, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        walk_id,
        user_id,
        course_name,
        start_time,
        end_time,
        total_calories,
        rating,
        comment,
        created_at,
      ]
    );

    res.json({ success: true, walk_id });
  } catch (err) {
    console.error("리뷰 저장 실패:", err.message);
    res.status(500).json({ error: "DB 저장 실패" });
  }
});

module.exports = router;
