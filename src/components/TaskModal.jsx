import { useState, useEffect, useCallback } from 'react';
import { X, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import toast from 'react-hot-toast';

export default function TaskModal({ task, project, isOpen, onClose, onUpdated }) {
  const { user } = useAuth();
  const { updateTask, deleteTask } = useTasks();
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'low',
    assigneeId: task?.assignee?._id || task?.assignee?.id || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
  });

  const isAdmin = user?.role === 'admin';
  const isOwner = task?.assignee?._id === user?._id || task?.assignee?.id === user?._id || task?.createdBy === user?._id;
  const canEdit = isAdmin || isOwner;

  const handleSave = useCallback(async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setLoading(true);
    try {
      const updated = await updateTask(task._id || task.id, form);
      onUpdated?.(updated);
      onClose();
    } catch {
      // handled by hook
    } finally {
      setLoading(false);
    }
  }, [form, task, updateTask, onUpdated, onClose]);

  const handleDelete = useCallback(async () => {
    setLoading(true);
    try {
      await deleteTask(task._id || task.id);
      onUpdated?.(null);
      onClose();
    } catch {
      // handled by hook
    } finally {
      setLoading(false);
      setShowDelete(false);
    }
  }, [task, deleteTask, onUpdated, onClose]);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between p-6 border-b border-gray-100">
            <div>
              {canEdit ? (
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="text-lg font-bold text-gray-900 border border-[#E5E7EB] rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              ) : (
                <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
              )}
              <div className="mt-1">
                <StatusBadge status={form.status} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                disabled={!canEdit}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Add a description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex gap-2">
                {['todo', 'in-progress', 'done'].map((s) => (
                  <button
                    key={s}
                    onClick={() => canEdit && setForm((f) => ({ ...f, status: s }))}
                    disabled={!canEdit}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                      form.status === s
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-[#E5E7EB] hover:bg-gray-50'
                    } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {s === 'todo' ? 'To Do' : s === 'in-progress' ? 'In Progress' : 'Done'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div className="flex gap-2">
                {[
                  { key: 'low', label: 'Low', active: 'bg-gray-100 text-gray-700 border-gray-200' },
                  { key: 'medium', label: 'Medium', active: 'bg-warning text-white border-warning' },
                  { key: 'high', label: 'High', active: 'bg-danger text-white border-danger' },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => canEdit && setForm((f) => ({ ...f, priority: p.key }))}
                    disabled={!canEdit}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                      form.priority === p.key
                        ? p.active
                        : 'bg-white text-gray-700 border-[#E5E7EB] hover:bg-gray-50'
                    } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select
                value={form.assigneeId}
                onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
                disabled={!canEdit}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
              >
                <option value="">Unassigned</option>
                {project?.members?.map((m) => (
                  <option key={m._id || m.id} value={m._id || m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                disabled={!canEdit}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-gray-100">
            {isAdmin && (
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              {canEdit && (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-60"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDelete}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        itemName={task.title}
        itemType="task"
      />
    </>
  );
}
