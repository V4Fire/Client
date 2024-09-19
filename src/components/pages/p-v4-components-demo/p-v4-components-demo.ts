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

import iStaticPage, { component, prop, field, system, hook } from 'components/super/i-static-page/i-static-page';
import VDOM, * as VDOMAPI from 'components/friends/vdom';
import type iBlock from 'components/super/i-block/i-block';

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

	override readonly $refs!: iStaticPage['$refs'] & {
		dummy: iBlock;
	};

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

	mounted(): void {
		const reload = this.$refs.dummy.reload.bind(this.$refs.dummy);

		this.$refs.dummy.unsafe.async.worker(() => {
			console.log(performance.now(), 'b-dummy destroyed');
			setTimeout(reload, 2000);
		});

		this.$refs.dummy.unsafe.$destroy();
	}
}
