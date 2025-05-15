// backend/utils/tokenManager.js
const fs = require("fs");
const path = require("path");

// 🔧 저장 파일 경로
const filePath = path.join(__dirname, "../tokens/fitbit_tokens.json");

// 🧾 JSON 파일 읽기
function readTokens() {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, "utf-8").trim();

  // 🔐 비어 있으면 기본 객체 반환
  if (!content) return {};

  try {
    return JSON.parse(content);
  } catch (err) {
    console.error(
      "❌ JSON 파싱 에러: fitbit_tokens.json 파일이 잘못되었습니다."
    );
    return {}; // 또는 throw err; 로 강제 종료
  }
}

// 💾 JSON 파일 쓰기
function writeTokens(tokens) {
  fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2));
}

// 🔍 특정 user_id의 토큰 가져오기
function getToken(userId) {
  const tokens = readTokens();
  return tokens[userId];
}

// 💾 특정 user_id의 토큰 저장/업데이트
function setToken(userId, tokenData) {
  const tokens = readTokens();
  tokens[userId] = tokenData;
  writeTokens(tokens);
}

// 🔁 전체 삭제 (테스트용)
function clearTokens() {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = {
  readTokens,
  writeTokens,
  getToken,
  setToken,
  clearTokens,
};
