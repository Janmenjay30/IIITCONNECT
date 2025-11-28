const { publishToQueue } = require('../config/rabbitmq');

// Publish email notification job
const publishEmailJob = async (emailData) => {
    try {
        await publishToQueue('email.task_assignment', {
            type: 'TASK_ASSIGNMENT',
            data: emailData,
            createdAt: new Date().toISOString()
        });
        console.log('✅ Email job published to RabbitMQ');
    } catch (error) {
        console.error('❌ Failed to publish email job:', error);
        throw error;
    }
};

// Publish chat notification job
const publishChatJob = async (chatData) => {
    try {
        await publishToQueue('chat.task_notification', {
            type: 'TASK_NOTIFICATION',
            data: chatData,
            createdAt: new Date().toISOString()
        });
        console.log('✅ Chat job published to RabbitMQ');
    } catch (error) {
        console.error('❌ Failed to publish chat job:', error);
        throw error;
    }
};

// Publish task status update notification
const publishTaskStatusJob = async (statusData) => {
    try {
        await publishToQueue('chat.task_status', {
            type: 'TASK_STATUS_UPDATE',
            data: statusData,
            createdAt: new Date().toISOString()
        });
        console.log('✅ Task status job published to RabbitMQ');
    } catch (error) {
        console.error('❌ Failed to publish task status job:', error);
        throw error;
    }
};

// Publish task deletion notification
const publishTaskDeleteJob = async (deleteData) => {
    try {
        await publishToQueue('chat.task_delete', {
            type: 'TASK_DELETE',
            data: deleteData,
            createdAt: new Date().toISOString()
        });
        console.log('✅ Task delete job published to RabbitMQ');
    } catch (error) {
        console.error('❌ Failed to publish task delete job:', error);
        throw error;
    }
};

module.exports = {
    publishEmailJob,
    publishChatJob,
    publishTaskStatusJob,
    publishTaskDeleteJob
};
