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
import State, { initFromRouter, initFromStorage } from 'components/friends/state';
import VDOM, * as VDOMAPI from 'components/friends/vdom';

State.addToPrototype({initFromRouter, initFromStorage});

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

	override readonly syncRouterStoreOnInit: boolean = true;

	/**
	 * Parameter to test
	 */
	@system()
	rootParam?: number;

	/**
	 * Field for tests purposes
	 */
	@field()
	someField: number = 0;

	@hook('beforeCreate')
	setStageFromLocation(): void {
		const matches = /stage=(.*)/.exec(globalThis.location.search);

		if (matches != null) {
			this.stage = decodeURIComponent(matches[1]);
		}
	}

	mounted(): void {
		void this.router?.replace('main');
	}

	protected override syncRouterState(data?: Dictionary, type: string = 'component'): Dictionary {
		if (type === 'remote') {
			return {
				page: this.someField === 0 ? null : this.someField
			};
		}

		return {
			someField: Object.isNumber(data?.page) ? data?.page : 0
		};
	}

	protected onClick(page: number): void {
		this.someField = page;
	}
}
