import json
import logging
from confluent_kafka import Consumer, Producer, KafkaError
from config.settings import settings
from src.database.connection import get_db_engine
from src.models.anomalies.detector import expense_anomaly_detector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("KafkaWorker")

def start_kafka_worker():
    consumer_conf = {
        'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS,
        'group.id': settings.KAFKA_CONSUMER_GROUP_ANOMALY,
        'auto.offset.reset': 'earliest'
    }
    producer_conf = {'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS}

    consumer = Consumer(consumer_conf)
    producer = Producer(producer_conf)
    
    # Wrap in try-except in case database is not initialized yet
    try:
        engine = get_db_engine()
    except Exception as e:
        logger.error(f"Failed to get db engine: {e}")
        engine = None

    consumer.subscribe(['transaction.created'])
    logger.info("ML Service worker listening for live transactions...")

    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None: continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF: continue
                else: logger.error(f"Kafka error: {msg.error()}"); break

            try:
                event_data = json.loads(msg.value().decode('utf-8'))
                user_id = event_data.get("userId")
                if not user_id: continue

                # Predict anomalies via Isolation Forest
                # Only run if we have an engine
                if engine is None:
                    continue

                scored_df = expense_anomaly_detector.detect_anomalies(user_id, engine)
                
                # Check if it returned a dataframe
                if scored_df is None or scored_df.empty or "is_anomaly" not in scored_df.columns:
                    continue

                anomalies = scored_df[scored_df["is_anomaly"] == True]

                if not anomalies.empty:
                    latest_anomaly = anomalies.iloc[-1]
                    anomaly_payload = {
                        "userId": user_id,
                        "expenseId": str(latest_anomaly.get("id", "unknown")),
                        "amount": float(latest_anomaly["amount"]),
                        "category": str(latest_anomaly["category"]),
                        "severityScore": round(abs(float(latest_anomaly["anomaly_score"])), 4)
                    }
                    producer.produce('anomaly.detected', value=json.dumps(anomaly_payload).encode('utf-8'))
                    producer.flush()
                    logger.info(f"🚨 Anomaly event sent to Kafka for user: {user_id}")
            except Exception as e:
                logger.error(f"Error compiling event stream packet: {str(e)}")
    finally:
        consumer.close()

if __name__ == "__main__":
    start_kafka_worker()
