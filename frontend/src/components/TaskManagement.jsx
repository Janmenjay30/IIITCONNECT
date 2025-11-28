import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { toast } from 'react-hot-toast';

const TaskManagement = ({ projectId, isCreator, currentUserId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  // Form state for creating tasks
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium'
  });

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
    if (isCreator) {
      fetchTeamMembers();
    }
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/tasks`);
      setTasks(response.data.tasks || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/team`);
      setTeamMembers(response.data.teamMembers || []);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    const performanceStart = performance.now();

    // 🚀 OPTIMISTIC UI UPDATE - Show task immediately
    const optimisticTask = {
      _id: `temp-${Date.now()}`, // Temporary ID
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo ? {
        _id: newTask.assignedTo,
        name: teamMembers.find(m => m._id === newTask.assignedTo)?.name || 'Loading...',
        email: teamMembers.find(m => m._id === newTask.assignedTo)?.email || ''
      } : null,
      status: 'pending',
      priority: newTask.priority || 'medium',
      dueDate: newTask.dueDate,
      createdBy: { _id: currentUserId, name: 'You' },
      createdAt: new Date(),
      isOptimistic: true // Flag for UI styling
    };

    // Add to UI instantly (0ms perceived delay)
    setTasks([...tasks, optimisticTask]);

    // Show instant feedback
    toast.success('Creating task...', { duration: 1500 });

    // Close modal and reset form immediately
    setShowCreateModal(false);
    const formData = { ...newTask }; // Save for API call
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      priority: 'medium'
    });

    try {
      // 🔥 Background API call (doesn't block UI)
      // Convert empty string to null for assignedTo
      const taskData = {
        ...formData,
        assignedTo: formData.assignedTo || null
      };
      
      const response = await axiosInstance.post(
        `/api/projects/${projectId}/tasks`,
        taskData
      );

      const performanceEnd = performance.now();
      console.log(`⚡ Task creation took ${(performanceEnd - performanceStart).toFixed(2)}ms`);

      // Replace optimistic task with real task from server
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t._id === optimisticTask._id 
            ? response.data.task 
            : t
        )
      );

      // Show success notification
      toast.success(
        response.data.emailSent 
          ? `Task created in ${response.data.performanceMs}ms! Email sent.` 
          : `Task created in ${response.data.performanceMs}ms!`,
        { duration: 3000 }
      );

    } catch (error) {
      // Rollback optimistic update on error
      setTasks(prevTasks => 
        prevTasks.filter(t => t._id !== optimisticTask._id)
      );
      
      toast.error(error.response?.data?.message || 'Failed to create task');
      
      // Reopen modal with saved data on error
      setNewTask(formData);
      setShowCreateModal(true);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await axiosInstance.put(
        `/api/projects/${projectId}/tasks/${taskId}/status`,
        { status: newStatus }
      );

      toast.success(`Task marked as ${newStatus}!`);

      // Update task in list
      setTasks(tasks.map(task => 
        task._id === taskId 
          ? { ...task, status: newStatus } 
          : task
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/projects/${projectId}/tasks/${taskId}`);
      toast.success('Task deleted successfully');
      
      // Remove task from list
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in-progress': return 'bg-blue-500 text-white';
      case 'pending': return 'bg-gray-400 text-white';
      default: return 'bg-gray-300 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📋 Tasks</h2>
        {isCreator && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Create Task
          </button>
        )}
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No tasks yet</h3>
          <p className="text-gray-500">
            {isCreator 
              ? 'Create your first task to get started!' 
              : 'The team lead will assign tasks soon.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isAssignedToMe = task.assignedTo?._id === currentUserId;
            const canUpdateStatus = isCreator || isAssignedToMe;
            const isOptimistic = task.isOptimistic; // Check if task is being created

            return (
              <div 
                key={task._id} 
                className={`border border-gray-200 rounded-lg p-4 transition-all ${
                  isOptimistic 
                    ? 'bg-blue-50 border-blue-300 opacity-80 animate-pulse' 
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      {task.title}
                      {isOptimistic && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full animate-pulse">
                          Creating...
                        </span>
                      )}
                    </h3>
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                    )}
                  </div>
                  
                  {isCreator && (
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-red-600 hover:text-red-800 ml-2"
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Priority Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} {task.priority.toUpperCase()}
                  </span>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                    {task.status === 'completed' ? '✅' : task.status === 'in-progress' ? '🔄' : '📝'} {task.status.toUpperCase()}
                  </span>

                  {/* Due Date */}
                  {task.dueDate && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold border border-purple-300">
                      📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {task.assignedTo ? (
                      <span>
                        Assigned to: <strong>{task.assignedTo.name}</strong>
                        {isAssignedToMe && <span className="ml-2 text-blue-600">(You)</span>}
                      </span>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </div>

                  {/* Status Update Buttons */}
                  {canUpdateStatus && task.status !== 'completed' && (
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(task._id, 'in-progress')}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'in-progress' && (
                        <button
                          onClick={() => handleStatusUpdate(task._id, 'completed')}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Create New Task</h3>
            
            <form onSubmit={handleCreateTask}>
              {/* Task Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Implement login feature"
                  required
                />
              </div>

              {/* Task Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Task details..."
                />
              </div>

              {/* Assign To */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To
                </label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Unassigned --</option>
                  {teamMembers.map((member) => (
                    <option key={member.userId._id} value={member.userId._id}>
                      {member.userId.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
