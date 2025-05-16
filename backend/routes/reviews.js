const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { v4: uuidv4 } = require("uuid");
const { getUserIdByToken } = require("../utils/tokenManager");

// POST /reviews
// 입력: course_name, ended_at, rating, comment, total_steps, total_calories, total_heart_rate
router.post("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization 헤더 누락" });
  }

  const token = authHeader.replace("Bearer ", "");
  const user_id = getUserIdByToken(token);
  if (!user_id) {
    return res.status(401).json({ error: "토큰에서 사용자 정보 추출 실패" });
  }

  const {
    course_name,
    ended_at,
    rating,
    comment,
    total_steps,
    total_calories,
    total_heart_rate,
  } = req.body;

  if (!course_name || !ended_at || !rating) {
    return res.status(400).json({ error: "필수 항목 누락" });
  }

  try {
    const walk_id = uuidv4();
    const end_time = new Date(ended_at);
    const start_time = new Date(end_time.getTime() - 30 * 60000); // 30분 산책 가정
    const created_at = new Date();

    await db.execute(
      `INSERT INTO walk_log 
        (walk_id, user_id, course_name, start_time, end_time, total_steps, total_calories, total_heart_rate, rating, comment, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        walk_id,
        user_id,
        course_name,
        start_time,
        end_time,
        total_steps || 0,
        total_calories || 0,
        total_heart_rate || null,
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
