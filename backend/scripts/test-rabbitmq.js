const amqp = require('amqplib');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const testConnection = async () => {
    const url = process.env.RABBITMQ_URL;
    console.log('Testing RabbitMQ connection...');
    console.log('URL:', url.replace(/:[^:@]+@/, ':****@')); // Hide password
    
    try {
        console.log('\n1️⃣ Attempting connection...');
        const connection = await amqp.connect(url, {
            heartbeat: 60,
            clientProperties: {
                connection_name: 'IIITConnect-Test'
            }
        });
        
        console.log('✅ Connection successful!');
        
        console.log('\n2️⃣ Creating channel...');
        const channel = await connection.createChannel();
        console.log('✅ Channel created!');
        
        console.log('\n3️⃣ Testing queue operations...');
        const testQueue = 'test_queue_' + Date.now();
        await channel.assertQueue(testQueue, { durable: false, autoDelete: true });
        console.log('✅ Queue created:', testQueue);
        
        console.log('\n4️⃣ Publishing test message...');
        const testMsg = { test: 'Hello from IIITConnect', timestamp: new Date() };
        channel.publish('', testQueue, Buffer.from(JSON.stringify(testMsg)));
        console.log('✅ Message published!');
        
        console.log('\n5️⃣ Consuming message...');
        const result = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout waiting for message')), 5000);
            
            channel.consume(testQueue, (msg) => {
                if (msg) {
                    clearTimeout(timeout);
                    const content = JSON.parse(msg.content.toString());
                    channel.ack(msg);
                    resolve(content);
                }
            }, { noAck: false });
        });
        
        console.log('✅ Message received:', result);
        
        console.log('\n6️⃣ Cleaning up...');
        await channel.deleteQueue(testQueue);
        await channel.close();
        await connection.close();
        
        console.log('\n🎉 All tests passed! LavinMQ is working correctly.');
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\nFull error:', error);
        
        if (error.code === 'ENOTFOUND') {
            console.error('\n⚠️ DNS lookup failed - hostname does not exist');
            console.error('   Your LavinMQ instance might be deleted or suspended');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n⚠️ Connection refused - server is not accepting connections');
        } else if (error.message.includes('authentication')) {
            console.error('\n⚠️ Authentication failed - check your credentials');
        }
        
        process.exit(1);
    }
};

testConnection();
