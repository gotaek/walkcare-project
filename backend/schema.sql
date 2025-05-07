-- WalkCare 프로젝트 DB 초기 설정을 위한 스크립트 (자신의 mySql 로컬 환경에서 copy&paste 가능)

CREATE DATABASE IF NOT EXISTS walkcare;
USE walkcare;

-- 사용자 정보
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  age INT,
  gender ENUM('male', 'female'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 건강 데이터 (Fitbit 수집용)
CREATE TABLE health_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  timestamp DATETIME,
  heart_rate INT,
  steps INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 산책 추천 기록 + 리뷰
CREATE TABLE recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  course_name VARCHAR(100),
  date DATE,
  time_slot VARCHAR(20),
  recommended BOOLEAN,
  feedback_rating INT,
  feedback_comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 환경 정보 (API 수집용)
CREATE TABLE environment_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME,
  location VARCHAR(100),
  temperature FLOAT,
  humidity FLOAT,
  pm10 INT,
  pm2_5 INT
);
