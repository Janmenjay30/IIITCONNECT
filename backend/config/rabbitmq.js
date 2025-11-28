const amqp = require('amqplib');

let connection = null;
let channel = null;

// RabbitMQ Configuration
const RABBITMQ_URL = process.env.RABBITMQ_URL ;
const EXCHANGE_NAME = 'iiitconnect_exchange';
const QUEUE_NAMES = {
    EMAIL: 'email_notifications',
    CHAT: 'chat_notifications',
    GENERAL: 'general_notifications'
};

// Exchange and Queue options
const EXCHANGE_OPTIONS = {
    durable: true,  // Survive RabbitMQ restart
    autoDelete: false
};

const QUEUE_OPTIONS = {
    durable: true,  // Survive RabbitMQ restart
    deadLetterExchange: `${EXCHANGE_NAME}_dlx`,  // Failed messages go here
    messageTtl: 86400000  // 24 hours message TTL
};

// Connect to RabbitMQ
const connectRabbitMQ = async () => {
    try {
        if (connection && channel) {
            console.log('✅ RabbitMQ already connected');
            return { connection, channel };
        }

        console.log('🔌 Connecting to RabbitMQ...');
        connection = await amqp.connect(RABBITMQ_URL, {
            heartbeat: 60,  // Send heartbeat every 60 seconds
            clientProperties: {
                connection_name: 'IIITConnect-Backend'
            }
        });

        console.log('✅ RabbitMQ connection established');

        // Handle connection errors
        connection.on('error', (err) => {
            console.error('❌ RabbitMQ connection error:', err);
            connection = null;
            channel = null;
        });

        connection.on('close', () => {
            console.warn('⚠️ RabbitMQ connection closed, reconnecting in 5s...');
            connection = null;
            channel = null;
            setTimeout(connectRabbitMQ, 5000);
        });

        // Create channel
        channel = await connection.createChannel();
        console.log('✅ RabbitMQ channel created');

        // Set prefetch count (process 1 message at a time per worker)
        await channel.prefetch(1);

        // Create main exchange (topic exchange for routing)
        await channel.assertExchange(EXCHANGE_NAME, 'topic', EXCHANGE_OPTIONS);
        console.log(`✅ Exchange "${EXCHANGE_NAME}" created`);

        // Create Dead Letter Exchange (for failed messages)
        await channel.assertExchange(`${EXCHANGE_NAME}_dlx`, 'topic', EXCHANGE_OPTIONS);
        console.log(`✅ Dead Letter Exchange created`);

        // Create queues
        for (const [key, queueName] of Object.entries(QUEUE_NAMES)) {
            await channel.assertQueue(queueName, QUEUE_OPTIONS);
            console.log(`✅ Queue "${queueName}" created`);

            // Create dead letter queue
            await channel.assertQueue(`${queueName}_dlq`, {
                durable: true,
                autoDelete: false
            });

            // Bind dead letter queue to DLX
            await channel.bindQueue(
                `${queueName}_dlq`,
                `${EXCHANGE_NAME}_dlx`,
                `${queueName}.#`
            );
        }

        // Bind queues to exchange with routing keys
        await channel.bindQueue(QUEUE_NAMES.EMAIL, EXCHANGE_NAME, 'email.#');
        await channel.bindQueue(QUEUE_NAMES.CHAT, EXCHANGE_NAME, 'chat.#');
        await channel.bindQueue(QUEUE_NAMES.GENERAL, EXCHANGE_NAME, 'general.#');

        console.log('🎉 RabbitMQ setup complete!');

        return { connection, channel };

    } catch (error) {
        console.error('❌ Failed to connect to RabbitMQ:', error);
        console.log('⏳ Retrying in 5 seconds...');
        
        // Retry connection after 5 seconds
        setTimeout(connectRabbitMQ, 5000);
        
        return { connection: null, channel: null };
    }
};

// Get channel (lazy initialization)
const getChannel = async () => {
    if (!channel || !connection) {
        await connectRabbitMQ();
    }
    return channel;
};

// Publish message to queue
const publishToQueue = async (routingKey, message, options = {}) => {
    try {
        const ch = await getChannel();
        if (!ch) {
            throw new Error('RabbitMQ channel not available');
        }

        const messageBuffer = Buffer.from(JSON.stringify(message));
        
        const publishOptions = {
            persistent: true,  // Survive RabbitMQ restart
            contentType: 'application/json',
            timestamp: Date.now(),
            ...options
        };

        const published = ch.publish(
            EXCHANGE_NAME,
            routingKey,
            messageBuffer,
            publishOptions
        );

        if (published) {
            console.log(`📤 Message published to "${routingKey}"`);
            return true;
        } else {
            console.warn(`⚠️ Message buffer full for "${routingKey}"`);
            return false;
        }

    } catch (error) {
        console.error(`❌ Failed to publish message to "${routingKey}":`, error);
        throw error;
    }
};

// Consume messages from queue
const consumeQueue = async (queueName, callback, options = {}) => {
    try {
        const ch = await getChannel();
        if (!ch) {
            throw new Error('RabbitMQ channel not available');
        }

        await ch.consume(queueName, async (message) => {
            if (!message) return;

            try {
                const content = JSON.parse(message.content.toString());
                console.log(`📥 Received message from "${queueName}"`);

                // Process message
                await callback(content, message);

                // Acknowledge message (remove from queue)
                ch.ack(message);
                console.log(`✅ Message processed from "${queueName}"`);

            } catch (error) {
                console.error(`❌ Error processing message from "${queueName}":`, error);

                // Retry logic
                const retryCount = message.properties.headers?.['x-retry-count'] || 0;
                const maxRetries = options.maxRetries || 3;

                if (retryCount < maxRetries) {
                    // Requeue with increased retry count
                    console.log(`🔄 Retrying message (attempt ${retryCount + 1}/${maxRetries})`);
                    
                    ch.nack(message, false, false);  // Don't requeue, let DLX handle it
                    
                    // Republish with incremented retry count
                    await publishToQueue(
                        message.fields.routingKey,
                        JSON.parse(message.content.toString()),
                        {
                            headers: {
                                'x-retry-count': retryCount + 1
                            }
                        }
                    );
                } else {
                    // Max retries exceeded, send to dead letter queue
                    console.error(`💀 Max retries exceeded, sending to DLQ`);
                    ch.nack(message, false, false);
                }
            }
        }, {
            noAck: false,  // Manual acknowledgment
            ...options
        });

        console.log(`👂 Listening to queue "${queueName}"`);

    } catch (error) {
        console.error(`❌ Failed to consume from "${queueName}":`, error);
        throw error;
    }
};

// Close connection gracefully
const closeConnection = async () => {
    try {
        if (channel) {
            await channel.close();
            console.log('✅ RabbitMQ channel closed');
        }
        if (connection) {
            await connection.close();
            console.log('✅ RabbitMQ connection closed');
        }
    } catch (error) {
        console.error('❌ Error closing RabbitMQ connection:', error);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down RabbitMQ connection...');
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down RabbitMQ connection...');
    await closeConnection();
    process.exit(0);
});

module.exports = {
    connectRabbitMQ,
    getChannel,
    publishToQueue,
    consumeQueue,
    closeConnection,
    QUEUE_NAMES,
    EXCHANGE_NAME
};
