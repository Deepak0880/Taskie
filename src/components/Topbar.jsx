import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

export default function Topbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/projects': 'Projects',
  };

  const title = pageTitles[location.pathname] || 'TaskFlow';

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB] h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      </div>

      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div
          className={`relative flex items-center rounded-lg border transition-all duration-200 ${
            searchFocused
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-[#E5E7EB]'
          }`}
        >
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full border-2 border-white" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A855F7] to-[#7C3AED] flex items-center justify-center text-white text-xs font-semibold">
              {getInitials(user?.name || 'User')}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E5E7EB] py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <button
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setDropdownOpen(false)}
              >
                <User className="w-4 h-4" />
                My Profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
