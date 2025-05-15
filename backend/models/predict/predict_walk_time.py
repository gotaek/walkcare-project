import sys
import json
import joblib
import pandas as pd
from datetime import datetime
import os

# 🔹 현재 파일 위치 기준으로 프로젝트 루트 경로 계산
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))           # models/predict/
ROOT_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))           # 프로젝트 루트
MODEL_PATH = os.path.join(ROOT_DIR, "models", "walk_forest_model.pkl")

# 🔹 모델 불러오기
model = joblib.load(MODEL_PATH)

# 🔹 전처리 함수
def preprocess_hourly_data(hourly_data):
    processed = []
    for item in hourly_data:
        dt_obj = datetime.fromtimestamp(item["dt"])
        hour = dt_obj.hour
        dayofweek = dt_obj.weekday()
        temp = item["temp"]
        humidity = item["humidity"]
        uvi = item.get("uvi", 0)
        pop = item.get("pop", 0)

        main = item["main"]
        main_clear = 1 if main == "Clear" else 0
        main_clouds = 1 if main == "Clouds" else 0
        main_rain = 1 if main in ["Rain", "Drizzle", "Thunderstorm"] else 0
        main_snow = 1 if main == "Snow" else 0

        processed.append({
            "dt": dt_obj.strftime("%Y-%m-%d %H:%M"),
            "temp": temp,
            "humidity": humidity,
            "uvi": uvi,
            "pop": pop,
            "hour": hour,
            "dayofweek": dayofweek,
            "main_Clear": main_clear,
            "main_Clouds": main_clouds,
            "main_Rain": main_rain,
            "main_Snow": main_snow
        })
    return pd.DataFrame(processed)

# 🔹 표준 입력(JSON) 받기
input_json = sys.stdin.read()
input_data = json.loads(input_json)
hourly_weather = input_data["hourly_weather"]

# 🔹 전처리 → 예측 → 추천
df = preprocess_hourly_data(hourly_weather)
X = df.drop(columns=["dt"])
df["walkable"] = model.predict(X)


# 🔹 상위 3개 시간대 추천 (pop, uvi 기준으로 정렬)
candidates = df[df["walkable"] == 1]
candidates = candidates.sort_values(by=["pop", "uvi", "temp"]).head(3)

# 🔹 결과 구성
best_times = []
for _, row in candidates.iterrows():
    summary = "맑음" if row["main_Clear"] else "흐림" if row["main_Clouds"] else "비/눈"
    best_times.append({
        "time": row["dt"],
        "temp": round(row["temp"], 1),
        "uvi": round(row["uvi"], 1),
        "pop": round(row["pop"] * 100),  # %
        "summary": summary
    })

print(json.dumps({ "best_times": best_times }, ensure_ascii=False))
