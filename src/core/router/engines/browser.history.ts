/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { deprecate } from 'core/functools/deprecation';

export * from 'core/router/engines/browser-history';
export { default } from 'core/router/engines/browser-history';

deprecate({
	name: 'browser.history',
	type: 'module',
	renamedTo: 'browser-history'
});
