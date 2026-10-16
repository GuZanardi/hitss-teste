type TeamColorClasses = Record<'bg' | 'text' | 'border', string>;

const TEAM_COLOR_CLASSES: Record<string, TeamColorClasses> = {
  '#00B37E': { bg: 'bg-team-claro', text: 'text-team-claro', border: 'border-team-claro' },
  '#EBCB4B': { bg: 'bg-team-yellow', text: 'text-team-yellow', border: 'border-team-yellow' },
  '#00B4D8': { bg: 'bg-team-backend', text: 'text-team-backend', border: 'border-team-backend' },
  '#F59E0B': { bg: 'bg-team-amber', text: 'text-team-amber', border: 'border-team-amber' },
  '#0284C7': { bg: 'bg-team-blue', text: 'text-team-blue', border: 'border-team-blue' },
  '#7C3AED': { bg: 'bg-team-violet', text: 'text-team-violet', border: 'border-team-violet' },
  '#E11D48': { bg: 'bg-team-rose', text: 'text-team-rose', border: 'border-team-rose' },
  '#EA580C': { bg: 'bg-team-orange', text: 'text-team-orange', border: 'border-team-orange' },
  '#4F46E5': { bg: 'bg-team-indigo', text: 'text-team-indigo', border: 'border-team-indigo' },
  '#16A34A': { bg: 'bg-team-green', text: 'text-team-green', border: 'border-team-green' },
  '#DB2777': { bg: 'bg-team-pink', text: 'text-team-pink', border: 'border-team-pink' },
  '#0891B2': { bg: 'bg-team-cyan', text: 'text-team-cyan', border: 'border-team-cyan' },
  '#A16207': { bg: 'bg-team-ochre', text: 'text-team-ochre', border: 'border-team-ochre' },
  '#9333EA': { bg: 'bg-team-purple', text: 'text-team-purple', border: 'border-team-purple' },
  '#65A30D': { bg: 'bg-team-lime', text: 'text-team-lime', border: 'border-team-lime' },
  '#C026D3': { bg: 'bg-team-magenta', text: 'text-team-magenta', border: 'border-team-magenta' },
  '#475569': { bg: 'bg-team-slate', text: 'text-team-slate', border: 'border-team-slate' },
};

export function teamColorClass(
  color: string | null | undefined,
  utility: keyof TeamColorClasses = 'bg',
): string {
  const classes =
    TEAM_COLOR_CLASSES[(color ?? '').toUpperCase()] ?? TEAM_COLOR_CLASSES['#00B37E'];
  return classes[utility];
}
