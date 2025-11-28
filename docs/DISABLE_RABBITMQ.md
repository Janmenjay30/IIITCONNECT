# Disable RabbitMQ (Temporary Fallback)

If you don't want to use RabbitMQ right now, you have 2 options:

## Option 1: Skip RabbitMQ (Server will continue without it)

The server is already configured to work without RabbitMQ. Just ignore the error messages. The notifications will be disabled but task creation will still work.

**Current behavior:**
- ✅ Task creation works
- ❌ Email notifications disabled
- ❌ Chat notifications disabled

## Option 2: Use Environment Variable to Disable RabbitMQ

Add to `backend/.env`:

```env
# Disable RabbitMQ
ENABLE_RABBITMQ=false
```

Then update `backend/index.js` to check this variable before connecting.

## Option 3: Comment Out RabbitMQ Initialization

Edit `backend/index.js` - comment out RabbitMQ code:

```javascript
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Socket.IO server initialized`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // TEMPORARILY DISABLED - Uncomment when RabbitMQ is ready
  /*
  try {
    console.log('\n🐰 Initializing RabbitMQ...');
    await connectRabbitMQ();
    console.log('✅ RabbitMQ connected successfully');
    
    await startAllWorkers(io);
    console.log('✅ All RabbitMQ workers started\n');
  } catch (error) {
    console.error('❌ Failed to initialize RabbitMQ:', error);
    console.log('⚠️ Server will continue without RabbitMQ (notifications disabled)');
  }
  */
});
```

---

## Recommended: Just Start RabbitMQ (Easiest!)

Run the batch file I created:
```
.\start-rabbitmq.bat
```

It handles everything automatically! 🚀
