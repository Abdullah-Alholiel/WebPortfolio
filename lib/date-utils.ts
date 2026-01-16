export interface Experience {
  title: string;
  location: string;
  description: string;
  date: string;
  icon?: string;
}

export function parseExperienceDate(dateStr: string): { start: Date; end: Date | null } {
  const parts = dateStr.split(' - ');
  const startStr = parts[0]?.trim() || '';
  const endStr = parts[1]?.trim() || '';

  const start = parseMonthYear(startStr);

  let end: Date | null = null;
  if (endStr.toLowerCase() === 'present') {
    end = new Date();
  } else if (endStr) {
    end = parseMonthYear(endStr);
  }

  return { start, end };
}

function parseMonthYear(str: string): Date {
  const parts = str.split('/');
  const month = parseInt(parts[0], 10) || 1;
  const year = parseInt(parts[1], 10) || new Date().getFullYear();
  return new Date(year, month - 1, 1);
}

export function sortExperiencesByDate(experiences: Experience[]): Experience[] {
  return [...experiences].sort((a, b) => {
    const dateA = parseExperienceDate(a.date);
    const dateB = parseExperienceDate(b.date);

    const endA = dateA.end ?? dateA.start;
    const endB = dateB.end ?? dateB.start;

    return endB.getTime() - endA.getTime();
  });
}

export function getExperienceSortIndex(experience: Experience, allExperiences: Experience[]): number {
  const sorted = sortExperiencesByDate(allExperiences);
  return sorted.findIndex(exp =>
    exp.title === experience.title &&
    exp.date === experience.date &&
    exp.location === experience.location
  );
}
