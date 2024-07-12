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

import DOMPurify from 'dompurify';

import type { SanitizedOptions } from 'core/html/xss/interface';

export * from 'core/html/xss/interface';

/**
 * Sanitizes the input string value from potentially harmful HTML
 *
 * @param value
 * @param [opts] - sanitizing options
 */
export function sanitize(value: string, opts?: SanitizedOptions): string {
	let domPurify: ReturnType<typeof DOMPurify>;

	if (SSR) {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const {JSDOM} = require('jsdom');
		const jsdom = new JSDOM();

		domPurify = DOMPurify(jsdom.window);

	} else {
		domPurify = DOMPurify(globalThis);
	}

	return domPurify.sanitize(value, {
		...opts,
		RETURN_DOM_FRAGMENT: false,
		RETURN_DOM: false
	});
}
