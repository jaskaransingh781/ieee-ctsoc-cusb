import { listedEvents as events } from '../data/events';
import { site } from '../data/site';
import { team } from '../data/team';

const counters = {
  'auto:events': () => events.length,
  'auto:past-events': () => events.filter((event) => event.status === 'past').length,
  'auto:team': () => team.filter((member) => Boolean(member.name)).length,
};

/**
 * Impact figures from site.js with any 'auto:…' values counted from the
 * data. Figures whose value is null are left out.
 */
export function getImpactStats() {
  return site.impact.stats
    .filter((stat) => stat.value !== null && stat.value !== undefined && stat.value !== '')
    .map((stat) => ({
      ...stat,
      value:
        typeof stat.value === 'string' && counters[stat.value] ? counters[stat.value]() : Number(stat.value) || 0,
    }));
}
