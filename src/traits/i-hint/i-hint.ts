/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

export default abstract class iHint {
	/**
	 * Returns a hint class with the specified position
	 *
	 * @param component
	 * @param [pos] - hint position
	 */
	static getHintClass<T extends iBlock>(component: T, pos: string = 'bottom'): ReadonlyArray<string> {
		return component.provide.blockClasses('g-hint', {pos});
	}

	/**
	 * Returns a hint class with the specified position
	 * @param [pos] - hint position
	 */
	abstract getHintClass(pos: string): ReadonlyArray<string>;
}
