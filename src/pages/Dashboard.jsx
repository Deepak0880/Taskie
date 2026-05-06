import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, isOverdue } from '../utils/helpers';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await api.get('/api/dashboard');
        setData(response.data);
      } catch {
        setData({ stats: {}, recentTasks: [], myProjects: [] });
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const stats = data?.stats || {};
  const recentTasks = data?.recentTasks || [];
  const myProjects = data?.myProjects || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks ?? 0}
          icon={ClipboardList}
          color="primary"
        />
        <StatsCard
          title="Completed"
          value={stats.completedTasks ?? 0}
          icon={CheckCircle}
          color="success"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressTasks ?? 0}
          icon={Clock}
          color="blue"
        />
        <StatsCard
          title="Overdue"
          value={stats.overdueTasks ?? 0}
          icon={AlertTriangle}
          color="danger"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[60%] bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Recent Tasks</h3>
          </div>
          {recentTasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Your recent tasks will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <th className="px-6 py-3">Task Title</th>
                    <th className="px-6 py-3">Project</th>
                    <th className="px-6 py-3">Assignee</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTasks.slice(0, 8).map((task) => {
                    const overdue = isOverdue(task.dueDate, task.status);
                    return (
                      <tr
                        key={task._id || task.id}
                        className={`hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
                          overdue ? 'bg-red-50/50 border-l-[3px] border-l-red-500' : ''
                        }`}
                        onClick={() =>
                          navigate(`/projects/${task.project?._id || task.project?.id || task.projectId}`)
                        }
                      >
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{task.title}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {task.project?.name || '—'}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {task.assignee?.name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={overdue ? 'overdue' : task.status} />
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {formatDate(task.dueDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:w-[40%] bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">My Projects</h3>
          </div>
          {myProjects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Your projects will appear here."
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {myProjects.slice(0, 4).map((project) => (
                <div
                  key={project._id || project.id}
                  onClick={() => navigate(`/projects/${project._id || project.id}`)}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: project.color || '#7C3AED' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.taskCount ?? 0} tasks</p>
                  </div>
                </div>
              ))}
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-1 w-full px-6 py-3 text-sm font-medium text-primary hover:bg-gray-50 transition-colors duration-200"
              >
                View All Projects
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
