/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/pages/p-v4-components-demo/README.md]]
 * @packageDocumentation
 */

//#if demo
import 'models/demo/session';
//#endif

import iStaticPage, { component, system, field } from 'components/super/i-static-page/i-static-page';

export * from 'components/super/i-static-page/i-static-page';

console.time('Initializing');
import Daemons, { init } from 'components/friends/daemons';

Daemons.addToPrototype(init);

/**
 * Page with component demos.
 * Basically it uses with component tests.
 */
@component({root: true})
export default class pV4ComponentsDemo extends iStaticPage {
	static daemons = {
		logger: {
			watch: {path: 'someField', flush: 'sync'},
			hook: 'created',
			fn: console.log
		}
	};

	selfDispatching = true;

	/**
	 * Parameter to test
	 */
	@system()
	rootParam?: number;

	/**
	 * Field for tests purposes
	 */
	@field()
	someField: unknown = 'https://million-wallpapers.ru/wallpapers/6/23/345459573815142/yarkaya-svetyashhaya-zvezda-na-nochnom-nebe.jpg';

	protected beforeCreate(): void {
		console.time('Render');
	}
}
