//경로: backend/aws/lambda/review/review.js
// 사용자가 산책 후 리뷰를 작성하는 Lambda 함수

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
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const walk_id = uuidv4();
    const end_time = new Date(ended_at);
    const start_time = new Date(end_time.getTime() - 30 * 60000);
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
