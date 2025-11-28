# 🚀 Install RabbitMQ on Windows (No Docker Needed!)

## Quick Install - Choose One Method:

---

## ⭐ Method 1: Automatic Install (Easiest - Recommended)

### Step 1: Run the installer script
```powershell
# Right-click and "Run as Administrator"
.\install-rabbitmq-windows.bat
```

This will:
1. Check if Chocolatey is installed
2. Install Chocolatey if needed (package manager for Windows)
3. Install Erlang (RabbitMQ dependency)
4. Install RabbitMQ
5. Enable Management UI
6. Open http://localhost:15672 in your browser

**Total time: ~5 minutes**

---

## 📦 Method 2: Manual Install (If script fails)

### Step 1: Install Erlang (Required)
1. Download from: https://www.erlang.org/downloads
2. Choose **Windows 64-bit installer**
3. Run installer with default settings
4. Wait for installation to complete

### Step 2: Install RabbitMQ
1. Download from: https://www.rabbitmq.com/install-windows.html
2. Choose **Windows installer**
3. Run installer with default settings
4. Wait for installation to complete

### Step 3: Enable Management Plugin
Open **Command Prompt as Administrator** and run:

```cmd
cd "C:\Program Files\RabbitMQ Server\rabbitmq_server-3.13.0\sbin"
rabbitmq-plugins.bat enable rabbitmq_management
rabbitmq-service.bat restart
```

*(Note: Replace `3.13.0` with your version number)*

### Step 4: Verify Installation
```cmd
.\check-rabbitmq.bat
```

Should show:
```
[OK] RabbitMQ service is installed
[OK] RabbitMQ service is running
[OK] Port 5672 is listening
[OK] Port 15672 is listening
```

---

## ✅ Verify RabbitMQ is Working

### Check Status:
```powershell
.\check-rabbitmq.bat
```

### Access Management UI:
1. Open browser: http://localhost:15672
2. Login:
   - **Username:** `guest`
   - **Password:** `guest`

You should see the RabbitMQ dashboard!

---

## 🎯 Start Your Backend

Once RabbitMQ is running:

```powershell
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on port 5000

🐰 Initializing RabbitMQ...
✅ RabbitMQ connection established
✅ RabbitMQ channel created
✅ Exchange "iiitconnect_exchange" created
✅ Queue "email_notifications" created
✅ Queue "chat_notifications" created
✅ Queue "general_notifications" created
🎉 RabbitMQ setup complete!

📧 Starting Email Worker...
✅ Email Worker started successfully
💬 Starting Chat Worker...
✅ Chat Worker started successfully
🎉 All workers started successfully!
```

---

## 🔧 Troubleshooting

### Issue: "RabbitMQ service failed to start"

**Solution 1: Check Windows Services**
```powershell
# Open Services
services.msc

# Find "RabbitMQ" service
# Right-click → Start
```

**Solution 2: Check if Erlang is installed**
```powershell
where erl
# Should show: C:\Program Files\Erlang\erts-x.x\bin\erl.exe
```

If not found, reinstall Erlang.

---

### Issue: "Port 5672 already in use"

**Find what's using the port:**
```powershell
netstat -ano | findstr :5672
```

**Kill the process:**
```powershell
taskkill /F /PID <PID_NUMBER>
```

---

### Issue: Can't access Management UI

**Enable the plugin:**
```cmd
cd "C:\Program Files\RabbitMQ Server\rabbitmq_server-*\sbin"
rabbitmq-plugins.bat enable rabbitmq_management
rabbitmq-service.bat restart
```

**Wait 10 seconds**, then try: http://localhost:15672

---

## 🎓 Useful Commands

### Check Service Status:
```powershell
sc query RabbitMQ
```

### Start RabbitMQ:
```powershell
net start RabbitMQ
```

### Stop RabbitMQ:
```powershell
net stop RabbitMQ
```

### Restart RabbitMQ:
```powershell
net stop RabbitMQ
net start RabbitMQ
```

### View Queues:
```powershell
cd "C:\Program Files\RabbitMQ Server\rabbitmq_server-*\sbin"
rabbitmqctl.bat list_queues
```

---

## 📊 After Installation

1. ✅ RabbitMQ installed
2. ✅ Management UI accessible at http://localhost:15672
3. ✅ Service running on port 5672
4. ✅ Ready to use with your backend!

**Next steps:**
```powershell
# 1. Verify RabbitMQ
.\check-rabbitmq.bat

# 2. Start backend
cd backend
npm run dev

# 3. Create a task in your app
# 4. Check RabbitMQ Management UI for messages
```

---

## 💡 Why No Docker?

**Pros of native install:**
- ✅ No Docker Desktop needed
- ✅ Runs as Windows service (auto-starts on boot)
- ✅ Better performance on Windows
- ✅ Easier to manage via Windows Services

**Cons:**
- Takes ~500MB disk space
- Requires Erlang runtime

---

## 🗑️ Uninstall (if needed)

```powershell
# Uninstall RabbitMQ
choco uninstall rabbitmq -y

# Uninstall Erlang (optional)
choco uninstall erlang -y
```

Or use Windows **Add/Remove Programs**.

---

**You're all set!** RabbitMQ is now running natively on Windows without Docker! 🎉
