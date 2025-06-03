FROM public.ecr.aws/lambda/python:3.9

RUN pip install scikit-learn==1.3.2 pandas numpy joblib

COPY predictWalkTime.py ./
COPY walk_forest_model.pkl ./

CMD ["predictWalkTime.lambda_handler"]
