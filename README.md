# 🎓 IIITConnect - Project Collaboration Platform

<div align="center">

![IIITConnect Banner](https://img.shields.io/badge/IIITConnect-Project_Collaboration-blue?style=for-the-badge)

**A comprehensive full-stack platform for IIIT students to discover projects, form teams, and collaborate in real-time**

[![React](https://img.shields.io/badge/React-19.0.0-61dafb?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-010101?logo=socket.io)](https://socket.io/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Real-time Features](#-real-time-features)
- [Security](#-security)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Overview

**IIITConnect** is a modern, full-stack web application designed to revolutionize how IIIT students collaborate on projects. The platform bridges the gap between students with ideas and those looking to contribute their skills, creating a thriving ecosystem for academic and personal projects.

### Why IIITConnect?

- 🔍 **Discover** - Browse through diverse projects and find ones that match your interests
- 🤝 **Collaborate** - Join teams and work with like-minded students
- 💬 **Communicate** - Real-time chat for seamless team coordination
- 📊 **Manage** - Track tasks, manage team members, and monitor project progress
- 🔒 **Secure** - Email verification and JWT-based authentication

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Two-Factor Registration** with Email OTP verification
- **JWT-based Authentication** with 7-day token expiry
- **Password Security** using bcrypt hashing (12 salt rounds)
- **Account Status Management** (Active, Pending, Suspended)
- **Protected Routes** with middleware validation

### 📂 Project Management
- **Create Projects** with detailed descriptions and required roles
- **Tag-based Discovery** for easy project filtering
- **Team Size Management** with configurable limits
- **Application System** for joining projects
- **Role Assignment** for team members
- **Task Management** with status tracking (Pending, In-Progress, Completed)

### 👥 Team Collaboration
- **Application Review** system for project creators
- **Team Member Management** (Add, Remove, Update Roles)
- **Team Dashboard** to view all projects you're part of
- **Member Profiles** with skills and expertise display

### 💬 Real-time Chat System
- **Multi-Room Architecture**:
  - 🌍 **Global Chat** - Public discussions for all users
  - 📢 **Announcements** - Important platform updates
  - 🚀 **Project Chats** - Private team conversations
  - 💌 **Private Chats** - Direct messaging between users
- **Socket.IO Integration** for instant messaging
- **Message Persistence** with MongoDB storage
- **Room-based Access Control** with authorization
- **System Messages** for team events

### 🎨 User Interface
- **Responsive Design** with Tailwind CSS
- **Modern UI/UX** with React 19
- **Toast Notifications** for user feedback
- **Dynamic Routing** with React Router DOM
- **Real-time Updates** across all components

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.0.0 | UI Framework |
| **Vite** | 6.1.0 | Build Tool & Dev Server |
| **React Router DOM** | 7.1.5 | Client-side Routing |
| **Tailwind CSS** | 3.4.17 | Styling Framework |
| **Axios** | 1.9.0 | HTTP Client |
| **Socket.IO Client** | 4.8.1 | WebSocket Client |
| **React Hot Toast** | 2.6.0 | Notifications |
| **Font Awesome** | 6.7.2 | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | - | Runtime Environment |
| **Express.js** | 4.21.2 | Web Framework |
| **Socket.IO** | 4.8.1 | Real-time Communication |
| **Mongoose** | 8.16.3 | MongoDB ODM |
| **JWT** | 9.0.2 | Authentication |
| **bcrypt** | 6.0.0 | Password Hashing |
| **Nodemailer** | 7.0.5 | Email Service |
| **Helmet** | 8.1.0 | Security Headers |
| **CORS** | 2.8.5 | Cross-Origin Handling |

### Database
| Technology | Purpose |
|------------|---------|
| **MongoDB** | NoSQL Document Database |
| **Mongoose** | Schema Validation & ODM |

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐    MongoDB    ┌─────────────────┐
│   React.js      │ ◄────────────────► │   Node.js       │ ◄──────────► │   MongoDB       │
│   Frontend      │    WebSocket       │   Backend       │              │   Database      │
│   (Port 5173)   │ ◄────────────────► │   (Port 5000)   │              │   (Port 27017)  │
└─────────────────┘                    └─────────────────┘              └─────────────────┘
```

### Three-Tier Architecture
- **Presentation Layer**: React.js with Tailwind CSS
- **Application Layer**: Node.js + Express.js + Socket.IO
- **Data Layer**: MongoDB with Mongoose ODM

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Janmenjay30/IIITCONNECT.git
   cd IIITCONNECT
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

#### Backend `.env` file
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/iiitconnect
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/iiitconnect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-digit-app-password

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

#### Frontend Configuration
Update `frontend/src/config.js`:

```javascript
export const API_BASE_URL = 'http://localhost:5000';
export const SOCKET_URL = 'http://localhost:5000';
```

### Setting Up Gmail for OTP Emails

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable **2-Step Verification**
3. Generate an **App Password**:
   - Go to Security → App Passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-digit password
4. Use this password in `EMAIL_APP_PASSWORD`

### Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

#### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "Verification code sent to your email!",
  "data": {
    "email": "john@example.com",
    "needsVerification": true
  }
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}

Response: 200 OK
{
  "success": true,
  "message": "Email verified successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "user": { ... }
}
```

### Project Endpoints

#### Get All Projects
```http
GET /api/projects

Response: 200 OK
{
  "projects": [...]
}
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "AI Chatbot",
  "description": "Building an intelligent chatbot using NLP",
  "requiredRoles": ["ML Engineer", "Backend Developer"],
  "tags": ["AI", "Python", "NLP"],
  "creatorRole": "Project Lead",
  "maxTeamSize": 5
}

Response: 201 Created
{
  "message": "Project created successfully",
  "project": { ... }
}
```

#### Get Project by ID
```http
GET /api/projects/:projectId

Response: 200 OK
{
  "_id": "...",
  "title": "AI Chatbot",
  "creator": { ... },
  "teamMembers": [...],
  "applications": [...]
}
```

#### Submit Application
```http
POST /api/projects/:projectId/applicants
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "areaOfExpertise": "Machine Learning",
  "description": "I have 2 years of experience in ML...",
  "skills": "Python, TensorFlow, PyTorch",
  "availability": "15 hours/week"
}

Response: 201 Created
```

#### Accept Application
```http
POST /api/projects/:projectId/accept-application
Authorization: Bearer <token>
Content-Type: application/json

{
  "applicationId": "...",
  "assignedRole": "ML Engineer"
}

Response: 200 OK
```

#### Get My Teams
```http
GET /api/projects/my-teams
Authorization: Bearer <token>

Response: 200 OK
{
  "teams": [...]
}
```

### Message Endpoints

#### Get Room Messages
```http
GET /api/messages/:roomId
Authorization: Bearer <token>

Response: 200 OK
{
  "messages": [...],
  "project": { ... }  // if project room
}
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/:userId

Response: 200 OK
{
  "user": { ... }
}
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Passionate developer",
  "skills": ["React", "Node.js", "MongoDB"]
}

Response: 200 OK
```

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed with bcrypt),
  profilePicture: String,
  skills: [String],
  bio: String,
  isEmailVerified: Boolean,
  accountStatus: String ('pending' | 'active' | 'suspended'),
  emailOTP: String,
  emailOTPExpires: Date,
  privateChats: [{
    partnerId: ObjectId (ref: 'User'),
    roomId: String
  }],
  createdAt: Date
}
```

### Projects Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  requiredRoles: [String],
  tags: [String],
  creator: ObjectId (ref: 'User', indexed),
  applications: [ObjectId] (ref: 'Applicant'),
  teamMembers: [{
    userId: ObjectId (ref: 'User'),
    role: String,
    joinedAt: Date,
    status: String ('active' | 'inactive')
  }],
  maxTeamSize: Number,
  currentTeamSize: Number,
  tasks: [{
    title: String,
    description: String,
    assignedTo: ObjectId (ref: 'User'),
    status: String ('pending' | 'in-progress' | 'completed'),
    priority: String ('low' | 'medium' | 'high'),
    dueDate: Date,
    createdBy: ObjectId (ref: 'User'),
    completedAt: Date
  }],
  projectStatus: String ('planning' | 'active' | 'completed' | 'on-hold'),
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  text: String,
  sender: ObjectId (ref: 'User'),
  room: String (indexed),
  participants: [ObjectId] (ref: 'User'),
  isSystemMessage: Boolean,
  createdAt: Date (indexed)
}
```

### Applicants Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  github: String,
  areaOfExpertise: String,
  description: String,
  skills: String,
  availability: String,
  projectId: ObjectId (ref: 'Project'),
  status: String ('pending' | 'accepted' | 'rejected'),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Real-time Features

### Socket.IO Events

#### Client → Server Events

**Connection**
```javascript
socket.connect({
  auth: {
    token: 'JWT_TOKEN'
  }
});
```

**Join Room**
```javascript
socket.emit('join room', 'project_123');
```

**Send Message**
```javascript
socket.emit('chat message', {
  text: 'Hello team!',
  room: 'project_123'
});
```

**Leave Room**
```javascript
socket.emit('leave room', 'project_123');
```

#### Server → Client Events

**Joined Room Confirmation**
```javascript
socket.on('joined room', (data) => {
  console.log('Joined room:', data.room);
});
```

**Receive Message**
```javascript
socket.on('chat message', (message) => {
  // message: { text, sender, room, createdAt }
  displayMessage(message);
});
```

**Error Handling**
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

### Room Naming Convention

| Room Type | Pattern | Example | Access |
|-----------|---------|---------|--------|
| Global Chat | `global` | `global` | All authenticated users |
| Announcements | `announcements` | `announcements` | All authenticated users |
| Project Chat | `project_<id>` | `project_abc123` | Project creator + team members |
| Private Chat | `private_<id1>_<id2>` | `private_user1_user2` | Two specific users only |

---

## 🔒 Security

### Authentication Security
- **Password Hashing**: bcrypt with 12 salt rounds (~150ms computation time)
- **JWT Tokens**: 7-day expiration with secret key
- **Email Verification**: Mandatory OTP verification before account activation
- **Token Validation**: Middleware on all protected routes

### API Security
- **CORS**: Whitelist-based origin validation
- **Helmet**: Security headers (XSS, Clickjacking protection)
- **Input Validation**: Mongoose schemas + express-validator
- **Rate Limiting**: Configurable request limits (future enhancement)

### WebSocket Security
- **Authentication**: JWT verification on Socket.IO connection
- **Room Authorization**: Database queries to verify access rights
- **User Attachment**: Authenticated user attached to socket object

### Data Security
- **NoSQL Injection Prevention**: Mongoose sanitization
- **Environment Variables**: Sensitive data in .env (not committed)
- **Error Handling**: Generic error messages in production

---

## 📁 Project Structure

```
IIITCONNECT/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── projectController.js  # Project CRUD
│   │   ├── userController.js     # User management
│   │   └── applicationController.js
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/
│   │   ├── user.js               # User schema
│   │   ├── project.js            # Project schema
│   │   ├── message.js            # Message schema
│   │   └── applicant.js          # Applicant schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── projectRoutes.js      # Project endpoints
│   │   ├── userRoutes.js         # User endpoints
│   │   ├── messageRoutes.js      # Message endpoints
│   │   └── applicantRoutes.js
│   ├── services/
│   │   └── emailService.js       # Nodemailer OTP
│   ├── socketIO/
│   │   └── setUpSocket.js        # Socket.IO config
│   ├── .env                      # Environment variables
│   ├── index.js                  # Server entry point
│   └── package.json
│
├── frontend/
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Homepage.jsx      # Landing page
│   │   │   ├── Login.jsx         # Login form
│   │   │   ├── Register.jsx      # Registration form
│   │   │   ├── OTPVerification.jsx
│   │   │   ├── Profile.jsx       # User profile
│   │   │   ├── CreateProjectPage.jsx
│   │   │   ├── ProjectCard.jsx   # Project display
│   │   │   ├── ProjectDetails.jsx
│   │   │   ├── YourProjects.jsx
│   │   │   ├── TeamManagementPage.jsx
│   │   │   ├── MyTeamsDashboard.jsx
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── ChatHub.jsx       # Chat room selector
│   │   │   ├── ChatPage.jsx      # Message display
│   │   │   ├── Navbar.jsx        # Navigation
│   │   │   ├── Layout.jsx        # Common layout
│   │   │   └── Modals/
│   │   │       ├── ApplicationsModals.jsx
│   │   │       └── AssignedRoleModal.jsx
│   │   ├── config/
│   │   │   └── api.js            # API configuration
│   │   ├── utils/
│   │   │   └── axios.js          # Axios instance
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # React entry point
│   │   └── config.js             # Frontend config
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── SystemDesign.md               # System architecture docs
└── README.md                     # This file
```

---

## 📸 Screenshots

### Authentication Flow
- Registration with email verification
- OTP-based account activation
- Secure login system

### Project Discovery
- Browse all available projects
- Filter by tags and skills
- View detailed project information

### Team Management
- Review applications
- Accept/reject candidates with role assignment
- Manage team members
- Track project tasks

### Real-time Chat
- Multi-room chat system
- Project-specific team chats
- Private messaging
- Message history

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Contact

**Janmenjay**
- GitHub: [@Janmenjay30](https://github.com/Janmenjay30)
- Project Repository: [IIITCONNECT](https://github.com/Janmenjay30/IIITCONNECT)

---

## 🙏 Acknowledgments

- IIIT for the inspiration
- MongoDB for excellent documentation
- Socket.IO team for real-time capabilities
- React and Vite communities
- All contributors and testers

---

## 🚀 Future Enhancements

- [ ] File upload support (profile pictures, project files)
- [ ] Push notifications for applications and messages
- [ ] Advanced search and filtering
- [ ] Project analytics dashboard
- [ ] Calendar integration for deadlines
- [ ] Video conferencing integration
- [ ] Mobile application (React Native)
- [ ] CI/CD pipeline setup
- [ ] Docker containerization
- [ ] Unit and integration tests
- [ ] Rate limiting implementation
- [ ] Redis caching layer

---

<div align="center">

**Made with ❤️ for the IIIT Community**

⭐ Star this repo if you find it helpful!

</div>
