# 🚀 Quick Reference: Task Assignment Feature

## Where to Find It

**Project Details Page:**
```
Navigate: Homepage → Click Project → Scroll Down
Look for: 📋 Tasks section at the bottom
```

**Team Management Page:**
```
Navigate: Project → "Manage Team" button → Scroll Down
Look for: 📋 Tasks section below team list
```

---

## Creating a Task (Team Lead Only)

1. Click **"+ Create Task"** button
2. Fill the form:
   - Title (required)
   - Description (optional)
   - Assign To (optional - select team member)
   - Priority (Low/Medium/High)
   - Due Date (optional)
3. Click **"Create Task"**

**Result:** Task created + Email sent + Chat notification

---

## Updating Task Status

**If you're the assignee or team lead:**

- **Pending** → Click "Start" → **In-Progress**
- **In-Progress** → Click "Complete" → **Completed**

**Result:** Chat notification sent to team

---

## API Endpoints (for testing)

```bash
# Create Task
POST /api/projects/:projectId/tasks
Body: { title, description, assignedTo, priority, dueDate }

# Get Tasks
GET /api/projects/:projectId/tasks

# Update Status
PUT /api/projects/:projectId/tasks/:taskId/status
Body: { status: "in-progress" }

# Delete Task
DELETE /api/projects/:projectId/tasks/:taskId
```

---

## Priority Colors

- 🔴 **High** - Red - Urgent/Critical
- 🟡 **Medium** - Yellow - Normal priority
- 🟢 **Low** - Green - Nice to have

---

## Status Flow

```
📝 Pending → 🔄 In-Progress → ✅ Completed
```

---

## Notifications

**Email:** Sent when task is assigned to someone  
**Chat:** Sent for create, status update, delete  
**Real-time:** All connected team members see instantly

---

## Permissions Quick Check

| Action | Team Lead | Assigned Member | Other Member |
|--------|-----------|-----------------|--------------|
| Create | ✅ | ❌ | ❌ |
| View | ✅ | ✅ | ✅ |
| Update Own | ✅ | ✅ | ❌ |
| Update Any | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ |

---

## Files Changed

**Backend:**
- `controllers/projectController.js` - 4 new functions
- `services/emailService.js` - Email template added
- `routes/projectRoutes.js` - 4 new routes
- `index.js` - Socket.IO integration

**Frontend:**
- `components/TaskManagement.jsx` - NEW component
- `components/ProjectDetails.jsx` - Added TaskManagement
- `components/TeamManagementPage.jsx` - Added TaskManagement

---

## Troubleshooting

**Can't create tasks?** → Must be project creator  
**Can't see tasks?** → Must be team member  
**No email received?** → Check spam folder  
**Chat not showing?** → Refresh page  

---

**That's it! Start creating tasks and collaborating! 🎉**
