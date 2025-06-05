// 경로:  backend/aws/lambda/deleteHistory/deleteHistory.js
// 특정 walk_id에 해당하는 산책 기록을 삭제하는 Lambda 함수

const mysql = require("mysql2/promise");

exports.handler = async (event) => {
  try {
    const walk_id = event.pathParameters?.walk_id;

    if (!walk_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "walk_id는 필수입니다." }),
      };
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [existing] = await connection.execute(
      "SELECT * FROM walk_log WHERE walk_id = ?",
      [walk_id]
    );

    if (existing.length === 0) {
      await connection.end();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "삭제할 기록이 존재하지 않습니다." }),
      };
    }

    await connection.execute("DELETE FROM walk_log WHERE walk_id = ?", [
      walk_id,
    ]);
    await connection.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("❌ 삭제 오류:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "삭제 처리 중 오류 발생",
        details: err.message,
      }),
    };
  }
};
