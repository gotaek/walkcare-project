const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");

// ✅ 폴더 없으면 생성
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 📌 토큰 저장
const setToken = (userId, tokenData) => {
  const filePath = path.join(DATA_DIR, `token_${userId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(tokenData, null, 2));
};

// 📌 토큰 불러오기
const getToken = (userId) => {
  const filePath = path.join(DATA_DIR, `token_${userId}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  return null;
};

// 📌 현재 로그인된 사용자 저장
const saveActiveUser = (userId) => {
  const filePath = path.join(DATA_DIR, "active_user.txt");
  fs.writeFileSync(filePath, userId);
};

// 📌 현재 로그인된 사용자 불러오기
const getActiveUser = () => {
  const filePath = path.join(DATA_DIR, "active_user.txt");
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  return null;
};

// ✅ access_token 으로 userId 찾기
const getUserIdByToken = (accessToken) => {
  const files = fs.readdirSync(DATA_DIR);

  for (const file of files) {
    if (file.startsWith("token_") && file.endsWith(".json")) {
      const filePath = path.join(DATA_DIR, file);
      const tokenData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      if (tokenData.access_token === accessToken) {
        return file.replace("token_", "").replace(".json", "");
      }
    }
  }

  return null;
};

module.exports = {
  setToken,
  getToken,
  saveActiveUser,
  getActiveUser,
  getUserIdByToken, // ✅ 새로 추가
};
