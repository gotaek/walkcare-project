import boto3
import json
import decimal
from boto3.dynamodb.conditions import Key

# ✅ DynamoDB 테이블 리소스 연결
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('SensorData')

# ✅ Decimal 타입을 JSON 직렬화할 수 있도록 커스텀 인코더 정의
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super().default(obj)

def lambda_handler(event, context):
    # ✅ API Gateway에서 전달된 query string 파라미터 추출
    params = event.get('queryStringParameters') or {}
    sensor_id = params.get('sensor_id')
    timestamp = params.get('timestamp')

    # ✅ sensor_id가 없으면 400 에러 반환
    if not sensor_id:
        return { "statusCode": 400, "body": "Missing sensor_id" }

    try:
        # ✅ 특정 timestamp로 조회하는 경우 (정확한 1건 조회)
        if timestamp:
            response = table.get_item(Key={"sensor_id": sensor_id, "timestamp": timestamp})
            data = response.get('Item')
        else:
            # ✅ 최신 1건만 조회 (Sort Key: timestamp 기준 내림차순)
            response = table.query(
                KeyConditionExpression=Key("sensor_id").eq(sensor_id),
                ScanIndexForward=False,
                Limit=1
            )
            data = response.get('Items')

        # ✅ 정상 응답 반환 (Decimal도 JSON 직렬화 지원)
        return {
            'statusCode': 200,
            'headers': { "Content-Type": "application/json" },
            'body': json.dumps(data, cls=DecimalEncoder)
        }

    except Exception as e:
        # ❌ 예외 발생 시 500 에러 반환
        return { "statusCode": 500, "body": f"Error: {str(e)}" }
