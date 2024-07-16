/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/html/xss/README.md]]
 * @packageDocumentation
 */

import DOMPurify, { DOMPurifyI } from 'dompurify';

import type { SanitizedOptions } from 'core/html/xss/interface';

export * from 'core/html/xss/interface';

/**
 * Sanitizes the input string value from potentially harmful HTML
 *
 * @param value
 * @param [opts] - sanitizing options
 */
export const sanitize: typeof DOMPurify['sanitize'] = (value: string | Node, opts?: SanitizedOptions) => {
	let domPurify: DOMPurifyI;

	if (SSR) {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const {JSDOM} = require('jsdom');
		const jsdom = new JSDOM();

		domPurify = DOMPurify(jsdom.window);

	} else {
		domPurify = DOMPurify(globalThis);
	}

	return Object.cast<any>(domPurify.sanitize(value, opts ?? {}));
};
