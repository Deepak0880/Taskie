import { useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/projects');
      setProjects(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
      toast.error(err.response?.data?.message || 'Failed to fetch projects');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/api/projects', data);
      setProjects((prev) => [response.data, ...prev]);
      toast.success('Project created successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await api.put(`/api/projects/${id}`, data);
      setProjects((prev) =>
        prev.map((p) => (p._id === id || p.id === id ? response.data : p))
      );
      toast.success('Project updated successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    setLoading(true);
    try {
      await api.delete(`/api/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      toast.success('Project deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = useCallback(async (projectId, email) => {
    setLoading(true);
    try {
      const response = await api.post(`/api/projects/${projectId}/members`, { email });
      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId || p.id === projectId ? response.data : p
        )
      );
      toast.success('Member added successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    refetch,
  };
}
