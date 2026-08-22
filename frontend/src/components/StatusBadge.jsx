export default function StatusBadge({ status = '', label = null }) {
  const s = (status || '').toUpperCase();
  
  let type = 'neutral';
  if (['PRESENT', 'APPROVED', 'PAID', 'ACTIVE', 'FULL_TIME', 'SUCCESS'].includes(s)) {
    type = 'success';
  } else if (['PENDING', 'HALF_DAY', 'PROCESSED', 'PART_TIME', 'WARNING'].includes(s)) {
    type = 'warning';
  } else if (['ABSENT', 'REJECTED', 'DANGER', 'ERROR'].includes(s)) {
    type = 'danger';
  } else if (['LEAVE', 'INFO', 'CONTRACT'].includes(s)) {
    type = 'info';
  } else if (['ADMIN', 'PRIMARY'].includes(s)) {
    type = 'primary';
  }

  const displayText = label || s.replace(/_/g, ' ');

  return (
    <span className={`badge badge-${type}`}>
      <span className="badge-dot" />
      {displayText}
    </span>
  );
}
