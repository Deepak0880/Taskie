export default function StatusBadge({ status }) {
  const styles = {
    todo: 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  };

  const labels = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
    overdue: 'Overdue',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status] || styles.todo
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
