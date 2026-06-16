import json
import logging
from confluent_kafka import Consumer, Producer, KafkaError
from config.settings import settings
from src.database.connection import get_db_engine

# 1. Importing all 3 of your finalized operational analytics engines
from src.models.anomalies.detector import expense_anomaly_detector
from src.models.lifestyle.analyzer import lifestyle_creep_analyzer
from src.models.cashflow.runway import cashflow_forecaster

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("KafkaWorker")

def delivery_report(err, msg):
    """ Callbacks to verify background message dispatch stability """
    if err is not None:
        logger.error(f"Message delivery failed: {err}")
    else:
        logger.info(f"Message cleanly delivered to {msg.topic()} [{msg.partition()}]")

def start_kafka_worker():
    consumer_conf = {
        'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS,
        'group.id': settings.KAFKA_CONSUMER_GROUP_ML_ENGINES,
        'auto.offset.reset': 'earliest',
        'allow.auto.create.topics': True
    }
    producer_conf = {'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS}

    consumer = Consumer(consumer_conf)
    producer = Producer(producer_conf)
    
    try:
        engine = get_db_engine()
    except Exception as e:
        logger.error(f"Failed to initialize database connectivity layer: {e}")
        engine = None

    # 2. Subscribing to BOTH inbound trigger streams from your Express server blueprint
    inbound_topics = ['pixelfi.expense.created', 'pixelfi.snapshot.created']
    consumer.subscribe(inbound_topics)
    logger.info(f"ML Orchestration Worker online. Monitoring: {inbound_topics}")

    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None: 
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF: 
                    continue
                else: 
                    logger.error(f"Kafka stream connection error: {msg.error()}")
                    break

            # Process background delivery queue callbacks asynchronously (highly performant)
            producer.poll(0)

            try:
                incoming_topic = msg.topic()
                event_data = json.loads(msg.value().decode('utf-8'))
                user_id = event_data.get("userId")
                
                if not user_id or engine is None: 
                    continue

                # BRANCH A: TRANSACTION EXPENSE TRIGGERS (Live Actions)
                if incoming_topic == 'pixelfi.expense.created':
                    
                    # Engine 1: Isolation Forest Anomalies 
                    scored_df = expense_anomaly_detector.detect_anomalies(user_id, engine)
                    if scored_df is not None and not scored_df.empty and "is_anomaly" in scored_df.columns:
                        anomalies = scored_df[scored_df["is_anomaly"] == True]
                        if not anomalies.empty:
                            latest = anomalies.iloc[-1]
                            anomaly_payload = {
                                "userId": user_id,
                                "expenseId": str(latest.get("id", "unknown")),
                                "amount": float(latest["amount"]),
                                "category": str(latest["category"]),
                                "severityScore": round(abs(float(latest["anomaly_score"])), 4)
                            }
                            producer.produce(
                                'pixelfi.ml.anomaly.detected', 
                                value=json.dumps(anomaly_payload).encode('utf-8'),
                                callback=delivery_report
                            )
                            logger.info(f"🚨 Anomaly event sent to Kafka for user: {user_id}")

                    # Engine 2: Lifestyle Creep Evaluation (Statistical Variance Check)
                    creep_result = lifestyle_creep_analyzer.check_spending_creep(user_id, engine)
                    if creep_result and creep_result.get("is_creeping"):
                        producer.produce(
                            'pixelfi.ml.lifestyle.alert',
                            value=json.dumps(creep_result).encode('utf-8'),
                            callback=delivery_report
                        )
                        logger.info(f"Lifestyle Creep alert sent to Kafka for user: {user_id}")

                # BRANCH B: FINANCIAL SNAPSHOT TRIGGERS (Trend Profiles)
                elif incoming_topic == 'pixelfi.snapshot.created':
                    logger.info(f"📊 Compiling cashflow calculations & forecasts for user: {user_id}")
                    
                    # Engine 3: Cashflow Forecast and Runway calculation
                    cashflow_res = cashflow_forecaster.evaluate_runway_and_forecast(user_id, engine)
                    if cashflow_res:
                        # If available cash is bleeding quickly, dispatch the liquidity risk warning
                        if cashflow_res.get("liquidity_risk_flag"):
                            producer.produce(
                                'pixelfi.ml.cashflow.warning',
                                value=json.dumps(cashflow_res["warning_payload"]).encode('utf-8'),
                                callback=delivery_report
                            )
                            logger.warning(f"Liquidity Risk Warning sent to Kafka for user: {user_id}")
                        
                        # Always dispatch the updated 3-month forecast trend payload
                        producer.produce(
                            'pixelfi.ml.prediction.ready',
                            value=json.dumps(cashflow_res["forecast_payload"]).encode('utf-8'),
                            callback=delivery_report
                        )
                        logger.info(f" Net Worth projections dispatched for user: {user_id}")

            except Exception as loop_error:
                logger.error(f"Error executing sub-engine processing matrix inside loop: {str(loop_error)}")
                
    finally:
        logger.info("Draining outbound message buffers safely before worker teardown...")
        producer.flush()
        consumer.close()

if __name__ == "__main__":
    start_kafka_worker()