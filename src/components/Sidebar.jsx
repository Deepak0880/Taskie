import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (open) onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
  ];

  const sidebarClasses = `
    fixed top-0 left-0 z-30 h-full w-[260px] bg-[#7C3AED] flex flex-col transition-transform duration-200 ease-in-out
    ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:block'}
  `;

  return (
    <aside className={sidebarClasses}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-xl tracking-tight">TaskFlow</span>
      </div>

      <nav className="flex-1 px-4 py-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => onClose?.()}
              className={({ isActive: navActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-1 ${
                  navActive || isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-9 h-9 rounded-full bg-purple-200 flex items-center justify-center text-[#7C3AED] font-semibold text-sm">
            {getInitials(user?.name || 'User')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm truncate">{user?.name || 'User'}</div>
            <div
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${
                user?.role === 'admin'
                  ? 'bg-yellow-400/20 text-yellow-200'
                  : 'bg-white/20 text-white/80'
              }`}
            >
              {user?.role || 'member'}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-white/70 text-sm font-medium hover:text-red-200 hover:bg-red-500/10 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
