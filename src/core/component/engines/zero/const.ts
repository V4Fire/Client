/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { IS_NODE } from '@src/core/env';
import type { Options } from '@src/core/component/engines/zero/interface';

export { default as minimalCtx } from '@src/core/component/engines/zero/context';

export const supports = {
	regular: false,
	functional: true,
	composite: true,

	ssr: true,
	boundCreateElement: true
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
