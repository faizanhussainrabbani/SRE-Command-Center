type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}