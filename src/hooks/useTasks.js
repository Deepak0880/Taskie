import { useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/projects/${projectId}/tasks`);
      setTasks(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      toast.error(err.response?.data?.message || 'Failed to fetch tasks');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (projectId, data) => {
    setLoading(true);
    try {
      const response = await api.post(`/api/projects/${projectId}/tasks`, data);
      setTasks((prev) => [response.data, ...prev]);
      toast.success('Task created successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (taskId, data) => {
    setLoading(true);
    try {
      const response = await api.put(`/api/tasks/${taskId}`, data);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId || t.id === taskId ? response.data : t))
      );
      toast.success('Task updated successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    setLoading(true);
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId && t.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(
    (projectId) => {
      return fetchTasks(projectId);
    },
    [fetchTasks]
  );

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    refetch,
  };
}
