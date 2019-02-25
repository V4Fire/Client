/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

export default abstract class iIcon {
	/**
	 * Returns
	 *
	 * @param component
	 * @param [pos] - hint position
	 */
	static setHint(component: iBlock, pos: string = 'bottom'): ReadonlyArray<string> {
		return component.getBlockClasses('g-hint', {pos});
	}

	/**
	 * Sets g-hint for the specified element
	 * @param [pos] - hint position
	 */
	protected abstract setHint(pos: string): ReadonlyArray<string>;
}
