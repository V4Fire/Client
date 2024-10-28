/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentRefs } from 'components/base/b-virtual-scroll-new/interface';

/**
 * Represents the state of slots.
 * [slotName: slotVisibility]
 */
export type SlotsStateObj = {
	[key in keyof ComponentRefs]: boolean;
};
