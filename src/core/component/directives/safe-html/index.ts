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

import type { SafeHtmlDirectiveParams } from 'core/component/directives/safe-html/interface';

import { ComponentEngine, VNode } from 'core/component/engines';

export * from 'core/component/directives/safe-html/interface';

ComponentEngine.directive('safe-html', {
	beforeCreate({value, oldValue}: SafeHtmlDirectiveParams, vnode: VNode) {
		if (value === oldValue) {
			return;
		}

		let sanitized: string;

		if (typeof value === 'string') {
			sanitized = DOMPurify.sanitize(value, {USE_PROFILES: {html: true}});
		} else {
			sanitized = DOMPurify.sanitize(
				value.value,
				{
					USE_PROFILES: {html: true},
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
