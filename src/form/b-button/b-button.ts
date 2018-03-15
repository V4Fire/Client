/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bForm from 'form/b-form/b-form';
import iData, { component, prop, ModsDecl, ModelMethods, CreateRequestOptions } from 'super/i-data/i-data';
import { RequestQuery, RequestBody } from 'core/data';
export * from 'super/i-data/i-data';

@component()
export default class bButton extends iData {
	/** @override */
	readonly dataProvider: string = 'Provider';

	/** @override */
	readonly requestFilter: Function | boolean = false;

	/**
	 * Link href
	 */
	@prop({type: String, required: false})
	readonly href?: string;

	/**
	 * Data provider method
	 */
	@prop(String)
	readonly method: ModelMethods = 'get';

	/**
	 * Request parameters
	 */
	@prop({type: [Object, Array], required: false})
	request?: RequestQuery | RequestBody | [RequestBody | RequestQuery, CreateRequestOptions];

	/**
	 * Button type
	 */
	@prop(String)
	type: string = 'button';

	/**
	 * Connected form id
	 */
	@prop({type: String, required: false})
	form?: string;

	/**
	 * Input autofocus mode
	 */
	@prop({type: Boolean, required: false})
	autofocus?: boolean;

	/**
	 * Icon before text
	 */
	@prop({type: String, required: false})
	preIcon?: string;

	/**
	 * Component for .preIcon
	 */
	@prop(String)
	preIconComponent?: string = 'b-icon';

	/**
	 * Icon after text
	 */
	@prop({type: String, required: false})
	icon?: string;

	/**
	 * Component for .icon
	 */
	@prop(String)
	iconComponent: string = 'b-icon';

	/**
	 * Tooltip text
	 */
	@prop({type: String, required: false})
	hint?: string;

	/**
	 * Tooltip position
	 */
	@prop({type: String, required: false})
	hintPos?: string;

	/** @inheritDoc */
	static mods: ModsDecl = {
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
	protected async onClick(e: Event): Promise<void> {
		// Form attribute fix for MS Edge && IE
		if (this.form && this.type === 'submit') {
			e.preventDefault();
			const form = <bForm>this.$(`#${this.form}`);
			form && await form.submit();

		} else if (this.dataProvider !== 'Provider' || this.href) {
			if (this.href) {
				this.base(this.href);
			}

			await (<Function>this[this.method])(...(<any>[]).concat(this.request || []));
		}

		await this.toggle();
		this.emit('click', e);
	}

	/* @override */
	protected created(): void {
		super.created();
		this.initCloseHelpers();
	}
}
