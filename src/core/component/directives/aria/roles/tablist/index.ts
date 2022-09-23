/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/aria/roles/tablist/README.md]]
 * @packageDocumentation
 */

import { ARIARole } from 'core/component/directives/aria/roles/interface';
import type { TablistParams } from 'core/component/directives/aria/roles/tablist/interface';

export * from 'core/component/directives/aria/roles/tablist/interface';

export class Tablist extends ARIARole {
	override Params!: TablistParams ;

	/** @inheritDoc */
	init(): void {
		this.setAttribute('role', 'tablist');
	}
}
