const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.post("/", async (req, res) => {
  const { course_name, ended_at, rating, comment } = req.body;

  if (!course_name || !ended_at || !rating) {
    return res.status(400).json({ error: "필수 항목 누락" });
  }

  try {
    // 랜덤 ID 생성 (주의: 충돌 가능성은 있음)
    const id = Math.floor(100000 + Math.random() * 900000); // 6자리
    const user_id = 1;

    const rawDate = ended_at.split(" ")[0]; // '5/6/2025'
    const [month, day, year] = rawDate.split("/");
    const date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`; // '2025-05-06'

    const timeStr = ended_at.split(" ")[1]; // '오전 9:00' 등
    const hour = parseInt(timeStr.split(":")[0], 10);
    const ampm =
      timeStr.includes("오후") || timeStr.includes("PM") ? "오후" : "오전";
    const time_slot = `${ampm} ${hour}시`;

    const recommended = 1;
    const created_at = new Date();

    console.log(
      id,
      user_id,
      course_name,
      date,
      time_slot,
      recommended,
      rating,
      comment,
      created_at
    );
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
