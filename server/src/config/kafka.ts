import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'pixel-fi-backend',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || 'kafka:29092'],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'pixel-fi-express-group' });

export const connectKafka = async () => {
  try {
    await producer.connect();
    await consumer.connect();
    console.log(' Express Kafka Producer and Consumer connection active.');
  } catch (error: any) {
    console.error(' Failed to bridge Express to Kafka broker:', error.message);
  }
};
