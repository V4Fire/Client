/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/pages/p-v4-dynamic-page1/README.md]]
 * @packageDocumentation
 */

import type { OnBeforeRemovePage } from 'components/base/b-dynamic-page/b-dynamic-page';

import iDynamicPage, { component, watch } from 'components/super/i-dynamic-page/i-dynamic-page';

export * from 'components/super/i-dynamic-page/i-dynamic-page';

@component()
export default class pV4DynamicPage1 extends iDynamicPage {
	override readonly $refs!: iDynamicPage['$refs'] & {
		horizontalScroll: HTMLUListElement;
	};

	@watch('rootEmitter:onBeforeRemovePage')
	protected saveSliderScroll({saveScroll}: OnBeforeRemovePage): void {
		this.console.log(this.$refs.horizontalScroll);
		saveScroll(this.$refs.horizontalScroll);
	}
}
