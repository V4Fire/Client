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

import iStaticPage, { component, prop, field, system, hook, watch } from 'components/super/i-static-page/i-static-page';
import VDOM, * as VDOMAPI from 'components/friends/vdom';

export * from 'components/super/i-static-page/i-static-page';

console.time('init');

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

	@hook('beforeCreate')
	setStageFromLocation(): void {
		const matches = /stage=(.*)/.exec(globalThis.location.search);

		if (matches != null) {
			this.stage = decodeURIComponent(matches[1]);
		}
	}
}
