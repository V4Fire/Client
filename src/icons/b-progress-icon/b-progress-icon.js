'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iFunctional from 'super/i-functional/i-functional';
import { component } from 'core/component';

@component({functional: true})
export default class bProgressIcon extends iFunctional {
	/** @override */
	rootTag: string = 'span';

	/** @override */
	render(el: Function, ctx?: Object, attrs?: Object, children?: Array): Object {
		const b = ctx.props.componentName;
		return super.render(el, ctx, attrs, [].concat(children || [], [
			el('span', {class: `${b}__root-wrapper`}, [
				el('span', {class: `${b}__loader`}),
				el('span', {class: `${b}__i`})
			])
		]));
	}
}
