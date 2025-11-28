# Task Management API Documentation

## Overview
The Task Management feature allows project team leads (creators) to assign tasks to team members, send email notifications, and broadcast task updates to the team chat.

---

## API Endpoints

### 1. Create and Assign Task

**Endpoint:** `POST /api/projects/:projectId/tasks`

**Authentication:** Required (JWT Token)

**Authorization:** Only project creator (team lead) can create tasks

**Request Body:**
```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication with email verification",
  "assignedTo": "user_id_here",
  "dueDate": "2025-12-15",
  "priority": "high"
}
```

**Required Fields:**
- `title` (string): Task title

**Optional Fields:**
- `description` (string): Detailed task description
- `assignedTo` (string): User ID of team member to assign the task to
- `dueDate` (string): ISO date string for task deadline
- `priority` (string): One of `'low'`, `'medium'`, `'high'` (default: `'medium'`)

**Response (Success - 201):**
```json
{
  "message": "Task created successfully",
  "task": {
    "_id": "task_id",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication with email verification",
    "assignedTo": "user_id_here",
    "status": "pending",
    "priority": "high",
    "dueDate": "2025-12-15T00:00:00.000Z",
    "createdBy": "creator_id",
    "createdAt": "2025-11-27T10:30:00.000Z"
  },
  "emailSent": true,
  "chatNotified": true
}
```

**What Happens:**
1. ✅ Task is created in the project
2. 📧 Email notification sent to assigned team member
3. 💬 System message posted to project team chat
4. 🔔 All team members in the chat see the task assignment

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid data
- `403 Forbidden`: User is not the project creator
- `404 Not Found`: Project or assigned user not found

---

### 2. Get All Tasks for a Project

**Endpoint:** `GET /api/projects/:projectId/tasks`

**Authentication:** Required (JWT Token)

**Response (Success - 200):**
```json
{
  "projectId": "project_id",
  "projectTitle": "AI Chatbot Project",
  "tasks": [
    {
      "_id": "task_id_1",
      "title": "Setup MongoDB database",
      "description": "Configure database schema and connections",
      "assignedTo": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "profilePicture": "url"
      },
      "status": "completed",
      "priority": "high",
      "dueDate": "2025-11-20T00:00:00.000Z",
      "createdBy": {
        "_id": "creator_id",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdAt": "2025-11-15T08:00:00.000Z",
      "completedAt": "2025-11-19T14:30:00.000Z"
    },
    {
      "_id": "task_id_2",
      "title": "Design landing page",
      "description": "Create wireframes and mockups",
      "assignedTo": null,
      "status": "pending",
      "priority": "medium",
      "dueDate": null,
      "createdBy": {
        "_id": "creator_id",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdAt": "2025-11-27T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Update Task Status

**Endpoint:** `PUT /api/projects/:projectId/tasks/:taskId/status`

**Authentication:** Required (JWT Token)

**Authorization:** Task assignee OR project creator

**Request Body:**
```json
{
  "status": "in-progress"
}
```

**Valid Status Values:**
- `pending`: Task not started yet
- `in-progress`: Task currently being worked on
- `completed`: Task finished

**Response (Success - 200):**
```json
{
  "message": "Task status updated successfully",
  "task": {
    "_id": "task_id",
    "title": "Implement user authentication",
    "status": "in-progress",
    "assignedTo": "user_id",
    "priority": "high",
    "createdAt": "2025-11-27T10:30:00.000Z"
  }
}
```

**What Happens:**
1. ✅ Task status is updated
2. 💬 System message posted to team chat announcing the status change
3. ⏰ If status is `'completed'`, `completedAt` timestamp is set

**Error Responses:**
- `400 Bad Request`: Invalid status value
- `403 Forbidden`: User not authorized to update this task
- `404 Not Found`: Project or task not found

---

### 4. Delete Task

**Endpoint:** `DELETE /api/projects/:projectId/tasks/:taskId`

**Authentication:** Required (JWT Token)

**Authorization:** Only project creator can delete tasks

**Response (Success - 200):**
```json
{
  "message": "Task deleted successfully"
}
```

**What Happens:**
1. ✅ Task is removed from the project
2. 💬 System message posted to team chat announcing task deletion

**Error Responses:**
- `403 Forbidden`: User is not the project creator
- `404 Not Found`: Project or task not found

---

## Email Notification Details

When a task is assigned to a team member, they receive a styled HTML email with:

**Email Contents:**
- 📋 Task title and description
- 🎯 Priority level (with color coding)
- 📅 Due date (formatted)
- 👤 Name of person who assigned the task
- 🔗 Direct link to the project
- 💡 Tips for task management

**Email Design:**
- Professional gradient header
- Color-coded priority badges (🟢 Low, 🟡 Medium, 🔴 High)
- Responsive design
- Plain text fallback for email clients that don't support HTML

---

## Team Chat Notifications

### Task Assignment Message
```
📋 New Task Assigned!

Task: Implement user authentication
Assigned to: John Doe
Priority: high
Due: December 15, 2025
```

### Task Status Update Message
```
🔄 Task Status Updated!

Task: Implement user authentication
New Status: IN-PROGRESS
Updated by: John Doe
```

### Task Deletion Message
```
🗑️ Task Deleted

Task: Implement user authentication
Deleted by: Jane Smith
```

**Message Features:**
- Appears as system messages (styled differently from regular chat)
- Automatically broadcast to all connected team members
- Saved in message history for offline members

---

## Frontend Integration Example

### Create Task
```javascript
const createTask = async (projectId, taskData) => {
  try {
    const response = await axiosInstance.post(
      `/api/projects/${projectId}/tasks`,
      {
        title: taskData.title,
        description: taskData.description,
        assignedTo: taskData.assignedTo, // User ID
        dueDate: taskData.dueDate,
        priority: taskData.priority
      }
    );
    
    toast.success('Task created and assigned successfully!');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create task');
    throw error;
  }
};
```

### Update Task Status
```javascript
const updateTaskStatus = async (projectId, taskId, newStatus) => {
  try {
    const response = await axiosInstance.put(
      `/api/projects/${projectId}/tasks/${taskId}/status`,
      { status: newStatus }
    );
    
    toast.success(`Task marked as ${newStatus}!`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update task');
    throw error;
  }
};
```

### Get Project Tasks
```javascript
const getProjectTasks = async (projectId) => {
  try {
    const response = await axiosInstance.get(
      `/api/projects/${projectId}/tasks`
    );
    
    return response.data.tasks;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
};
```

---

## Security & Permissions

**Task Creation:**
- ✅ Only project creator (team lead) can create tasks
- ✅ Cannot assign tasks to users outside the team
- ✅ Validates all input fields

**Task Status Update:**
- ✅ Task assignee can update their own tasks
- ✅ Project creator can update any task
- ✅ Team members cannot update tasks assigned to others

**Task Deletion:**
- ✅ Only project creator can delete tasks
- ✅ Deletion is permanent (consider soft delete for production)

**Email Notifications:**
- ✅ Only sent when a task is assigned to someone
- ✅ Uses authenticated SMTP with app passwords
- ✅ Graceful failure - task creation succeeds even if email fails

**Chat Notifications:**
- ✅ Only visible to project team members
- ✅ Access controlled by room authorization
- ✅ System messages clearly distinguished from user messages

---

## Testing the Feature

### Using Postman/Thunder Client

**1. Create a Task:**
```
POST http://localhost:5000/api/projects/YOUR_PROJECT_ID/tasks
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "title": "Test Task",
  "description": "This is a test task assignment",
  "assignedTo": "USER_ID_TO_ASSIGN",
  "dueDate": "2025-12-01",
  "priority": "high"
}
```

**2. Get All Tasks:**
```
GET http://localhost:5000/api/projects/YOUR_PROJECT_ID/tasks
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

**3. Update Task Status:**
```
PUT http://localhost:5000/api/projects/YOUR_PROJECT_ID/tasks/TASK_ID/status
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "status": "in-progress"
}
```

**4. Delete Task:**
```
DELETE http://localhost:5000/api/projects/YOUR_PROJECT_ID/tasks/TASK_ID
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Expected Behavior Checklist

When you create and assign a task, verify:

- [ ] Task appears in project's tasks array
- [ ] Assigned user receives an email notification
- [ ] System message appears in project team chat
- [ ] All connected team members see the chat notification in real-time
- [ ] Task includes all provided details (title, description, priority, due date)
- [ ] Task status defaults to 'pending'
- [ ] `createdBy` is set to current user
- [ ] Email contains correct task details and formatted properly
- [ ] Chat message includes emoji and formatted text

When you update a task status:

- [ ] Task status changes in database
- [ ] System message appears in team chat
- [ ] If marked 'completed', `completedAt` timestamp is set
- [ ] Chat notification includes status emoji (✅, 🔄, 📝)

When you delete a task:

- [ ] Task is removed from project
- [ ] System message appears in team chat
- [ ] Deletion notification includes task title

---

## Common Issues & Solutions

**Issue: Email not sending**
- ✅ Check `EMAIL_USER` and `EMAIL_APP_PASSWORD` in `.env`
- ✅ Verify Gmail 2FA is enabled and app password is generated
- ✅ Check email service logs in terminal
- ✅ Task creation still succeeds even if email fails

**Issue: Chat notification not appearing**
- ✅ Ensure Socket.IO connection is active
- ✅ Verify user is in the project chat room
- ✅ Check browser console for Socket.IO errors
- ✅ Refresh page to reload messages

**Issue: Cannot assign task (403 error)**
- ✅ Verify you are the project creator
- ✅ Check JWT token is valid and not expired
- ✅ Ensure you're using the correct project ID

**Issue: Cannot update task status**
- ✅ Verify you are assigned to the task OR are the project creator
- ✅ Check status value is one of: 'pending', 'in-progress', 'completed'
- ✅ Ensure task ID and project ID are correct

---

## Future Enhancements

Potential improvements for this feature:

1. **Task Comments**: Allow team members to comment on tasks
2. **File Attachments**: Upload files related to tasks
3. **Subtasks**: Break down tasks into smaller items
4. **Task Templates**: Pre-defined task structures
5. **Time Tracking**: Log hours spent on tasks
6. **Task Dependencies**: Mark tasks that depend on others
7. **Recurring Tasks**: Auto-create tasks on schedule
8. **Task Labels/Tags**: Categorize tasks with custom labels
9. **Activity Timeline**: Visual history of all task changes
10. **Slack/Discord Integration**: Send notifications to external platforms
11. **Mobile Push Notifications**: Alert users on their phones
12. **Gantt Chart View**: Visualize task timelines
13. **Task Assignment Approval**: Assignee can accept/decline
14. **Task Reminders**: Email reminders before due dates

---

## Summary

The Task Management feature provides:

✅ **Easy Task Assignment**: Team leads can quickly assign work to members  
✅ **Email Notifications**: Automatic emails with task details  
✅ **Real-time Updates**: Team chat integration for instant visibility  
✅ **Status Tracking**: Monitor task progress (pending → in-progress → completed)  
✅ **Secure & Validated**: Permission checks and input validation  
✅ **Professional Communication**: Styled emails and formatted chat messages  

This feature enhances team collaboration by keeping everyone informed and organized! 🚀
