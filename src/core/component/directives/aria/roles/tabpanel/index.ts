/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/aria/roles/tabpanel/README.md]]
 * @packageDocumentation
 */

import { ARIARole } from 'core/component/directives/aria/roles/interface';

export class Tabpanel extends ARIARole {
	/** @inheritDoc */
	init(): void {
		const {el} = this;
		this.setAttribute('role', 'tabpanel');

		if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
			throw new TypeError('The tabpanel role expects a `label` or `labelledby` value to be passed');
		}
	}
}
