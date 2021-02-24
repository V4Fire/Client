/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { IS_NODE } from 'core/env';
import { Options } from 'core/component/engines/zero/interface';

export const supports = {
	regular: false,
	functional: true,
	composite: true
};

export const options: Options = {
	filters: {},
	directives: {}
};

export const document: Document = (() => {
	//#if node_js
	if (IS_NODE) {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const {JSDOM} = require('jsdom');
		return (new JSDOM()).window.document;
	}
	//#endif

	return globalThis.document;
})();
