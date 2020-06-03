/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

console.time('Initializing');

import iStaticPage, { component, system } from 'super/i-static-page/i-static-page';
export * from 'super/i-static-page/i-static-page';

@component({root: true})
export default class pV4ComponentsDemo extends iStaticPage {
	@system({meta: {route: 'query'}})
	rootParam?: number;

	protected beforeCreate(): void {
		console.time('Render');
	}

	protected mounted(): void {
		console.timeEnd('Render');
		console.timeEnd('Initializing');
	}
}
