'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iFunctional from 'super/i-functional/i-functional';
import bSelect from 'form/b-select/b-select';
import { component } from 'core/component';

@component({functional: true})
export default class bSelectPh extends iFunctional {
	/** @override */
	rootTag: string = 'span';

	/** @override */
	shim: ?Function = bSelect;

	/**
	 * Block value
	 */
	value: ?string;

	/**
	 * Icon before input
	 */
	preIcon: ?string;

	/**
	 * Component for .preIcon
	 */
	preIconComponent: ?string = 'b-icon';

	/**
	 * Tooltip text for the preIcon
	 */
	preIconHint: ?string;

	/**
	 * Tooltip position for the preIcon
	 */
	preIconHintPos: ?string;

	/**
	 * Icon after input
	 */
	icon: ?string;

	/**
	 * Component for .icon
	 */
	iconComponent: ?string = 'b-icon';

	/**
	 * Tooltip text for the icon
	 */
	iconHint: ?string;

	/**
	 * Tooltip position for the icon
	 */
	iconHintPos: ?string;

	/** @override */
	render(el: Function, ctx?: Object, attrs?: Object, children?: Array): Object {
		const
			p = ctx.props;

		p.componentName = 'b-select';
		p.tplComponentName = 'b-select-ph';

		return super.render(el, ctx, attrs, children);
	}
}
