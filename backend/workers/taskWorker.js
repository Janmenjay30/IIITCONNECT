const { consumeQueue, QUEUE_NAMES } = require('../config/rabbitmq');
const { sendTaskAssignmentEmail } = require('../services/emailService');
const Message = require('../models/message');

// Email Worker - Processes email notifications
const startEmailWorker = async () => {
    console.log('📧 Starting Email Worker...');

    await consumeQueue(
        QUEUE_NAMES.EMAIL,
        async (job, message) => {
            const { type, data } = job;

            console.log(`📧 Processing email job: ${type}`);
            console.log(`📧 Email to: ${data.recipientEmail}`);

            try {
                if (type === 'TASK_ASSIGNMENT') {
                    await sendTaskAssignmentEmail(data);
                    console.log(`✅ Task assignment email sent to ${data.recipientEmail}`);
                }
                // Add more email types here as needed
            } catch (error) {
                console.error('❌ Email sending failed:', error);
                throw error;  // Will trigger retry logic
            }
        },
        {
            maxRetries: 3  // Retry failed emails up to 3 times
        }
    );

    console.log('✅ Email Worker started successfully');
};

// Chat Worker - Processes chat notifications
const startChatWorker = async (io) => {
    console.log('💬 Starting Chat Worker...');

    await consumeQueue(
        QUEUE_NAMES.CHAT,
        async (job, message) => {
            const { type, data } = job;

            console.log(`💬 Processing chat job: ${type}`);

            try {
                if (type === 'TASK_NOTIFICATION') {
                    await sendTaskChatNotification(data, io);
                    console.log(`✅ Task notification sent to room: project_${data.projectId}`);
                }
                else if (type === 'TASK_STATUS_UPDATE') {
                    await sendTaskStatusUpdate(data, io);
                    console.log(`✅ Task status update sent to room: project_${data.projectId}`);
                }
                else if (type === 'TASK_DELETE') {
                    await sendTaskDeleteNotification(data, io);
                    console.log(`✅ Task delete notification sent to room: project_${data.projectId}`);
                }
            } catch (error) {
                console.error('❌ Chat notification failed:', error);
                throw error;  // Will trigger retry logic
            }
        },
        {
            maxRetries: 3  // Retry failed chat messages up to 3 times
        }
    );

    console.log('✅ Chat Worker started successfully');
};

// Helper: Send task chat notification
const sendTaskChatNotification = async (data, io) => {
    const { projectId, title, assignedUser, priority, dueDate, userId, userName } = data;
    
    const roomId = `project_${projectId}`;
    const systemMessageText = assignedUser 
        ? `📋 New Task Assigned!\n\nTask: ${title}\nAssigned to: ${assignedUser.name}\nPriority: ${priority}\nDue: ${dueDate ? new Date(dueDate).toLocaleDateString() : 'No deadline'}`
        : `📋 New Task Created!\n\nTask: ${title}\nPriority: ${priority}\nDue: ${dueDate ? new Date(dueDate).toLocaleDateString() : 'No deadline'}`;

    const systemMessage = await Message.create({
        text: systemMessageText,
        sender: userId,
        room: roomId,
        isSystemMessage: true,
        createdAt: new Date()
    });

    if (io) {
        const populatedMessage = await Message.findById(systemMessage._id)
            .populate('sender', 'name email');
        io.to(roomId).emit('chat message', populatedMessage);
    }
};

// Helper: Send task status update
const sendTaskStatusUpdate = async (data, io) => {
    const { projectId, taskTitle, status, userName, userId } = data;
    
    const roomId = `project_${projectId}`;
    const statusEmoji = status === 'completed' ? '✅' : status === 'in-progress' ? '🔄' : '📝';
    const systemMessageText = `${statusEmoji} Task Status Updated!\n\nTask: ${taskTitle}\nNew Status: ${status.toUpperCase()}\nUpdated by: ${userName}`;

    const systemMessage = await Message.create({
        text: systemMessageText,
        sender: userId,
        room: roomId,
        isSystemMessage: true,
        createdAt: new Date()
    });

    if (io) {
        const populatedMessage = await Message.findById(systemMessage._id)
            .populate('sender', 'name email');
        io.to(roomId).emit('chat message', populatedMessage);
    }
};

// Helper: Send task delete notification
const sendTaskDeleteNotification = async (data, io) => {
    const { projectId, taskTitle, userName, userId } = data;
    
    const roomId = `project_${projectId}`;
    const systemMessageText = `🗑️ Task Deleted\n\nTask: ${taskTitle}\nDeleted by: ${userName}`;

    const systemMessage = await Message.create({
        text: systemMessageText,
        sender: userId,
        room: roomId,
        isSystemMessage: true,
        createdAt: new Date()
    });

    if (io) {
        const populatedMessage = await Message.findById(systemMessage._id)
            .populate('sender', 'name email');
        io.to(roomId).emit('chat message', populatedMessage);
    }
};

// Start all workers
const startAllWorkers = async (io) => {
    console.log('🚀 Starting all RabbitMQ workers...');
    
    try {
        await startEmailWorker();
        await startChatWorker(io);
        console.log('🎉 All workers started successfully!');
    } catch (error) {
        console.error('❌ Failed to start workers:', error);
        throw error;
    }
};

module.exports = {
    startEmailWorker,
    startChatWorker,
    startAllWorkers
};
