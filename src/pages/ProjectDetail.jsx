import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Plus } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { groupTasksByStatus } from '../utils/helpers';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import CreateTaskModal from '../components/CreateTaskModal';
import Avatar from '../components/Avatar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tasks, fetchTasks } = useTasks();

  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createTaskColumn, setCreateTaskColumn] = useState('todo');
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    async function loadProject() {
      setProjectLoading(true);
      try {
        const res = await api.get(`/api/projects/${id}`);
        setProject(res.data);
      } catch {
        setProject(null);
      } finally {
        setProjectLoading(false);
      }
    }
    loadProject();
    fetchTasks(id);
  }, [id, fetchTasks]);

  const grouped = groupTasksByStatus(tasks);

  const columns = [
    { key: 'todo', label: 'Todo', headerClass: 'bg-gray-100 text-gray-700' },
    { key: 'in-progress', label: 'In Progress', headerClass: 'bg-blue-50 text-blue-700' },
    { key: 'done', label: 'Done', headerClass: 'bg-green-50 text-green-700' },
  ];

  async function handleAddMember(e) {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setAddingMember(true);
    try {
      await api.post(`/api/projects/${id}/members`, { email: memberEmail.trim() });
      const res = await api.get(`/api/projects/${id}`);
      setProject(res.data);
      setMemberEmail('');
      setAddMemberOpen(false);
    } catch {
      // handled
    } finally {
      setAddingMember(false);
    }
  }

  if (projectLoading) return <LoadingSpinner fullPage />;
  if (!project) return (
    <EmptyState
      title="Project not found"
      description="The project you are looking for does not exist."
      actionLabel="Back to Projects"
      onAction={() => navigate('/projects')}
    />
  );

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" /> Projects
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color || '#7C3AED' }}
              />
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            </div>
            <p className="text-sm text-gray-500 max-w-2xl">{project.description || 'No description'}</p>
            <div className="flex items-center gap-2 mt-4">
              {project.members?.map((m, i) => (
                <div key={m._id || m.id} className={i > 0 ? '-ml-2' : ''}>
                  <Avatar name={m.name} size="md" />
                </div>
              ))}
              {isAdmin && (
                <button
                  onClick={() => setAddMemberOpen(true)}
                  className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors duration-200 ml-2"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setAddMemberOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                <UserPlus className="w-4 h-4" /> Add Member
              </button>
            )}
            <button
              onClick={() => { setCreateTaskColumn('todo'); setCreateTaskOpen(true); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors duration-200"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((col) => (
          <div key={col.key} className="min-w-[280px] w-1/3 flex-shrink-0">
            <div className={`flex items-center justify-between px-4 py-3 rounded-t-lg ${col.headerClass}`}>
              <span className="text-sm font-semibold">{col.label}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/60">
                {grouped[col.key].length}
              </span>
            </div>
            <div className="bg-gray-50/50 border border-t-0 border-gray-100 rounded-b-lg p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto">
              {grouped[col.key].map((task) => (
                <TaskCard
                  key={task._id || task.id}
                  task={task}
                  onClick={() => { setSelectedTask(task); setTaskModalOpen(true); }}
                />
              ))}
              <button
                onClick={() => { setCreateTaskColumn(col.key); setCreateTaskOpen(true); }}
                className="w-full py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm font-medium hover:border-primary hover:text-primary transition-colors duration-200 flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add task
              </button>
            </div>
          </div>
        ))}
      </div>

      {taskModalOpen && selectedTask && (
        <TaskModal
          key={selectedTask._id || selectedTask.id}
          task={selectedTask}
          project={project}
          isOpen={taskModalOpen}
          onClose={() => { setTaskModalOpen(false); setSelectedTask(null); }}
          onUpdated={() => fetchTasks(id)}
        />
      )}

      {createTaskOpen && (
        <CreateTaskModal
          project={project}
          status={createTaskColumn}
          isOpen={createTaskOpen}
          onClose={() => setCreateTaskOpen(false)}
          onCreated={() => fetchTasks(id)}
        />
      )}

      {addMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setAddMemberOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Email address"
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setAddMemberOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors duration-200">Cancel</button>
                <button type="submit" disabled={addingMember} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-60">{addingMember ? 'Adding...' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
