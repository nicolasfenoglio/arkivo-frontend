export function formatRelativeDate(date: Date | string): string {
  const target = new Date(date);
  const now = new Date();

  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "hace un momento";
  if (diffMinutes < 60)
    return `hace ${diffMinutes} minuto${diffMinutes === 1 ? "" : "s"}`;

  if (diffHours < 24)
    return `hace ${diffHours} hora${diffHours === 1 ? "" : "s"}`;

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `hace ${diffDays} día${diffDays === 1 ? "" : "s"}`;

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `hace ${weeks} semana${weeks === 1 ? "" : "s"}`;
  }

  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `hace ${months} mes${months === 1 ? "" : "es"}`;
  }

  const years = Math.floor(diffDays / 365);
  return `hace ${years} año${years === 1 ? "" : "s"}`;
}
