# IIITConnect Docker Commands

## Local Development with Docker

### Build and run locally
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual service commands
```bash
# Backend only
docker-compose up -d backend
docker-compose logs -f backend

# Frontend only
docker-compose up -d frontend
docker-compose logs -f frontend
```

## AWS ECR Commands

### Login to ECR
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### Build and Push to ECR
```bash
# Backend
cd backend
docker build -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/iiitconnect-backend:latest .
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/iiitconnect-backend:latest

# Frontend
cd frontend
docker build -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/iiitconnect-frontend:latest .
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/iiitconnect-frontend:latest
```

## EC2 Deployment Commands

### SSH to EC2
```bash
ssh -i your-key.pem ec2-user@<EC2-PUBLIC-IP>
```

### Deploy on EC2
```bash
cd ~/iiitconnect

# Pull latest images
docker-compose pull

# Restart services
docker-compose down
docker-compose up -d

# View logs
docker-compose logs -f
```

### Maintenance
```bash
# Clean up
docker system prune -af
docker volume prune -f

# Check status
docker ps
docker stats

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

## Useful Docker Commands

### Debugging
```bash
# Enter container shell
docker exec -it iiitconnect-backend sh
docker exec -it iiitconnect-frontend sh

# View container logs
docker logs iiitconnect-backend
docker logs iiitconnect-frontend

# Inspect container
docker inspect iiitconnect-backend
```

### Cleanup
```bash
# Remove all stopped containers
docker container prune -f

# Remove unused images
docker image prune -af

# Remove unused volumes
docker volume prune -f

# Full cleanup
docker system prune -af --volumes
```
