// 📁 backend/routes/riviews.js
// 사용자의 산책 피드백(별점, 코멘트 등)을 저장하는 API

const express = require("express");
const router = express.Router();
const db = require("../db/connection");

// POST /reviews
// 🔹 입력: course_name, ended_at, rating, comment (JSON Body)
// 🔹 출력: 삽입 성공 여부 및 생성된 id
router.post("/", async (req, res) => {
  const { course_name, ended_at, rating, comment } = req.body;

  if (!course_name || !ended_at || !rating) {
    return res.status(400).json({ error: "필수 항목 누락" });
  }

  try {
    // 랜덤 ID 생성 (주의: 충돌 가능성은 있음)
    const id = Math.floor(100000 + Math.random() * 900000); // 6자리 ID 생성
    const user_id = 1;

    // 🗓 ended_at: "2025-05-07 21:03"
    const [date, time] = ended_at.split(" "); // ["2025-05-07", "21:03"]

    // ⏰ 오전/오후 구분
    const hour = parseInt(time.split(":")[0], 10);
    const ampm = hour >= 12 ? "오후" : "오전";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const time_slot = `${ampm} ${hour12}시`;

    const recommended = 1;
    const created_at = new Date();

    await db.execute(
      `INSERT INTO recommendations 
      (id, user_id, course_name, date, time_slot, recommended, feedback_rating, feedback_comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        user_id,
        course_name,
        date,
        time_slot,
        recommended,
        rating,
        comment,
        created_at,
      ]
    );

    res.json({ success: true, inserted_id: id });
  } catch (err) {
    console.error("리뷰 저장 실패:", err.message);
    res.status(500).json({ error: "DB 저장 실패" });
  }
});

module.exports = router;
