import { ABILITIES } from './abilities';

export type AbilityId = (typeof ABILITIES)[number]['id'];
export type AbilityKey = (typeof ABILITIES)[number]['key'];
export type AbilityName = (typeof ABILITIES)[number]['name'];
