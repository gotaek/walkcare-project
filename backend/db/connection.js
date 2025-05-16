// 📌 이 파일은 MySQL 데이터베이스 연결 풀(pool)을 설정하고 내보내는 역할을 합니다.
const mysql = require("mysql2/promise");
require("dotenv").config();

// ✅ 연결 풀 생성 (동시 접속을 효율적으로 처리)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

// ✅ 다른 모듈에서 이 풀을 사용할 수 있도록 내보냄
module.exports = pool;
