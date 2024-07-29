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
import DOM from 'core/const/dom';

import type { SanitizedOptions } from 'core/html/xss/interface';

export * from 'core/html/xss/interface';

/**
 * Sanitizes the input string value from potentially harmful HTML
 *
 * @param value
 * @param [opts] - sanitizing options
 */
export const sanitize: typeof DOMPurify['sanitize'] = (value: string | Node, opts?: SanitizedOptions) => {
	const domPurify: DOMPurifyI = DOMPurify(DOM.window);

	return Object.cast<any>(domPurify.sanitize(value, opts ?? {}));
};
