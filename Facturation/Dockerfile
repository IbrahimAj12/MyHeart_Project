FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir flask
COPY . .
EXPOSE 8002
CMD ["python", "app.py"]
