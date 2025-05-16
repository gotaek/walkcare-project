-- WalkCare 프로젝트 DB 초기 설정을 위한 스크립트 (자신의 mySql 로컬 환경에서 copy&paste 가능)
CREATE DATABASE IF NOT EXISTS walkcare;
USE walkcare;

-- 1. users 먼저 생성
CREATE TABLE users (
  user_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  gender ENUM('male', 'female'),
  age INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. walk_log (user_id → users.user_id 참조)
CREATE TABLE walk_log (
  walk_id CHAR(36) PRIMARY KEY,
  user_id VARCHAR(50),
  course_name VARCHAR(100),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  total_calories FLOAT,
  total_steps INT,
  total_heart_rate INT,
  comment TEXT,
  rating INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 3. heart_rate_logs
CREATE TABLE heart_rate_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  walk_id CHAR(36),
  time_stamp TIMESTAMP,
  heart_rate INT,
  FOREIGN KEY (walk_id) REFERENCES walk_log(walk_id)
);

-- 4. steps_logs
CREATE TABLE steps_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  walk_id CHAR(36),
  time_stamp TIMESTAMP,
  steps INT,
  FOREIGN KEY (walk_id) REFERENCES walk_log(walk_id)
);

-- 5. fitbit_tokens 테이블 생성 (OAuth2 토큰 저장용)
CREATE TABLE fitbit_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expired_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fitbit_user_id VARCHAR(100),
  scope TEXT,
  token_type VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);