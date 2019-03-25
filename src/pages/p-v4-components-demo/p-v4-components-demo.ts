/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iStaticPage, { component, field, system, watch } from 'super/i-static-page/i-static-page';
export * from 'super/i-static-page/i-static-page';

@component({root: true})
export default class pV4ComponentsDemo extends iStaticPage {
	@field()
	page: number = 20;

	@system()
	foo: number = 1;

	created() {
		this.async.setTimeout(() => {
			// this.page = 50;
		}, 4500);
	}

	beforeCreate() {
		console.time('A');
	}

	mounted() {
		console.timeEnd('A');
	}
}
