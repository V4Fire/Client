/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { sanitize } from 'core/html/xss';

import type { AbstractElement } from 'core/page-meta-data/elements';
import { SSREngine, allowedTags } from 'core/page-meta-data/elements/abstract/engines';

export class SSRTitleEngine extends SSREngine {
	override render(_element: AbstractElement, tag: string, attrs: Dictionary<string>): string {
		return sanitize(`<${tag}>${attrs.text ?? ''}</${tag}>`, {
			RETURN_DOM: true,
			WHOLE_DOCUMENT: true,
			ADD_TAGS: tag === 'title' ? [tag] : [],
			ALLOWED_ATTR: allowedTags[tag] ?? []
		}).querySelector(tag)!.outerHTML;
	}
}

export const ssrTitleEngine = new SSRTitleEngine();
