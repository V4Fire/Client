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
export default class bLink extends iData {
	/**
	 * Link href
	 */
	href: string = '#';

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
		underline: [
			['true'],
			'false'
		]
	};

	/** @override */
	get $refs(): {link: HTMLAnchorElement} {}

	/**
	 * Handler: link trigger
	 *
	 * @param e
	 * @emits click(e: Event)
	 */
	onClick(e: Event) {
		const
			{link} = this.$refs;

		if (e.target !== link && link.href) {
			link.click();

		} else {
			this.emit('click', e);
		}
	}
}
