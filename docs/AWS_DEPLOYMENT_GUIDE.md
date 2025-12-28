# AWS Deployment Guide for IIITConnect

## Prerequisites
- AWS Account (Free Tier)
- GitHub Account
- Domain (optional - can use EC2 public IP)

---

## Step 1: Create AWS EC2 Instance

### 1.1 Launch EC2 Instance
1. Go to **AWS Console** → **EC2** → **Launch Instance**
2. **Configuration:**
   ```
   Name: iiitconnect-server
   AMI: Amazon Linux 2023 (or Ubuntu 22.04)
   Instance type: t2.micro (Free Tier)
   Key pair: Create new → Download .pem file
  Network: Allow HTTP (80) and HTTPS (443)
   Storage: 8 GB gp3 (Free Tier)
   ```

3. **Security Group Rules:**
   ```
   SSH (22)     - Your IP
   HTTP (80)    - 0.0.0.0/0
   HTTPS (443)  - 0.0.0.0/0
   ```

  Notes:
  - Recommended: expose only 80/443 publicly. The frontend Nginx can reverse-proxy `/api` and `/socket.io` to the backend container over the private Docker network.
  - Only open 5000/3000 for debugging, then close them.

4. Click **Launch Instance**

### 1.2 Connect to EC2
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@<YOUR-EC2-PUBLIC-IP>
```

### 1.3 Install Docker & Docker Compose
```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version

# Logout and login again for group changes
exit
```

### 1.4 Install AWS CLI
```bash
sudo yum install aws-cli -y
aws --version
```

---

## Step 2: Create Amazon ECR Repositories

### 2.1 Create Repositories
```bash
# Backend repository
aws ecr create-repository \
    --repository-name iiitconnect-backend \
    --region us-east-1

# Frontend repository
aws ecr create-repository \
    --repository-name iiitconnect-frontend \
    --region us-east-1
```

### 2.2 Note Repository URIs
```
Backend: <account-id>.dkr.ecr.us-east-1.amazonaws.com/iiitconnect-backend
Frontend: <account-id>.dkr.ecr.us-east-1.amazonaws.com/iiitconnect-frontend
```

---

## Step 3: Create IAM User for GitHub Actions

### 3.1 Create IAM User
1. Go to **IAM** → **Users** → **Create User**
2. Username: `github-actions-deploy`
3. Attach policies:
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonEC2FullAccess` (or custom policy with limited permissions)

### 3.2 Create Access Keys
1. Click on user → **Security credentials**
2. **Create access key** → **Application running outside AWS**
3. **Download credentials** (you'll need these for GitHub Secrets)

---

## Step 4: Configure GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:
```
AWS_ACCESS_KEY_ID=<from IAM user>
AWS_SECRET_ACCESS_KEY=<from IAM user>
EC2_HOST=<your EC2 public IP or domain>
EC2_SSH_PRIVATE_KEY=<content of your .pem file>
```

To get EC2_SSH_PRIVATE_KEY content:
```bash
cat your-key.pem
# Copy entire content including -----BEGIN RSA PRIVATE KEY-----
```

---

## Step 5: Setup Environment Variables on EC2

### 5.1 SSH to EC2 and create .env file
```bash
ssh -i your-key.pem ec2-user@<YOUR-EC2-IP>

# Create project directory
mkdir -p ~/iiitconnect
cd ~/iiitconnect

# Create .env file
nano .env
```

### 5.2 Add environment variables
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
JWT_SECRET=<generate-random-64-char-string>
PORT=5000

EMAIL_USER=<your-gmail-address>
EMAIL_APP_PASSWORD=<gmail-app-password>
EMAIL_FROM_NAME=IIITConnect Team

SENDGRID_API_KEY=SG.<your-sendgrid-api-key>
SENDGRID_FROM_EMAIL=<your-verified-sendgrid-email>

USE_RABBITMQ=true
RABBITMQ_URL=amqps://<username>:<password>@<host>.lmq.cloudamqp.com/<vhost>

# Must match the browser origin that loads your frontend.
# If you expose only port 80: use http://your-ec2-ip (or https://yourdomain.com)
CORS_ORIGIN=http://your-ec2-ip

# If you don't want RabbitMQ initially:
# USE_RABBITMQ=false
```

### 5.3 Create docker-compose.yml on EC2
```bash
nano docker-compose.yml
```

```yaml
version: '3.8'

services:
  backend:
    image: <account-id>.dkr.ecr.us-east-1.amazonaws.com/iiitconnect-backend:latest
    container_name: iiitconnect-backend
    env_file:
      - .env
    restart: unless-stopped

  frontend:
    image: <account-id>.dkr.ecr.us-east-1.amazonaws.com/iiitconnect-frontend:latest
    container_name: iiitconnect-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

Why remove backend ports?
- With the default frontend Nginx config, requests to `/api` and `/socket.io` are reverse-proxied to the backend container using the internal Docker network. This keeps your API off the public internet except through port 80/443.

If you want the old behavior (not recommended), you can publish `5000:5000` and access the API directly.

---

## Step 6: Initial Manual Deployment

You have two deployment options:

### Option A (Simplest): Build on EC2 from Git
Use this if you don't want ECR yet.

1) SSH into EC2, then:
```bash
mkdir -p ~/iiitconnect
cd ~/iiitconnect

# Install git if needed
sudo yum install -y git || true

git clone <YOUR_GITHUB_REPO_URL> .

# Create .env (see Step 5.2)
nano .env

# Build and run
docker compose up -d --build
docker compose logs -f
```

### Option B (Recommended for CI/CD): ECR images

### 6.1 Build and push images locally (first time)
```bash
# On your local machine
cd D:\E Drive\programming\webdev\IIITConnect\IIITCONNECT

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/iiitconnect-backend:latest .
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/iiitconnect-backend:latest

# Build and push frontend
cd ../frontend
docker build -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/iiitconnect-frontend:latest .
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/iiitconnect-frontend:latest
```

### 6.2 Deploy on EC2
```bash
# SSH to EC2
ssh -i your-key.pem ec2-user@<YOUR-EC2-IP>

cd ~/iiitconnect

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Pull and start containers
docker-compose pull
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## Step 7: Setup Domain (Optional)

### 7.1 Configure Route 53 or External DNS
1. Point your domain to EC2 public IP
2. Update CORS_ORIGIN in .env
3. Restart containers

### 7.2 Setup SSL with Let's Encrypt (Optional)
```bash
# Install Certbot
sudo yum install certbot -y

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update nginx to use SSL
```

---

## Step 8: Monitoring & Maintenance

### 8.1 View logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 8.2 Restart services
```bash
docker-compose restart
```

### 8.3 Update application
```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d
```

### 8.4 Monitor resources
```bash
# Check disk space
df -h

# Check Docker resources
docker stats

# Clean up unused images
docker image prune -af
```

---

## Step 9: Cost Optimization

### Free Tier Limits
- **EC2**: 750 hours/month of t2.micro
- **ECR**: 500MB storage
- **Data Transfer**: 1GB outbound/month
- **Elastic IP**: Free if attached to running instance

### Stay Within Free Tier
1. ✅ Use single t2.micro instance
2. ✅ Stop instance when not in use (labs/testing)
3. ✅ Clean up old Docker images
4. ✅ Use CloudWatch Free Tier for monitoring
5. ✅ Compress images (use alpine)

### After Free Tier
- t2.micro: ~$8-10/month
- Consider AWS Lightsail: $3.50/month

---

## Troubleshooting

### Issue: Cannot connect to EC2
**Solution:**
- Check Security Group allows your IP
- Verify .pem file permissions: `chmod 400`
- Try `ssh -v` for verbose output

### Issue: Docker permission denied
**Solution:**
```bash
sudo usermod -a -G docker ec2-user
exit
# Login again
```

### Issue: Out of disk space
**Solution:**
```bash
docker system prune -af
docker volume prune -f
```

### Issue: ECR login fails
**Solution:**
```bash
aws configure
# Enter AWS Access Key ID and Secret
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

---

## Access Your Application

- **Frontend**: `http://<EC2-PUBLIC-IP>`
- **Backend API**: `http://<EC2-PUBLIC-IP>/api/...`
- **Backend Health**: `http://<EC2-PUBLIC-IP>/` (served by the backend container, via `/api` you can also add a dedicated health endpoint if you prefer)

---

## Next Steps

1. ✅ Setup custom domain
2. ✅ Enable HTTPS with SSL certificate
3. ✅ Configure CloudWatch monitoring
4. ✅ Setup automated backups
5. ✅ Configure Auto Scaling (paid tier)
6. ✅ Setup Load Balancer (paid tier)
