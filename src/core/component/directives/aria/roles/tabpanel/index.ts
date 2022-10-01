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
import type { TabpanelParams } from 'core/component/directives/aria/roles/tabpanel/interface';

export class Tabpanel extends ARIARole {
	override Params!: TabpanelParams;

	/** @inheritDoc */
	init(): void {
		const
			{label, labelledby} = this.params;

		if (label == null && labelledby == null) {
			throw new TypeError('The `tabpanel` role expects a `label` or `labelledby` value to be passed');
		}

		this.setAttribute('role', 'tabpanel');
	}
}
