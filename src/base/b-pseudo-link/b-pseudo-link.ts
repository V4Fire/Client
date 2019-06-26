/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

//#if runtime has core/data
import 'core/data';
//#endif

import bLink, { component, prop, ModelMethods, RequestFilter } from 'base/b-link/b-link';
export * from 'base/b-link/b-link';

@component({
	functional: {
		dataProvider: undefined,
		href: undefined
	}
})

export default class bPseudoLink extends bLink {
	/** @override */
	readonly dataProvider: string = 'Provider';

	/** @override */
	readonly href: string = '';

	/** @override */
	readonly requestFilter: RequestFilter = false;

	/**
	 * Data provider method
	 */
	@prop(String)
	readonly method: ModelMethods = 'get';

	/** @override */
	protected async onClick(e: Event): Promise<void> {
		if (this.href) {
			this.base(this.href);
		}

		if (this.dataProvider !== 'Provider' || this.href) {
			await (<Function>this[this.method])();
		}

		this.emit('click', e);
	}
}
