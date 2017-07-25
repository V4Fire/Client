'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData from 'super/i-data/i-data';
import { component } from 'core/component';

@component()
export default class bButton extends iData {
	/** @override */
	dataProvider: string = 'Provider';

	/** @override */
	requestFilter: Function | boolean = false;

	/**
	 * Link href
	 */
	href: ?string;

	/**
	 * Data provider method
	 */
	method: ?string = 'get';

	/**
	 * Request parameters
	 */
	request: ?Object | Array<Object>;

	/**
	 * Button type
	 */
	type: string = 'button';

	/**
	 * Connected form id
	 */
	form: ?string;

	/**
	 * Input autofocus mode
	 */
	autofocus: ?boolean;

	/**
	 * Icon before text
	 */
	preIcon: ?string;

	/**
	 * Component for .preIcon
	 */
	preIconComponent: ?string = 'b-icon';

	/**
	 * Icon after text
	 */
	icon: ?string;

	/**
	 * Component for .icon
	 */
	iconComponent: ?string = 'b-icon';

	/**
	 * Tooltip text
	 */
	hint: ?string;

	/**
	 * Tooltip position
	 */
	hintPos: ?string;

	/** @inheritDoc */
	static mods = {
		rounding: [
			'none',
			['small'],
			'normal',
			'big'
		]
	};

	/**
	 * Handler: button trigger
	 *
	 * @param e
	 * @emits click(e: Event)
	 */
	async onClick(e: Event) {
		// Form attribute fix for MS Edge && IE
		if (this.form && this.type === 'submit') {
			e.preventDefault();
			const form = this.$(`#${this.form}`);
			form && await form.submit();

		} else if (this.dataProvider !== 'Provider' || this.href) {
			if (this.href) {
				this.base(this.href);
			}

			await this[this.method](...[].concat(this.request || []));
		}

		await this.toggle();
		this.emit('click', e);
	}

	/* @override */
	created() {
		this.initCloseHelpers();
	}
}
