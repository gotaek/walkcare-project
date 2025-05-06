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
      SELECT id, date, course_name, time_slot AS time, feedback_rating, feedback_comment,created_at
      FROM recommendations
      WHERE user_id = ?
      ORDER BY date DESC,
      STR_TO_DATE(REPLACE(time_slot, '시', ''), '%p %l') ASC
    `;
    const [rows] = await pool.execute(sql, [user_id]);

    res.json({ history: rows });
  } catch (err) {
    console.error("DB 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

// DELETE /history/:id
// 🔹 입력: id (URL 파라미터)
// 🔹 출력: 삭제 성공 여부

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "id는 필수입니다." });
  }

  try {
    const [result] = await pool.execute(
      "DELETE FROM recommendations WHERE id = ?",
      [id]
    );

    // 결과 확인: affectedRows가 0이면 삭제된 게 없음
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "삭제할 기록이 없습니다." });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("삭제 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
