/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:pages/p-v4-components-demo/README.md]]
 * @packageDocumentation
 */

import iStaticPage, { component, system } from 'super/i-static-page/i-static-page';
import { testRoutes } from 'pages/p-v4-components-demo/const';

export * from 'super/i-static-page/i-static-page';

console.time('Initializing');

/**
 * Page with component demo-s.
 * Basically it uses with component tests.
 */
@component({root: true})
export default class pV4ComponentsDemo extends iStaticPage {
	/**
	 * Parameter to test
	 */
	@system()
	rootParam?: number;

	/**
	 * Routes schema to test
	 */
	@system()
	testRoutes: Dictionary = testRoutes;

	protected beforeCreate(): void {
		console.time('Render');
	}

	protected mounted(): void {
		console.timeEnd('Render');
		console.timeEnd('Initializing');
	}
}
