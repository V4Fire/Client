/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/traits/i-visible/README.md]]
 * @packageDocumentation
 */

import type iBlock from 'components/super/i-block/i-block';
import type { ModEvent, ModsDecl } from 'components/super/i-block/i-block';

export default abstract class iVisible {
	/**
	 * If this is true, then the component won't be displayed if there is no Internet connection
	 * @prop
	 */
	abstract readonly hideIfOffline: boolean;

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
		const {$el, localEmitter: $e} = component.unsafe;

		component.sync.mod('hidden', 'r.isOnline', (v) => component.hideIfOffline && v === false);

		$e.on('block.mod.*.hidden.*', (e: ModEvent) => {
			if (e.type === 'remove' && e.reason !== 'removeMod') {
				return;
			}

			if (e.value === 'false' || e.type === 'remove') {
				$el?.setAttribute('aria-hidden', 'true');
				component.strictEmit('show');

			} else {
				$el?.setAttribute('aria-hidden', 'false');
				component.strictEmit('hide');
			}
		});
	}
}
