# IIITConnect - Full Stack Project Collaboration Platform
**System Design & Technical Documentation**

---

## 1. Project Overview

**IIITConnect** is a comprehensive full-stack web application designed to facilitate project collaboration among IIIT students. The platform enables students to discover projects, form teams, manage tasks, and communicate in real-time through an integrated chat system.

-   **Frontend URL:** `http://localhost:5173`
-   **Backend API URL:** `http://localhost:5000`
-   **Database:** MongoDB (Local or Atlas)

---

## 2. System Architecture

The application follows a **3-tier architecture** with a clear separation of concerns between the client, server, and database.

### 2.1. High-Level Diagram

```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐    MongoDB    ┌─────────────────┐
│   React.js      │ ◄────────────────► │   Node.js       │ ◄──────────► │   MongoDB       │
│   Frontend      │    WebSocket       │   Backend       │              │   Database      │
│   (Port 5173)   │ ◄────────────────► │   (Port 5000)   │              │   (Port 27017)  │
└─────────────────┘                    └─────────────────┘              └─────────────────┘
```

### 2.2. Technology Stack

| Layer      | Technology                                                                                             |
| :--------- | :----------------------------------------------------------------------------------------------------- |
| **Frontend** | React.js 18, React Router DOM, Tailwind CSS, Axios, Socket.IO Client, Vite                               |
| **Backend**  | Node.js, Express.js, Socket.IO, MongoDB, Mongoose, JSON Web Token (JWT), bcrypt.js, CORS                |
| **Database** | MongoDB (NoSQL)                                                                                        |
| **Tools**    | Git, VS Code, Postman, npm                                                                             |

---

## 3. Core Features

-   **User Authentication:** Secure registration and login using JWT.
-   **Profile Management:** Users can manage their profiles, skills, and interests.
-   **Project Discovery:** A central hub to explore, search, and filter projects.
-   **Team Management:** Project creators can manage team members and review applications.
-   **Real-time Chat:** A multi-room chat system for global, project, and private conversations.
-   **Personalized Dashboard:** A central view for users to see their projects, teams, and recent activity.

---

## 4. Database Schema Design

### 4.1. `users` Collection

Stores user information, credentials, and relationships.

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  skills: [String],
  privateChats: [{
    partnerId: ObjectId (ref: 'User'),
    lastMessageAt: Date
  }],
  createdAt: Date
}
```

### 4.2. `projects` Collection

Stores all project-related data.

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  techStack: [String],
  creator: ObjectId (ref: 'User', indexed),
  teamMembers: [{
    userId: ObjectId (ref: 'User'),
    role: String,
    status: String // 'active', 'pending'
  }],
  maxTeamSize: Number,
  status: String, // 'active', 'completed'
  createdAt: Date
}
```

### 4.3. `messages` Collection

Stores all chat messages for every room.

```javascript
{
  _id: ObjectId,
  text: String,
  sender: ObjectId (ref: 'User'),
  room: String (indexed), // e.g., 'global', 'project_123', 'private_user1_user2'
  isSystemMessage: Boolean,
  createdAt: Date (indexed)
}
```

---

## 5. API Endpoints (RESTful)

### 5.1. Authentication (`/api/auth`)

-   `POST /register`: Register a new user.
-   `POST /login`: Log in and receive a JWT.
-   `GET /profile`: Get the current authenticated user's profile.

### 5.2. Projects (`/api/projects`)

-   `GET /`: Get a list of all projects.
-   `POST /`: Create a new project.
-   `GET /:id`: Get details for a specific project.
-   `PUT /:id`: Update a project.
-   `DELETE /:id`: Delete a project.

### 5.3. Users & Chat (`/api/users`)

-   `GET /search`: Search for users by name or email.
-   `GET /my-teams`: Get all projects a user is a member of.
-   `POST /private-chats`: Initiate a new private chat.
-   `GET /private-chats`: Get a list of the user's private conversations.

---

## 6. Real-time Communication (WebSockets)

The chat system is built using **Socket.IO**.

### 6.1. Socket Events

-   **Connection:** A user connects to the socket server upon logging in.
-   **Authentication:** The socket connection is authenticated using the JWT token.
-   `join_room`: A user joins a specific chat room (e.g., `project_123`).
-   `chat_message`: A user sends a message to a room. The server receives it, saves it to the database, and broadcasts it to all other clients in that room.
-   `disconnect`: A user disconnects.

### 6.2. Room Naming Convention

-   **Global Chat:** `global`
-   **Announcements:** `announcements`
-   **Project Chat:** `project_<projectId>`
-   **Private Chat:** `private_<userId1>_<userId2>` (User IDs are sorted alphabetically to ensure a consistent room name).

---

## 7. Security Implementation

-   **Authentication:** Passwords are hashed using **bcrypt**. API routes are protected using JWT middleware, ensuring only authenticated users can access them.
-   **Authorization:** Logic on the backend ensures that only project creators can manage their teams and only team members can access project chats.
-   **Input Validation:** Mongoose schemas provide basic validation. Additional server-side checks prevent invalid data from being processed.
-   **CORS:** The backend is configured to only accept requests from the frontend's origin (`http://localhost:5173`).
-   **Environment Variables:** Sensitive information like database connection strings and JWT secrets are stored in a `.env` file and are not hardcoded.

---

## 8. Code Structure

### 8.1. Frontend (`/frontend/src`)

```
/components/  # Reusable React components (ChatHub, ProjectDetails, etc.)
/utils/       # Utility functions (axios.js for API calls)
/config/      # Configuration files
App.jsx       # Main application component with routing
```

### 8.2. Backend (`/backend`)

```
/models/      # Mongoose schemas (user.js, project.js, etc.)
/routes/      # API route definitions (authRoutes.js, projectRoutes.js)
/middleware/  # Custom middleware (authMiddleware.js)
/config/      # Database connection config
index.js      # Main server entry point with Express and Socket.IO setup
```

---

## 9. Future Enhancements

-   **Testing:** Implement unit and integration tests using a framework like Jest.
-   **File Uploads:** Allow users to upload profile pictures and project-related files.
-   **Notifications:** Implement a real-time notification system for applications and messages.
-   **CI/CD:** Set up a continuous integration and deployment pipeline.
-   **Containerization:** Dockerize the application for easier deployment
