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
      SELECT 
        walk_id ,
        DATE_FORMAT(start_time, '%Y-%m-%d') AS date,
        course_name,
        DATE_FORMAT(start_time, '%p %l시') AS time,
        rating,
        comment,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
      FROM walk_log
      WHERE user_id = ?
      ORDER BY start_time DESC
    `;
    const [rows] = await pool.execute(sql, [user_id]);

    res.json({ history: rows });
  } catch (err) {
    console.error("DB 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

// DELETE /history/:id
// 🔹 입력: id (URL 파라미터, 리뷰id)
// 🔹 출력: 삭제 성공 여부

router.delete("/:walk_id", async (req, res) => {
  const { walk_id } = req.params;

  if (!walk_id) {
    return res.status(400).json({ error: "walk_id는 필수입니다." });
  }

  const [rows] = await pool.execute(
    "SELECT * FROM walk_log WHERE walk_id = ?",
    [walk_id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "삭제할 기록이 존재하지 않습니다." });
  }

  try {
    const [result] = await pool.execute(
      "DELETE FROM walk_log WHERE walk_id = ?",
      [walk_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("삭제 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
