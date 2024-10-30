/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/pages/p-v4-components-demo/README.md]]
 * @packageDocumentation
 */

import type bBottomSlide from 'components/base/b-bottom-slide/b-bottom-slide';
import iStaticPage, { component, prop, field, system, hook } from 'components/super/i-static-page/i-static-page';
import VDOM, * as VDOMAPI from 'components/friends/vdom';

export * from 'components/super/i-static-page/i-static-page';

VDOM.addToPrototype(VDOMAPI);

/**
 * Page with component demos.
 * Basically it uses with component tests.
 */
@component({root: true})
export default class pV4ComponentsDemo extends iStaticPage {
	/** {@link iStaticPage.selfDispatching} */
	@prop(Boolean)
	readonly selfDispatchingProp: boolean = false;

	@system((o) => o.sync.link())
	override readonly selfDispatching!: boolean;

	/**
	 * Parameter to test
	 */
	@system()
	rootParam?: number;

	/**
	 * Field for tests purposes
	 */
	@field()
	someField: unknown = 'foo';

	// forceUpdate=true causes it to close the bottom slider. when opened again manually, it doesn't react to future changes
	@field({forceUpdate: false})
	heightMode: string = 'content';

	protected async triggerHeightMode(): Promise<void> {
		if (this.heightMode === 'content') {
			this.heightMode = 'full';
		} else {
			this.heightMode = 'content';
		}
	}

	protected async openBottomSlide(): Promise<void> {
		const slide = await this.waitRef<bBottomSlide[]>('bottomSlide');
		await slide[0].open();
	}

	@hook('beforeCreate')
	setStageFromLocation(): void {
		const matches = /stage=(.*)/.exec(globalThis.location.search);

		if (matches != null) {
			this.stage = decodeURIComponent(matches[1]);
		}
	}
}
