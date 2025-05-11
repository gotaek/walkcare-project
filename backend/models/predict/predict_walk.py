import sys
import json
import pandas as pd
import joblib
import os

# 📌 현재 파일 기준 경로 잡기
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'walk_decision_model.pkl')
ENCODER_PATH = os.path.join(BASE_DIR, '..', 'main_encoder.pkl')

# 모델 및 인코더 로드
try:
    model = joblib.load(MODEL_PATH)
    main_enc = joblib.load(ENCODER_PATH)
except FileNotFoundError as e:
    print(json.dumps({"best_day": None, "error": f"File not found: {str(e)}"}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({"best_day": None, "error": f"Loading error: {str(e)}"}))
    sys.exit(1)

# JSON 입력 받기
input_json = sys.stdin.read()
try:
    data = json.loads(input_json)
    df = pd.DataFrame(data["weekly_weather"])
except json.JSONDecodeError as e:
    print(json.dumps({"best_day": None, "error": f"Invalid JSON input: {str(e)}"}))
    sys.exit(1)
except KeyError as e:
    print(json.dumps({"best_day": None, "error": f"Missing 'weekly_weather' key: {str(e)}"}))
    sys.exit(1)

# 데이터 전처리
try:
    if "main" not in df.columns:
        raise KeyError("Column 'main' not found in input data")
    df["main"] = main_enc.transform(df["main"])
    X = df[["main", "min_temp", "max_temp", "uvi", "pop"]]
    preds = model.predict(X)
    df["score"] = preds
except ValueError as e:
    print(json.dumps({"best_day": None, "error": f"Data transformation error: {str(e)}"}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({"best_day": None, "error": f"Prediction error: {str(e)}"}))
    sys.exit(1)

# 최적의 날짜 찾기
best = df[df["score"] == 1].head(1)
if best.empty or "date" not in best.columns:
    print(json.dumps({"best_day": None}))
else:
    print(json.dumps({"best_day": best.iloc[0]["date"]}))