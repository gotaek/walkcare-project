const AWS = require("aws-sdk");

// ✅ AWS 리전 설정 (서울 리전 기준)
AWS.config.update({ region: "ap-northeast-2" });

const dynamo = new AWS.DynamoDB.DocumentClient();

// 📌 Fitbit 토큰 저장
async function saveFitbitToken({
  user_id,
  access_token,
  refresh_token,
  expires_in,
}) {
  const expires_at = Date.now() + expires_in * 1000;

  const params = {
    TableName: "FitbitTokens",
    Item: {
      user_id,
      access_token,
      refresh_token,
      expires_at,
      updated_at: Date.now(),
    },
  };

  try {
    await dynamo.put(params).promise();
    console.log("✅ Fitbit token saved for user:", user_id);
  } catch (err) {
    console.error("❌ DynamoDB save error:", err);
    throw err;
  }
}

// 📌 Fitbit 토큰 조회
async function getFitbitToken(user_id) {
  const params = {
    TableName: "FitbitTokens",
    Key: { user_id },
  };

  try {
    const result = await dynamo.get(params).promise();
    return result.Item || null;
  } catch (err) {
    console.error("❌ DynamoDB get error:", err);
    throw err;
  }
}

// 📌 access_token으로 user_id 찾기 (선택 기능, 비용 발생 주의)
async function getUserIdByAccessToken(access_token) {
  const params = {
    TableName: "FitbitTokens",
    FilterExpression: "#access_token = :val",
    ExpressionAttributeNames: { "#access_token": "access_token" },
    ExpressionAttributeValues: { ":val": access_token },
  };

  try {
    const result = await dynamo.scan(params).promise();
    if (result.Items && result.Items.length > 0) {
      return result.Items[0].user_id;
    }
    return null;
  } catch (err) {
    console.error("❌ DynamoDB scan error:", err);
    throw err;
  }
}

module.exports = {
  saveFitbitToken,
  getFitbitToken,
  getUserIdByAccessToken,
};
