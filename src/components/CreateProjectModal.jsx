import { useState, useEffect } from 'react';
import { X, Plus, UserPlus } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import toast from 'react-hot-toast';

const PRESET_COLORS = [
  '#6366f1',
  '#EC4899',
  '#F59E0B',
  '#22C55E',
  '#EF4444',
  '#14B8A6',
  '#F97316',
  '#8B5CF6',
];

export default function CreateProjectModal({ isOpen, onClose, onCreated }) {
  const { createProject } = useProjects();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [memberEmail, setMemberEmail] = useState('');
  const [members, setMembers] = useState([]);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  function addMember() {
    const email = memberEmail.trim();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid email address');
      return;
    }
    if (members.includes(email)) {
      toast.error('Email already added');
      return;
    }
    setMembers((prev) => [...prev, email]);
    setMemberEmail('');
  }

  function removeMember(email) {
    setMembers((prev) => prev.filter((m) => m !== email));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }
    setLoading(true);
    try {
      const data = {
        name: name.trim(),
        description: description.trim(),
        color,
        members,
      };
      const created = await createProject(data);
      onCreated?.(created);
      onClose();
      setName('');
      setDescription('');
      setColor(PRESET_COLORS[0]);
      setMembers([]);
    } catch {
      // handled by hook
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Create New Project</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Members</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                  placeholder="Email address"
                  className="w-full border border-[#E5E7EB] rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <button
                type="button"
                onClick={addMember}
                className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {members.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {members.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-primary text-xs font-medium"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeMember(email)}
                      className="hover:text-primary-dark"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
