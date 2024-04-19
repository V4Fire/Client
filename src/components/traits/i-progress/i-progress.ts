/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-extraneous-class */

/**
 * [[include:components/traits/i-progress/README.md]]
 * @packageDocumentation
 */

import type iAccess from 'components/traits/i-access/i-access';
import type iBlock from 'components/super/i-block/i-block';
import type { ModsDecl, ModEvent } from 'components/super/i-block/i-block';

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
		component.unsafe.localEmitter.on('block.mod.*.progress.*', (e: ModEvent) => {
			if (e.value === 'false' || e.type === 'remove') {
				if (e.type !== 'remove' || e.reason === 'removeMod') {
					component.emit('progressEnd');
				}

			} else {
				component.emit('progressStart');
			}
		});
	}

	/**
	 * Initializes the disable-on-progress behavior for the specified component
	 * @param component
	 */
	static initDisableBehavior<T extends iBlock & iAccess>(component: T): void {
		component.unsafe.localEmitter.on('block.mod.*.progress.*', (e: ModEvent) => {
			const isFinish = e.value === 'false' || e.type === 'remove';
			void component.setMod('disabled', !isFinish);
		});
	}
}
