/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-visible/README.md]]
 * @packageDocumentation
 */

import type iBlock from 'super/i-block/i-block';
import type { ModEvent, ModsDecl } from 'super/i-block/i-block';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default abstract class iVisible {
	/**
	 * Visibility modifiers
	 */
	static readonly mods: ModsDecl = {
		hidden: [
			'true',
			'false'
		]
	};

	/**
	 * Initializes modifier event listeners for the specified component
	 *
	 * @emits `show()`
	 * @emits `hide()`
	 *
	 * @param component
	 */
	static initModEvents<T extends iBlock>(component: T): void {
		const
			{localEmitter: $e} = component.unsafe;

		$e.on('block.mod.*.hidden.*', (e: ModEvent) => {
			if (e.type === 'remove' && e.reason !== 'removeMod') {
				return;
			}

			component.emit(e.value === 'false' || e.type === 'remove' ? 'show' : 'hide');
		});
	}
}
