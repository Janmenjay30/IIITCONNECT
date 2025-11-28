# Task Management Testing Guide

## Prerequisites
1. ✅ Backend server running on `http://localhost:5000`
2. ✅ MongoDB connected
3. ✅ Email credentials configured in `.env`
4. ✅ At least one project with team members
5. ✅ Valid JWT token for authentication

---

## Quick Test Steps

### Step 1: Get Your Project ID and Team Member IDs

**Get your projects:**
```bash
# Using curl (PowerShell)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/projects/by-creator
```

**Get team members:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/projects/YOUR_PROJECT_ID/team
```

Copy the user IDs of team members you want to assign tasks to.

---

### Step 2: Create and Assign a Task

**Request:**
```bash
curl -X POST http://localhost:5000/api/projects/YOUR_PROJECT_ID/tasks `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "title": "Test Task - Setup Database",
    "description": "Configure MongoDB connection and create initial schemas",
    "assignedTo": "USER_ID_HERE",
    "dueDate": "2025-12-15",
    "priority": "high"
  }'
```

**Expected Response:**
```json
{
  "message": "Task created successfully",
  "task": {
    "_id": "...",
    "title": "Test Task - Setup Database",
    "description": "Configure MongoDB connection and create initial schemas",
    "assignedTo": "USER_ID_HERE",
    "status": "pending",
    "priority": "high",
    "dueDate": "2025-12-15T00:00:00.000Z",
    "createdBy": "YOUR_USER_ID",
    "createdAt": "2025-11-27T..."
  },
  "emailSent": true,
  "chatNotified": true
}
```

**What to Verify:**
- [ ] Response shows `emailSent: true`
- [ ] Response shows `chatNotified: true`
- [ ] Check assigned user's email inbox for task notification
- [ ] Open project chat to see system message about task assignment
- [ ] Backend logs show: `✅ Task assignment email sent to: user@example.com`
- [ ] Backend logs show: `✅ Task notification sent to room: project_XXX`

---

### Step 3: Get All Tasks for the Project

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/projects/YOUR_PROJECT_ID/tasks
```

**Expected Response:**
```json
{
  "projectId": "...",
  "projectTitle": "Your Project Name",
  "tasks": [
    {
      "_id": "...",
      "title": "Test Task - Setup Database",
      "description": "Configure MongoDB connection...",
      "assignedTo": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "pending",
      "priority": "high",
      "dueDate": "2025-12-15T00:00:00.000Z",
      "createdBy": {
        "_id": "...",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdAt": "..."
    }
  ]
}
```

---

### Step 4: Update Task Status

**Mark task as in-progress:**
```bash
curl -X PUT http://localhost:5000/api/projects/YOUR_PROJECT_ID/tasks/TASK_ID/status `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"status": "in-progress"}'
```

**Expected Response:**
```json
{
  "message": "Task status updated successfully",
  "task": {
    "_id": "...",
    "title": "Test Task - Setup Database",
    "status": "in-progress",
    ...
  }
}
```

**What to Verify:**
- [ ] Check project chat for status update system message: "🔄 Task Status Updated!"
- [ ] All connected team members see the notification in real-time

**Mark task as completed:**
```bash
curl -X PUT http://localhost:5000/api/projects/YOUR_PROJECT_ID/tasks/TASK_ID/status `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"status": "completed"}'
```

**What to Verify:**
- [ ] Check project chat for completion message: "✅ Task Status Updated!"
- [ ] Task now has `completedAt` timestamp

---

### Step 5: Delete a Task

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/projects/YOUR_PROJECT_ID/tasks/TASK_ID `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Task deleted successfully"
}
```

**What to Verify:**
- [ ] Check project chat for deletion message: "🗑️ Task Deleted"
- [ ] Task no longer appears in task list

---

## Full Integration Test

### Test Scenario: Complete Task Lifecycle

1. **Login as project creator** → Get JWT token
2. **Get project ID and team member IDs**
3. **Create 3 tasks:**
   - High priority task assigned to Member A
   - Medium priority task assigned to Member B
   - Low priority unassigned task

4. **Verify emails:**
   - Member A receives email for high priority task
   - Member B receives email for medium priority task
   - No email for unassigned task

5. **Check team chat:**
   - 3 system messages appear (one for each task)
   - Messages show correct priority and assignee

6. **Login as Member A** → Get their JWT token

7. **Update status of their assigned task:**
   - Change to "in-progress"
   - Verify chat notification

8. **Try to update Member B's task** (should fail with 403)

9. **Login back as project creator**

10. **Complete Member A's task:**
    - Update status to "completed"
    - Verify `completedAt` is set

11. **Delete the unassigned task:**
    - Verify deletion notification in chat

---

## Email Verification Checklist

When you receive a task assignment email, verify:

- [ ] **Subject:** "📋 New Task Assigned: [Task Title] - [Project Title]"
- [ ] **Header:** Professional gradient design with task icon
- [ ] **Task Details Box:** Contains title, description
- [ ] **Priority Badge:** Color-coded (🔴 Red for high, 🟡 Yellow for medium, 🟢 Green for low)
- [ ] **Due Date:** Formatted as "Friday, December 15, 2025" (not ISO string)
- [ ] **Assigned By:** Shows name of person who created the task
- [ ] **Action Button:** "View Task in Project" links to project page
- [ ] **Footer:** IIITConnect branding and disclaimer
- [ ] **Plain Text Version:** Available for non-HTML email clients

---

## Chat Message Verification

### Task Assignment Message Format:
```
📋 New Task Assigned!

Task: [Task Title]
Assigned to: [Member Name]
Priority: [priority]
Due: [formatted date or "No deadline"]
```

### Status Update Message Format:
```
[Emoji] Task Status Updated!

Task: [Task Title]
New Status: [STATUS]
Updated by: [User Name]
```

Where emoji is:
- ✅ for completed
- 🔄 for in-progress
- 📝 for pending

### Deletion Message Format:
```
🗑️ Task Deleted

Task: [Task Title]
Deleted by: [User Name]
```

---

## Common Testing Issues

### ❌ Email not received
**Check:**
1. Spam/junk folder
2. Email credentials in `.env`
3. Backend logs for email errors
4. Gmail app password is valid

**Debug:**
```javascript
// In backend logs, look for:
✅ Task assignment email sent successfully to: user@example.com
// OR
❌ Failed to send task assignment email: [error]
```

### ❌ Chat message not appearing
**Check:**
1. Socket.IO connection is active
2. User is connected to the project room
3. Browser console for WebSocket errors

**Debug:**
```javascript
// In browser console:
socket.on('chat message', (msg) => {
  console.log('Received message:', msg);
});
```

### ❌ 403 Forbidden when creating task
**Check:**
1. You are the project creator (team lead)
2. JWT token is valid
3. Using correct project ID

### ❌ 400 Cannot assign to non-member
**Check:**
1. User ID is correct
2. User is actually a team member
3. Get team list to verify member IDs

---

## Performance Testing

### Load Test: Multiple Tasks

Create 10 tasks rapidly:

```bash
# Create a loop to test concurrent task creation
for ($i=1; $i -le 10; $i++) {
  curl -X POST http://localhost:5000/api/projects/YOUR_PROJECT_ID/tasks `
    -H "Authorization: Bearer YOUR_JWT_TOKEN" `
    -H "Content-Type: application/json" `
    -d "{
      \"title\": \"Load Test Task $i\",
      \"description\": \"Testing task creation performance\",
      \"priority\": \"medium\"
    }"
  
  Start-Sleep -Milliseconds 100
}
```

**Verify:**
- [ ] All 10 tasks created successfully
- [ ] No duplicate system messages in chat
- [ ] Backend handles concurrent requests
- [ ] No database errors

---

## Postman Collection

Import this JSON into Postman for easy testing:

```json
{
  "info": {
    "name": "IIITConnect Task Management",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Task",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Sample Task\",\n  \"description\": \"Task description here\",\n  \"assignedTo\": \"{{userId}}\",\n  \"dueDate\": \"2025-12-31\",\n  \"priority\": \"high\"\n}"
        },
        "url": "http://localhost:5000/api/projects/{{projectId}}/tasks"
      }
    },
    {
      "name": "Get All Tasks",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "http://localhost:5000/api/projects/{{projectId}}/tasks"
      }
    },
    {
      "name": "Update Task Status",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"status\": \"in-progress\"\n}"
        },
        "url": "http://localhost:5000/api/projects/{{projectId}}/tasks/{{taskId}}/status"
      }
    },
    {
      "name": "Delete Task",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "http://localhost:5000/api/projects/{{projectId}}/tasks/{{taskId}}"
      }
    }
  ],
  "variable": [
    {
      "key": "token",
      "value": "YOUR_JWT_TOKEN"
    },
    {
      "key": "projectId",
      "value": "YOUR_PROJECT_ID"
    },
    {
      "key": "userId",
      "value": "USER_ID_TO_ASSIGN"
    },
    {
      "key": "taskId",
      "value": "TASK_ID"
    }
  ]
}
```

---

## Success Criteria

Your implementation is working correctly when:

✅ **Task Creation:**
- Task is saved to database with all fields
- Assigned user receives styled email
- System message appears in team chat
- All connected clients see notification instantly

✅ **Task Status Updates:**
- Status changes persist in database
- System message with appropriate emoji appears
- Only authorized users can update (assignee or creator)

✅ **Task Deletion:**
- Task removed from project
- Deletion notification in chat
- Only creator can delete

✅ **Security:**
- Non-team-leads cannot create tasks (403)
- Cannot assign to non-members (400)
- Cannot update others' tasks unless creator (403)

✅ **Error Handling:**
- Task creation succeeds even if email fails
- Chat notification failure doesn't break request
- Clear error messages for validation failures

---

Happy testing! 🚀
