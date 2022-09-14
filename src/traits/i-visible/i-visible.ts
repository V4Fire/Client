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
	 * If true, then the component won't be displayed if there is no Internet connection
	 */
	readonly hideIfOffline: boolean = false;

	/**
	 * Trait modifiers
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
	static initModEvents<T extends iBlock & iVisible>(component: T): void {
		const {
			$el,
			localEmitter: $e
		} = component.unsafe;

		component.sync
			.mod('hidden', 'r.isOnline', (v) => component.hideIfOffline && v === false);

		$e.on('block.mod.*.hidden.*', (e: ModEvent) => {
			if (e.type === 'remove' && e.reason !== 'removeMod') {
				return;
			}

			if (e.value === 'false' || e.type === 'remove') {
				$el?.setAttribute('aria-hidden', 'true');
				component.emit('show');

			} else {
				$el?.setAttribute('aria-hidden', 'false');
				component.emit('hide');
			}
		});
	}
}
