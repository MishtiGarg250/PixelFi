import { Kafka } from 'kafkajs';

const kafkaConfig: any = {
  clientId: 'pixel-fi-backend',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092'],
};

if (process.env.KAFKA_SASL_USERNAME && process.env.KAFKA_SASL_PASSWORD) {
  kafkaConfig.ssl = true;
  kafkaConfig.sasl = {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_SASL_USERNAME,
    password: process.env.KAFKA_SASL_PASSWORD,
  };
}

const kafka = new Kafka(kafkaConfig);

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
