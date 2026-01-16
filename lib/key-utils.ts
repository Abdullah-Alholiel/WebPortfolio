export function generateExperienceKey(title: string, date: string): string {
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const normalizedDate = date.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${normalizedTitle}-${normalizedDate}`;
}
