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

import iStaticPage, { component, prop, field, system } from 'components/super/i-static-page/i-static-page';
import VDOM, * as VDOMAPI from 'components/friends/vdom';
import type iBlock from 'components/super/i-block/i-block';

export * from 'components/super/i-static-page/i-static-page';

VDOM.addToPrototype(VDOMAPI);

// eslint-disable-next-line no-console
console.time('Initializing');

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

	protected override readonly $refs!: iStaticPage['$refs'] & {
		dummy?: iBlock;
	};

	protected beforeCreate(): void {
		//#unless runtime has storybook
		// eslint-disable-next-line no-console
		console.time('Render');
		//#endunless
	}

	protected destroyDummy(): void {
		const {dummy} = this.$refs;

		// BUG: dummy is not removed from $refs after $destroy is called
		if (dummy != null && dummy.hook !== 'destroyed') {
			// Uncomment below to emulate dom.appendChild destructor
			// dummy.$el?.parentNode?.removeChild(dummy.$el);
			dummy.unsafe.$destroy();
		}

	}
}
