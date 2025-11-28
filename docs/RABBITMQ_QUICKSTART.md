# 🚀 Quick Start: RabbitMQ Setup

## Option 1: Docker (Recommended) ⭐

### Step 1: Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop

### Step 2: Run RabbitMQ Container
```powershell
# Pull and run RabbitMQ with Management UI
docker run -d `
  --name rabbitmq `
  --hostname rabbitmq-server `
  -p 5672:5672 `
  -p 15672:15672 `
  -e RABBITMQ_DEFAULT_USER=admin `
  -e RABBITMQ_DEFAULT_PASS=admin123 `
  -v rabbitmq-data:/var/lib/rabbitmq `
  rabbitmq:3-management

# Wait 10-15 seconds for RabbitMQ to start
Start-Sleep -Seconds 15

# Verify it's running
docker ps | Select-String rabbitmq
```

### Step 3: Access Management UI
```powershell
# Open browser
start http://localhost:15672

# Login credentials:
# Username: admin
# Password: admin123
```

---

## Option 2: Windows Native Install

### Step 1: Install Erlang
Download from: https://www.erlang.org/downloads
- Choose Windows 64-bit installer
- Install with default settings

### Step 2: Install RabbitMQ
Download from: https://www.rabbitmq.com/install-windows.html
- Choose Windows installer
- Install with default settings

### Step 3: Enable Management Plugin
```powershell
cd "C:\Program Files\RabbitMQ Server\rabbitmq_server-3.x\sbin"
.\rabbitmq-plugins.bat enable rabbitmq_management

# Restart service
.\rabbitmq-service.bat stop
.\rabbitmq-service.bat start
```

### Step 4: Access Management UI
```powershell
start http://localhost:15672

# Login credentials:
# Username: guest
# Password: guest
```

---

## Option 3: Chocolatey (Quick Windows Install)

### Step 1: Install via Chocolatey
```powershell
# Install Chocolatey if not installed
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install RabbitMQ (includes Erlang)
choco install rabbitmq -y

# Enable Management Plugin
cd "C:\Program Files\RabbitMQ Server\rabbitmq_server-*\sbin"
.\rabbitmq-plugins.bat enable rabbitmq_management
```

---

## Backend Setup (All Options)

### Step 1: Install Dependencies
```powershell
cd d:\E Drive\programming\webdev\IIITConnect\IIITCONNECT\backend
npm install
```

### Step 2: Update .env (Optional)
```powershell
# Add to backend/.env
echo "RABBITMQ_URL=amqp://admin:admin123@localhost:5672" >> .env
```

### Step 3: Start Backend
```powershell
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5000
📍 Socket.IO server initialized
🌐 Environment: development

🐰 Initializing RabbitMQ...
✅ RabbitMQ connection established
✅ RabbitMQ channel created
✅ Exchange "iiitconnect_exchange" created
🎉 RabbitMQ setup complete!

🚀 Starting all RabbitMQ workers...
📧 Starting Email Worker...
✅ Email Worker started successfully
💬 Starting Chat Worker...
✅ Chat Worker started successfully
🎉 All workers started successfully!
```

---

## Verification

### 1. Check RabbitMQ is Running
```powershell
# Docker
docker ps | Select-String rabbitmq

# Windows Service
Get-Service | Select-String rabbitmq
```

### 2. Check Management UI
```powershell
start http://localhost:15672
```

Should see:
- **Overview** tab with server stats
- **Queues** tab with 3 queues:
  - `email_notifications`
  - `chat_notifications`
  - `general_notifications`
- **Connections** tab showing 1 connection (your backend)

### 3. Test Task Creation

1. Start frontend: `cd ..\frontend && npm run dev`
2. Open: http://localhost:5173
3. Login and create a project
4. Add a task and assign to someone
5. Check backend console for:
   ```
   ⚡ Task created and responded in 342ms
   📤 Message published to "email.task_assignment"
   📧 Processing email job: TASK_ASSIGNMENT
   ✅ Task assignment email sent to user@example.com
   ```

6. Check RabbitMQ UI:
   - Go to Queues tab
   - See message count increase then decrease
   - Total messages processed should increment

---

## Troubleshooting

### Issue: "Connection Refused"

**Docker:**
```powershell
# Check if container is running
docker ps -a | Select-String rabbitmq

# If not running, start it
docker start rabbitmq

# Check logs
docker logs rabbitmq
```

**Windows Service:**
```powershell
# Check status
rabbitmq-service.bat status

# Start service
rabbitmq-service.bat start
```

---

### Issue: "Port Already in Use"

```powershell
# Find process using port 5672
netstat -ano | findstr :5672

# Kill process (replace PID with actual number)
taskkill /F /PID <PID>

# Restart RabbitMQ
docker restart rabbitmq
```

---

### Issue: Can't Access Management UI

**Check if port 15672 is open:**
```powershell
netstat -ano | findstr :15672
```

**Docker: Ensure port is mapped:**
```powershell
docker port rabbitmq
# Should show:
# 5672/tcp -> 0.0.0.0:5672
# 15672/tcp -> 0.0.0.0:15672
```

**Enable Management Plugin (if not enabled):**
```powershell
docker exec rabbitmq rabbitmq-plugins enable rabbitmq_management
docker restart rabbitmq
```

---

## Useful Commands

### Docker Commands
```powershell
# Start RabbitMQ
docker start rabbitmq

# Stop RabbitMQ
docker stop rabbitmq

# Restart RabbitMQ
docker restart rabbitmq

# View logs
docker logs -f rabbitmq

# Access RabbitMQ shell
docker exec -it rabbitmq bash

# Remove container (data persists in volume)
docker rm -f rabbitmq

# Remove volume (deletes all data!)
docker volume rm rabbitmq-data
```

### RabbitMQ Management
```powershell
# List queues
docker exec rabbitmq rabbitmqctl list_queues

# List exchanges
docker exec rabbitmq rabbitmqctl list_exchanges

# Purge queue
docker exec rabbitmq rabbitmqctl purge_queue email_notifications

# Reset RabbitMQ (deletes everything!)
docker exec rabbitmq rabbitmqctl reset
```

---

## Production Deployment

### Environment Variables

```env
# Production RabbitMQ (use CloudAMQP, AWS, etc.)
RABBITMQ_URL=amqps://username:password@hostname:5671/vhost

# Or self-hosted
RABBITMQ_URL=amqp://admin:password@your-rabbitmq-server.com:5672
```

### Recommended Services:

1. **CloudAMQP** (Managed RabbitMQ)
   - Free tier: 1 million messages/month
   - https://www.cloudamqp.com/

2. **AWS MQ** (Managed RabbitMQ)
   - AWS managed service
   - https://aws.amazon.com/amazon-mq/

3. **Self-Hosted**
   - Deploy RabbitMQ on your server
   - Use Docker Compose
   - Enable SSL/TLS

---

## Next Steps

After RabbitMQ is running:

1. ✅ Verify backend connects successfully
2. ✅ Test task creation
3. ✅ Check Management UI shows queues
4. ✅ Monitor message flow
5. ✅ Test email notifications
6. ✅ Test chat notifications
7. ✅ Check dead letter queues

**You're all set! 🎉**

For detailed documentation, see:
- [RABBITMQ_GUIDE.md](./RABBITMQ_GUIDE.md) - Complete guide
- [RABBITMQ_COMPARISON.md](./RABBITMQ_COMPARISON.md) - Before/after comparison
