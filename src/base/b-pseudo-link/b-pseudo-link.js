'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bLink from 'base/b-link/b-link';
import { component } from 'core/component';

@component()
export default class bPseudoLink extends bLink {
	/** @override */
	dataProvider: string = 'Provider';

	/** @override */
	href: string = '';

	/** @override */
	requestFilter: Function | boolean = false;

	/**
	 * Data provider method
	 */
	method: ?string = 'get';

	/**
	 * Request parameters
	 */
	request: ?Object | Array<Object>;

	/* eslint-disable no-unused-vars */

	/** @override */
	async onClick(e: Event) {
		if (this.href) {
			this.base(this.href);
		}

		if (this.dataProvider !== 'Provider' || this.href) {
			await this[this.method](...[].concat(this.request || []));
		}

		this.emit('click', e);
	}

	/* eslint-enable no-unused-vars */
}
