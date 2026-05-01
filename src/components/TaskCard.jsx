import { Calendar } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import Avatar from './Avatar';
import { formatDate, isOverdue } from '../utils/helpers';

export default function TaskCard({ task, onClick }) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border p-4 cursor-pointer hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 ${
        overdue ? 'border-l-[3px] border-l-[#EF4444] bg-red-50/30' : 'border-[#E5E7EB]'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 mr-2">
          {task.title}
        </h4>
        <PriorityBadge priority={task.priority || 'low'} />
      </div>
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-1 mb-3">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            name={task.assignee?.name || 'Unassigned'}
            size="sm"
          />
          <span className="text-xs text-gray-600 truncate max-w-[80px]">
            {task.assignee?.name || 'Unassigned'}
          </span>
        </div>
        <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
          <Calendar className="w-3.5 h-3.5" />
          {overdue ? 'Overdue' : formatDate(task.dueDate)}
        </div>
      </div>
    </div>
  );
}
