/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component, prop, ModsDecl } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bLink<T extends Dictionary = Dictionary> extends iData<T> {
	/**
	 * Link href
	 */
	@prop(String)
	readonly href: string = '#';

	/**
	 * Icon before text
	 */
	@prop({type: String, required: false})
	preIcon?: string;

	/**
	 * Component for .preIcon
	 */
	@prop(String)
	preIconComponent: string = 'b-icon';

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
	static readonly mods: ModsDecl = {
		underline: [
			['true'],
			'false'
		]
	};

	/** @override */
	protected readonly $refs!: {link: HTMLAnchorElement};

	/**
	 * Handler: link trigger
	 *
	 * @param e
	 * @emits click(e: Event)
	 */
	protected onClick(e: Event): void {
		const
			{link} = this.$refs;

		if (e.target !== link && link.href) {
			link.click();

		} else {
			this.emit('click', e);
		}
	}
}
