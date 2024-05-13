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

//#if demo
import 'models/demo/session';
//#endif

import iStaticPage, { component, system, field } from 'super/i-static-page/i-static-page';

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
	 * Field for tests purposes
	 */
	@field()
	someField: unknown = 'foo';

	protected beforeCreate(): void {
		console.time('Render');
	}

	protected mounted(): void {
		console.timeEnd('Render');
		console.timeEnd('Initializing');
	}
}
