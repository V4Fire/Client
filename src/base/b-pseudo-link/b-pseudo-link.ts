/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bLink, { component, prop, ModelMethods, Request } from 'base/b-link/b-link';
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
	readonly requestFilter: Function | boolean = false;

	/**
	 * Data provider method
	 */
	@prop(String)
	readonly method: ModelMethods = 'get';

	/**
	 * Request parameters
	 */
	@prop({type: [Object, Array], required: false})
	readonly request?: Request;

	/** @override */
	protected async onClick(e: Event): Promise<void> {
		if (this.href) {
			this.base(this.href);
		}

		if (this.dataProvider !== 'Provider' || this.href) {
			await (<Function>this[this.method])(...(<any[]>[]).concat(this.request || []));
		}

		this.emit('click', e);
	}
}
