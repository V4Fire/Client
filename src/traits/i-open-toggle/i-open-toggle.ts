/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iOpen from 'traits/i-open/i-open';
import iBlock from 'super/i-block/i-block';
export * from 'traits/i-open/i-open';

export default abstract class iOpenToggle extends iOpen {
	/**
	 * Toggles the component
	 */
	static toggle<T extends iBlock>(component: T & iOpen): Promise<boolean> {
		return component.mods.opened === 'true' ? component.close() : component.open();
	}

	/**
	 * Toggles the component
	 */
	abstract toggle(): Promise<boolean>;
}
