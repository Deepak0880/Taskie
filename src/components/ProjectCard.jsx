import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckSquare, MoreVertical, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="group bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={() => navigate(`/projects/${project._id || project.id}`)}
    >
      <div className="flex items-start p-5">
        <div
          className="w-1.5 h-12 rounded-full mr-4 shrink-0"
          style={{ backgroundColor: project.color || '#7C3AED' }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: project.color || '#7C3AED' }}
            />
            <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            {project.description || 'No description'}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {project.members?.length || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4" />
              {project.taskCount ?? 0}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="relative shrink-0 ml-2" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-1 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit?.(project);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete?.(project);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Created {project.createdAt ? formatDate(project.createdAt) : 'Recently'}
        </span>
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-200">
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
        </div>
      </div>
    </div>
  );
}
