import definitions from './events.json';
import type { NarrativeEvent } from './types';
// JSON object unions infer absent node keys as undefined; graph integrity is checked by narrative-events.test.mjs.
export const narrativeEvents=definitions as unknown as NarrativeEvent[];
