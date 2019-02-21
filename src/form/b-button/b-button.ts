/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import 'core/data';
import bForm from 'form/b-form/b-form';
import iData, { component, prop, ModsDecl, ModelMethods, RequestFilter } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

export type ButtonType<T extends string = any> =
	'submit' |
	'button' |
	'image' |
	'link' |
	T;

@component({
	functional: {
		dataProvider: undefined,
		href: undefined
	}
})

export default class bButton<T extends Dictionary = Dictionary> extends iData<T> {
	/** @override */
	readonly dataProvider: string = 'Provider';

	/** @override */
	readonly requestFilter: RequestFilter = false;

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
	 * Button type
	 */
	@prop(String)
	readonly type: ButtonType = 'button';

	/**
	 * Connected form id
	 */
	@prop({type: String, required: false})
	readonly form?: string;

	/**
	 * Input autofocus mode
	 */
	@prop({type: Boolean, required: false})
	readonly autofocus?: boolean;

	/**
	 * Icon before text
	 */
	@prop({type: String, required: false})
	readonly preIcon?: string;

	/**
	 * Component for .preIcon
	 */
	@prop(String)
	readonly preIconComponent?: string;

	/**
	 * Icon after text
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/**
	 * Component for .icon
	 */
	@prop(String)
	readonly iconComponent?: string;

	/**
	 * Tooltip text
	 */
	@prop({type: String, required: false})
	readonly hint?: string;

	/**
	 * Tooltip position
	 */
	@prop({type: String, required: false})
	readonly hintPos?: string;

	/**
	 * Dropdown position
	 */
	@prop(String)
	readonly dropdown: string = 'bottom';

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		theme: [
			bButton.PARENT,
			'icon'
		],

		rounding: [
			'none',
			['small'],
			'normal',
			'big'
		],

		upper: [
			'true',
			['false']
		],

		opened: [
			bButton.PARENT,
			['false']
		]
	};

	/** @override */
	protected readonly $refs!: {button: HTMLButtonElement};

	/**
	 * Handler: button trigger
	 *
	 * @param e
	 * @emits click(e: Event)
	 */
	protected async onClick(e: Event): Promise<void> {
		if (this.type !== 'link') {
			if (this.dataProvider !== 'Provider' || this.href) {
				if (this.href) {
					this.base(this.href);
				}

				await (<Function>this[this.method])();

			// Form attribute fix for MS Edge && IE
			} else if (this.form && this.type === 'submit') {
				e.preventDefault();
				const form = <bForm>this.$(`#${this.form}`);
				form && await form.submit();
			}

			await this.toggle();
		}

		this.emit('click', e);
	}
}
