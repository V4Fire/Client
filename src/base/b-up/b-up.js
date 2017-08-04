'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iBlock from 'super/i-block/i-block';
import { component } from 'core/component';

export const
	$$ = new Store();

@component()
export default class bUp extends iBlock {
	/** @inheritDoc */
	static mods = {
		hidden: [
			['true'],
			'false'
		]
	};

	/** @inheritDoc */
	mounted() {
		const
			{async: $a} = this;

		$a.on(document, 'scroll', {
			label: $$.scroll,
			fn: () => this.setMod('hidden', !(pageYOffset > innerHeight / 3))
		});

		$a.on(this.$el, 'click', {
			label: $$.up,
			fn: () => window.scrollTo(0, 0)
		});
	}
}
