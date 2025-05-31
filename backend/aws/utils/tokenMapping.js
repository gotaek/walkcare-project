const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "FitbitTokens";

// 🔍 access_token으로 user_id 찾기 (전체 스캔 방식)
exports.getUserIdByToken = async (access_token) => {
  const result = await dynamo
    .scan({
      TableName: TABLE_NAME,
      FilterExpression: "#a = :access_token",
      ExpressionAttributeNames: {
        "#a": "access_token",
      },
      ExpressionAttributeValues: {
        ":access_token": access_token,
      },
    })
    .promise();

  if (result.Items.length > 0) {
    return result.Items[0].user_id;
  }

  return null; // 못 찾은 경우
};
