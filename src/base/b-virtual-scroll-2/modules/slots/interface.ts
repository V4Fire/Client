/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentRefs } from 'base/b-virtual-scroll-2/interface';

/**
 * Represents the state of slots.
 * [slotName: slotVisibility]
 */
export type SlotsStateObj = {
	[key in keyof ComponentRefs]: boolean;
};
