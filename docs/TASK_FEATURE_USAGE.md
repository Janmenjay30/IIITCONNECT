# How to Use the Task Assignment Feature

## 🎯 Where to Find Task Management

The task management feature is now integrated into **two places** in the frontend:

### 1. **Project Details Page** (`/projects/:projectId`)
- **Location:** At the bottom of the project details page
- **Who can see it:** Project creator (team lead) AND all team members
- **What you can do:**
  - **Team Lead:** Create tasks, assign to members, delete tasks
  - **Team Members:** View tasks, update status of assigned tasks

### 2. **Team Management Page** (`/projects/:projectId/team`)
- **Location:** Below the team member list
- **Who can see it:** Project creator (team lead) AND all team members
- **What you can do:**
  - Same as Project Details page

---

## 📝 Step-by-Step Guide

### For Team Leads (Project Creators):

#### **Step 1: Navigate to Your Project**
1. Go to homepage
2. Click on any project you created
3. Scroll down to see the "📋 Tasks" section

#### **Step 2: Create a Task**
1. Click the **"+ Create Task"** button
2. Fill in the modal form:
   - **Task Title** (required) - e.g., "Setup MongoDB database"
   - **Description** (optional) - e.g., "Configure connection and create schemas"
   - **Assign To** (optional) - Select a team member from the dropdown
   - **Priority** (required) - Choose Low 🟢, Medium 🟡, or High 🔴
   - **Due Date** (optional) - Select a deadline
3. Click **"Create Task"**

#### **Step 3: What Happens Next**
When you create and assign a task:
- ✅ Task appears in the task list immediately
- 📧 Assigned member receives a styled email notification
- 💬 System message is posted to project team chat
- 🔔 All connected team members see the notification in real-time

#### **Step 4: Manage Tasks**
- **Update Status:** Click "Start" or "Complete" buttons
- **Delete Task:** Click the 🗑️ icon (only team leads can delete)
- **View All Tasks:** Scroll through the task list

---

### For Team Members:

#### **Step 1: View Your Tasks**
1. Go to a project you're part of (click from "My Teams" or homepage)
2. Scroll down to see the "📋 Tasks" section
3. Look for tasks with your name: "Assigned to: **Your Name** (You)"

#### **Step 2: Update Task Status**
When you see a task assigned to you:
1. Click **"Start"** to mark it as in-progress (if status is pending)
2. Click **"Complete"** to mark it as done (if status is in-progress)

#### **Step 3: Check Your Email**
- You'll receive an email when a task is assigned to you
- Email includes:
  - Task title and description
  - Priority level (color-coded)
  - Due date
  - Direct link to the project

---

## 🎨 Visual Guide

### Task List View:
```
┌─────────────────────────────────────────────┐
│  📋 Tasks                  [+ Create Task]  │
├─────────────────────────────────────────────┤
│  Setup MongoDB Database                   🗑│
│  Configure connection and create schemas    │
│  🔴 HIGH   📝 PENDING   📅 Due: Dec 15     │
│  Assigned to: John Doe (You)               │
│                            [Start] [Complete]│
├─────────────────────────────────────────────┤
│  Design Landing Page                        │
│  Create wireframes and mockups              │
│  🟡 MEDIUM   🔄 IN-PROGRESS                 │
│  Assigned to: Jane Smith                    │
└─────────────────────────────────────────────┘
```

### Create Task Modal:
```
┌─────────────────────────────────────┐
│   Create New Task                   │
├─────────────────────────────────────┤
│  Task Title *                       │
│  [_____________________________]    │
│                                     │
│  Description                        │
│  [_____________________________]    │
│  [_____________________________]    │
│                                     │
│  Assign To                          │
│  [-- Unassigned -- ▼]              │
│                                     │
│  Priority                           │
│  [🟡 Medium ▼]                      │
│                                     │
│  Due Date                           │
│  [Calendar picker]                  │
│                                     │
│  [Create Task]  [Cancel]            │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start Example

### Example: Creating Your First Task

1. **Login** to your account
2. **Navigate** to a project you created
3. **Scroll down** to the Tasks section
4. **Click** "+ Create Task"
5. **Fill in:**
   ```
   Title: Implement user authentication
   Description: Add JWT-based auth with email verification
   Assign To: [Select team member]
   Priority: High
   Due Date: December 31, 2025
   ```
6. **Click** "Create Task"
7. **Check:**
   - ✅ Task appears in list
   - 📧 Team member receives email
   - 💬 Check project chat for notification

---

## 💡 Tips & Tricks

### For Team Leads:
- **Create unassigned tasks** (leave "Assign To" empty) for general project todos
- **Use priorities** to help team focus on important work:
  - 🔴 **High**: Blockers, critical features
  - 🟡 **Medium**: Normal features, improvements
  - 🟢 **Low**: Nice-to-haves, cleanup tasks
- **Set realistic due dates** to avoid rushing
- **Update task descriptions** if requirements change
- **Check team chat** to see when tasks are completed

### For Team Members:
- **Update status regularly** so the team knows your progress
- **Start tasks** as soon as you begin working
- **Mark complete** when fully done and tested
- **Check your email** for new assignments
- **Ask in team chat** if task requirements are unclear

---

## 🔍 Where to Find Tasks

### Navigation Paths:

**Path 1: From Homepage**
```
Homepage → Click Project Card → Scroll down → Tasks Section
```

**Path 2: From Your Projects**
```
Your Projects → Click Project → Scroll down → Tasks Section
```

**Path 3: From Team Management**
```
Project Page → "Manage Team" button → Scroll down → Tasks Section
```

**Path 4: From My Teams**
```
My Teams → Click Project Card → Scroll down → Tasks Section
```

---

## ✨ Features Overview

### What Team Leads Can Do:
- ✅ Create new tasks
- ✅ Assign tasks to team members
- ✅ Update task status (any task)
- ✅ Delete tasks
- ✅ Set priority and due dates
- ✅ See all project tasks

### What Team Members Can Do:
- ✅ View all project tasks
- ✅ Update status of their assigned tasks
- ✅ See who created each task
- ✅ Receive email notifications
- ✅ See task updates in chat

### What Everyone Gets:
- 📧 Email notifications (when assigned)
- 💬 Real-time chat notifications
- 📊 Visual task status (pending, in-progress, completed)
- 🎨 Color-coded priorities
- 📅 Due date tracking

---

## 🎯 Task Workflow

```
┌─────────────────────────────────────────────────────┐
│  1. Team Lead Creates Task                          │
│     ↓                                                │
│  2. (Optional) Assign to Team Member                │
│     ↓                                                │
│  3. Email Sent + Chat Notification                  │
│     ↓                                                │
│  4. Team Member Receives Notification               │
│     ↓                                                │
│  5. Team Member Clicks "Start"                      │
│     ↓   (Status: Pending → In-Progress)             │
│  6. Team Member Works on Task                       │
│     ↓                                                │
│  7. Team Member Clicks "Complete"                   │
│     ↓   (Status: In-Progress → Completed)           │
│  8. Team Sees Completion Notification in Chat       │
└─────────────────────────────────────────────────────┘
```

---

## 🔔 Notification Examples

### Email Subject:
```
📋 New Task Assigned: Implement user authentication - AI Chatbot Project
```

### Chat Notifications:

**Task Assignment:**
```
📋 New Task Assigned!

Task: Implement user authentication
Assigned to: John Doe
Priority: high
Due: December 15, 2025
```

**Status Update:**
```
🔄 Task Status Updated!

Task: Implement user authentication
New Status: IN-PROGRESS
Updated by: John Doe
```

**Task Completion:**
```
✅ Task Status Updated!

Task: Implement user authentication
New Status: COMPLETED
Updated by: John Doe
```

---

## 🎓 Best Practices

1. **Be Specific in Titles**
   - ❌ "Fix bugs"
   - ✅ "Fix login validation bug on signup form"

2. **Add Context in Descriptions**
   - Include requirements, acceptance criteria, or links to resources

3. **Assign Thoughtfully**
   - Match tasks to team members' skills
   - Don't overload one person

4. **Use Priorities Correctly**
   - Not everything can be high priority
   - Reserve 🔴 High for truly urgent/blocking work

5. **Set Realistic Deadlines**
   - Allow buffer time for testing/reviews
   - Communicate with team if dates are tight

6. **Update Status Promptly**
   - Keep team informed of your progress
   - Prevents duplicate work

---

## 🐛 Troubleshooting

**Q: I don't see the "Create Task" button**
- ✅ Check if you're the project creator (team lead)
- ✅ Only team leads can create tasks

**Q: I can't update a task status**
- ✅ You can only update tasks assigned to you
- ✅ Or if you're the project creator

**Q: Email notification not received**
- ✅ Check spam/junk folder
- ✅ Verify email credentials are configured in backend
- ✅ Task is still created even if email fails

**Q: Chat notification not appearing**
- ✅ Refresh the page
- ✅ Ensure you're connected to Socket.IO
- ✅ Check browser console for errors

**Q: Can't assign task to someone**
- ✅ They must be a team member first
- ✅ Check the team member list

---

## 🎉 Success!

You now have a fully functional task management system integrated into your project! 

**Next Steps:**
1. Start your backend server
2. Start your frontend server
3. Login to your account
4. Navigate to one of your projects
5. Scroll down and start creating tasks!

Happy collaborating! 🚀
