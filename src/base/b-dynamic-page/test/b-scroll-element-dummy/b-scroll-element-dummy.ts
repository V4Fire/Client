/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bDummy, { component, watch } from 'dummies/b-dummy/b-dummy';
import type { OnBeforeSwitchPage } from 'base/b-dynamic-page/b-dynamic-page';

export * from 'dummies/b-dummy/b-dummy';

@component()
export class bScrollElementDummy extends bDummy {
	override readonly $refs!: bDummy['$refs'] & {
		scrollable: HTMLUListElement;
	};

	/**
	 * Saves the scrollable element scroll
	 * @param param
	 */
	@watch('rootEmitter:onBeforeSwitchPage')
	protected saveElementScroll({saveScroll}: OnBeforeSwitchPage): void {
		saveScroll(this.$refs.scrollable);
	}
}
