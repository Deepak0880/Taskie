export default function PriorityBadge({ priority }) {
  const styles = {
    low: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      dot: 'bg-green-500',
      label: 'Low',
    },
    medium: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      dot: 'bg-yellow-500',
      label: 'Medium',
    },
    high: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      dot: 'bg-red-500',
      label: 'High',
    },
  };

  const config = styles[priority] || styles.low;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
