import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'There are no items to display at this time.',
  icon: Icon = Inbox,
  action = null,
}) {
  return (
    <div className="empty-state">
      <Icon className="empty-state-icon" strokeWidth={1.5} />
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
