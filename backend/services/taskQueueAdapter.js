// Environment-based RabbitMQ configuration
const USE_RABBITMQ = process.env.USE_RABBITMQ === 'true';

// Fallback notification functions (without RabbitMQ)
const sendDirectEmail = async (emailData) => {
    const { sendTaskAssignmentEmail } = require('../services/emailService');
    try {
        await sendTaskAssignmentEmail(emailData);
        console.log('✅ Email sent directly (no queue)');
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
};

const sendDirectChat = async (chatData, io) => {
    const Message = require('../models/message');
    try {
        const { projectId, title, assignedUser, priority, dueDate, userId, userName } = chatData;
        
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
        console.log('✅ Chat notification sent directly (no queue)');
    } catch (error) {
        console.error('❌ Failed to send chat notification:', error);
    }
};

// Export appropriate functions based on environment
let publishEmailJob, publishOtpEmailJob, publishChatJob, publishTaskStatusJob, publishTaskDeleteJob;

if (USE_RABBITMQ) {
    // Use RabbitMQ queues
    const rabbitMQQueue = require('./taskQueue');
    publishEmailJob = rabbitMQQueue.publishEmailJob;
    publishOtpEmailJob = rabbitMQQueue.publishOtpEmailJob;
    publishChatJob = rabbitMQQueue.publishChatJob;
    publishTaskStatusJob = rabbitMQQueue.publishTaskStatusJob;
    publishTaskDeleteJob = rabbitMQQueue.publishTaskDeleteJob;
} else {
    // Use direct notifications (no queues)
    publishEmailJob = async (emailData) => {
        setImmediate(() => sendDirectEmail(emailData));
    };

    publishOtpEmailJob = async (otpEmailData) => {
        const { sendOTPEmail } = require('../services/emailService');
        setImmediate(() => sendOTPEmail(otpEmailData.email, otpEmailData.name, otpEmailData.otp));
    };
    
    publishChatJob = async (chatData) => {
        const io = require('../index').io;
        setImmediate(() => sendDirectChat(chatData, io));
    };
    
    publishTaskStatusJob = async (statusData) => {
        const io = require('../index').io;
        const Message = require('../models/message');
        setImmediate(async () => {
            try {
                const { projectId, taskTitle, status, userName, userId } = statusData;
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
            } catch (error) {
                console.error('❌ Failed to send status update:', error);
            }
        });
    };
    
    publishTaskDeleteJob = async (deleteData) => {
        const io = require('../index').io;
        const Message = require('../models/message');
        setImmediate(async () => {
            try {
                const { projectId, taskTitle, userName, userId } = deleteData;
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
            } catch (error) {
                console.error('❌ Failed to send delete notification:', error);
            }
        });
    };
}

module.exports = {
    publishEmailJob,
    publishOtpEmailJob,
    publishChatJob,
    publishTaskStatusJob,
    publishTaskDeleteJob
};
