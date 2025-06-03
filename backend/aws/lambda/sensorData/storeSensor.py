import json
import boto3
from decimal import Decimal
from datetime import datetime

# ✅ DynamoDB 리소스와 테이블 객체 초기화
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('SensorData')

def lambda_handler(event, context):
    print("📥 이벤트 수신:", event)

    try:
        data = event

        # ✅ 타임스탬프가 없으면 현재 시간으로 생성
        timestamp = data.get("timestamp") or datetime.now().isoformat()

        # ✅ 미세먼지 값 문자열 → Decimal로 변환 (DynamoDB는 float 대신 Decimal 사용)
        pm2_5 = Decimal(str(data['pm2_5']))
        pm10 = Decimal(str(data['pm10']))

        # ✅ DynamoDB에 항목 저장
        table.put_item(
            Item={
                'sensor_id': str(data['sensor_id']),
                'timestamp': timestamp,
                'pm2_5': pm2_5,
                'pm10': pm10
            }
        )

        print("✅ 저장 성공:", data)

        # ✅ 정상 응답 반환
        return {
            'statusCode': 200,
            'body': json.dumps('✅ Data saved to DynamoDB')
        }

    except Exception as e:
        # ❌ 저장 중 예외 발생
        print("❌ 저장 실패:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps('❌ Error saving data')
        }
