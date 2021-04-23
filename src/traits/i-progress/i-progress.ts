/* eslint-disable @typescript-eslint/no-extraneous-class */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-progress/README.md]]
 * @packageDocumentation
 */

import type iBlock from 'super/i-block/i-block';
import type { ModsDecl, ModEvent } from 'super/i-block/i-block';

export default abstract class iProgress {
	/**
	 * Trait modifiers
	 */
	static readonly mods: ModsDecl = {
		progress: [
			'true',
			'false'
		]
	};

	/**
	 * Initializes modifier event listeners for the specified component
	 *
	 * @emits `progressStart()`
	 * @emits `progressEnd()`
	 *
	 * @param component
	 */
	static initModEvents<T extends iBlock>(component: T): void {
		const
			{localEmitter: $e} = component.unsafe;

		$e.on('block.mod.*.progress.*', (e: ModEvent) => {
			if (e.type === 'remove' && e.reason !== 'removeMod') {
				return;
			}

			component.emit(e.value === 'false' || e.type === 'remove' ? 'progressEnd' : 'progressStart');
		});
	}
}
