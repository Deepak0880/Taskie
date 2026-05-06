export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'done') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getStatusLabel(status) {
  const labels = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
    overdue: 'Overdue',
  };
  return labels[status] || status;
}

export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '...';
}

export function groupTasksByStatus(tasks) {
  const groups = { todo: [], 'in-progress': [], done: [] };
  if (!tasks) return groups;
  tasks.forEach((task) => {
    const status = task.status || 'todo';
    if (groups[status]) {
      groups[status].push(task);
    } else {
      groups.todo.push(task);
    }
  });
  return groups;
}
