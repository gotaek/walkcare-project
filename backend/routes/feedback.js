const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

// POST /feedback
router.post("/", async (req, res) => {
  const { user_id, recommendation_id, rating, comment } = req.body;

  if (!user_id || !recommendation_id || !rating) {
    return res
      .status(400)
      .json({ error: "user_id, recommendation_id, rating은 필수입니다." });
  }

  try {
    const sql = `
      UPDATE recommendations
      SET feedback_rating = ?, feedback_comment = ?
      WHERE id = ? AND user_id = ?
    `;
    const [result] = await pool.execute(sql, [
      rating,
      comment,
      recommendation_id,
      user_id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "해당 추천 기록을 찾을 수 없습니다." });
    }

    res.json({ message: "피드백이 저장되었습니다." });
  } catch (err) {
    console.error("DB 오류:", err);
    res.status(500).json({ error: "서버 내부 오류" });
  }
});

module.exports = router;
