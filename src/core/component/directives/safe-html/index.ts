/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/safe-html/README.md]]
 * @packageDocumentation
 */

import DOMPurify from 'dompurify';

import config from 'config';

import type { SafeHtmlDirectiveParams } from 'core/component/directives/safe-html/interface';

import { ComponentEngine } from 'core/component/engines';

export * from 'core/component/directives/safe-html/interface';

ComponentEngine.directive('safe-html', (el: HTMLElement, {value, oldValue}: SafeHtmlDirectiveParams) => {
	if (value === oldValue) {
		return;
	}

	let sanitized: string;

	if (Object.isPrimitive(value)) {
		sanitized = DOMPurify.sanitize(String(value), config.safeHtml);

	} else {
		sanitized = DOMPurify.sanitize(
			String(value.value),

			{
				...config.safeHtml,
				...value.options,

				RETURN_DOM_FRAGMENT: false,
				RETURN_DOM: false
			}
		);
	}

	el.innerHTML = sanitized;
});
