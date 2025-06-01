const mysql = require("mysql2/promise");

exports.handler = async (event) => {
  try {
    // 헤더에서 user_id 또는 token 대신 임시 user_id 추출
    const user_id = event.queryStringParameters?.user_id || "CLYLD9"; // 실제 서비스에서는 token 기반으로

    if (!user_id) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "user_id 누락" }),
      };
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute(
      `SELECT 
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
      ORDER BY start_time DESC`,
      [user_id]
    );

    await connection.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ history: rows }),
    };
  } catch (err) {
    console.error("❌ DB 오류:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "서버 오류 발생", details: err.message }),
    };
  }
};
