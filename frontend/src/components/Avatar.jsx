export default function Avatar({ name = '', size = 'sm', src = null }) {
  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return str.slice(0, 2).toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`avatar avatar-${size}`}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <div className={`avatar avatar-${size}`} title={name}>
      {getInitials(name)}
    </div>
  );
}
