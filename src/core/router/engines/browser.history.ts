/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { deprecate } from '@src/core/functools/deprecation';

export * from '@src/core/router/engines/browser-history';
export { default } from '@src/core/router/engines/browser-history';

deprecate({
	name: 'browser.history',
	type: 'module',
	renamedTo: 'browser-history'
});
