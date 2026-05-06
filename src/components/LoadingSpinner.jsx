export default function LoadingSpinner({ size = 32, fullPage = false }) {
  const wrapperClasses = fullPage
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center';

  return (
    <div className={wrapperClasses}>
      <div
        className="animate-spin rounded-full border-[3px] border-transparent border-t-primary"
        style={{
          width: size,
          height: size,
          borderLeftColor: 'rgba(124, 58, 237, 0.3)',
        }}
      />
    </div>
  );
}
