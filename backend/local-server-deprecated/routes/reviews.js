// 경로: backend/routes/reviews.js
// 사용자 리뷰를 저장하는 라우트 설정

const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const {
      user_id,
      course_name,
      ended_at,
      rating,
      comment,
      total_steps,
      total_calories,
      total_heart_rate,
    } = body;

    if (!user_id || !course_name || !ended_at || !rating) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "필수 항목(user_id, course_name, ended_at, rating) 누락",
        }),
      };
    }

    const connection = await mysql.createConnection({
      host: "walkcare-db.abcxyz.ap-northeast-2.rds.amazonaws.com",
      user: "admin",
      password: "deriko3255",
      database: "walkcare",
    });

    const walk_id = uuidv4();
    const end_time = new Date(ended_at);
    const start_time = new Date(end_time.getTime() - 30 * 60000); // 30분 전
    const created_at = new Date();

    await connection.execute(
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

    await connection.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, walk_id }),
    };
  } catch (err) {
    console.error("리뷰 저장 실패:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "DB 저장 실패", details: err.message }),
    };
  }
};
