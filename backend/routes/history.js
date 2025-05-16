// 📁 backend/routes/history.js
const express = require("express");
const router = express.Router();
const pool = require("../db/connection");
const { getUserIdByToken } = require("../utils/tokenManager");

// 🔹 GET /history - 사용자 산책 히스토리 반환
router.get("/", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization 헤더 누락" });
  }

  const token = authHeader.replace("Bearer ", "");
  const user_id = getUserIdByToken(token);

  if (!user_id) {
    return res.status(401).json({ error: "❌ 유효한 사용자 정보 없음" });
  }

  try {
    const sql = `
      SELECT 
        walk_id,
        course_name,
        start_time,
        end_time,
        rating,
        comment,
        created_at,
        total_steps,
        total_calories,
        total_heart_rate
      FROM walk_log
      WHERE user_id = ?
      ORDER BY start_time DESC
    `;
    const [rows] = await pool.execute(sql, [user_id]);

    res.json({ history: rows });
  } catch (err) {
    console.error("❌ DB 오류:", err);
    res.status(500).json({ error: "서버 오류 발생" });
  }
});

// 🔹 DELETE /history/:walk_id - 특정 기록 삭제
router.delete("/:walk_id", async (req, res) => {
  const { walk_id } = req.params;

  if (!walk_id) {
    return res.status(400).json({ error: "walk_id는 필수입니다." });
  }

  try {
    const [existing] = await pool.execute(
      "SELECT * FROM walk_log WHERE walk_id = ?",
      [walk_id]
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ error: "삭제할 기록이 존재하지 않습니다." });
    }

    await pool.execute("DELETE FROM walk_log WHERE walk_id = ?", [walk_id]);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ 삭제 오류:", err);
    res.status(500).json({ error: "삭제 처리 중 오류 발생" });
  }
});

module.exports = router;
