/**
 * Class name join.
 *
 * The 21st.dev component imports `cn` from `@/lib/utils`, which in most Tailwind
 * starters is clsx plus tailwind-merge. Nothing here needs conflict resolution
 * between competing Tailwind classes, so this is a filtered join instead of two
 * more dependencies on a page that has a Lighthouse budget to hit.
 *
 * If a component ever does need to override a class passed from a parent, swap
 * this for tailwind-merge rather than working around it at the call site.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
