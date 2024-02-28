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

import DOMPurifyV2 from 'dompurify-v2';
import DOMPurifyV3 from 'dompurify-v3';

import config from 'config';
import type { SafeHtmlDirectiveParams, Strategy } from 'components/directives/safe-html/interface';

import { ComponentEngine, VNode } from 'core/component/engines';

export * from 'components/directives/safe-html/interface';

ComponentEngine.directive('safe-html', {
	beforeCreate({value, oldValue}: SafeHtmlDirectiveParams, vnode: VNode) {
		if (value === oldValue) {
			return;
		}

		const strategy = getSanitizingStrategy(value);
		let sanitized: string;

		if (typeof value === 'string') {
			sanitized = strategy.sanitize(value, config.safeHtml);

		} else {
			sanitized = strategy.sanitize(
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

function getSanitizingStrategy(value: SafeHtmlDirectiveParams['value']): Strategy {
	if (typeof value !== 'string' && 'use' in value && value.use != null) {
		return value.use;
	}

	return ES.toLowerCase() === 'es5' ? DOMPurifyV2 : DOMPurifyV3;
}
