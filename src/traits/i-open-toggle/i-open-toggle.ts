/* eslint-disable @typescript-eslint/no-unused-vars */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-open-toggle/README.md]]
 * @packageDocumentation
 */

import iOpen from 'traits/i-open/i-open';
import type iBlock from 'super/i-block/i-block';

export * from 'traits/i-open/i-open';

export default abstract class iOpenToggle extends iOpen {
	/** @see [[iOpenToggle.toggle]] */
	static toggle: AddSelf<iOpenToggle['toggle'], iBlock & iOpen> =
		(component) => component.mods.opened === 'true' ? component.close() : component.open();

	/**
	 * Toggles the component to open or close
	 * @param args
	 */
	toggle(...args: unknown[]): Promise<boolean> {
		return Object.throw();
	}
}
