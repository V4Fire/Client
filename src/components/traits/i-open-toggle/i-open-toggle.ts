/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/traits/i-open-toggle/README.md]]
 * @packageDocumentation
 */

import iOpen from 'components/traits/i-open/i-open';
import type iBlock from 'components/super/i-block/i-block';

export * from 'components/traits/i-open/i-open';

export default abstract class iOpenToggle extends iOpen {
	/** {@link iOpenToggle.toggle} */
	static toggle: AddSelf<iOpenToggle['toggle'], iBlock & iOpen> =
		(component) => component.mods.opened === 'true' ? component.close() : component.open();

	/**
	 * Toggles the component to open or close
	 * @param _args
	 */
	toggle(..._args: unknown[]): Promise<boolean> {
		return Object.throw();
	}
}
