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

import type { SafeHtmlDirectiveParams } from 'components/directives/safe-html/interface';

import { ComponentEngine, VNode } from 'core/component/engines';

export * from 'components/directives/safe-html/interface';

ComponentEngine.directive('safe-html', {
	beforeCreate({value, oldValue}: SafeHtmlDirectiveParams, vnode: VNode) {
		if (value === oldValue) {
			return;
		}

		let sanitized: string;

		if (typeof value === 'string') {
			sanitized = DOMPurify.sanitize(value, config.safeHtml);

		} else {
			sanitized = DOMPurify.sanitize(
				value.value,

				{
					...config.safeHtml,
					...value.options,

					RETURN_DOM_FRAGMENT: false,
					RETURN_DOM: false
				}
			);
		}

		vnode.props = {
			...vnode.props,
			innerHTML: sanitized
		};
	}
});
