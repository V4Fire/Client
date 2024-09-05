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

import config from 'config';
import * as xss from 'core/html/xss';

import { ComponentEngine, VNode } from 'core/component/engines';
import type { SafeHtmlDirectiveParams } from 'components/directives/safe-html/interface';

export * from 'components/directives/safe-html/interface';

ComponentEngine.directive('safe-html', {
	beforeCreate({value, oldValue}: SafeHtmlDirectiveParams, vnode: VNode) {
		if (value === oldValue || SSR) {
			return;
		}

		vnode.props = {
			...vnode.props,
			innerHTML: sanitize(value)
		};
	},

	updated(el: Element, {value, oldValue}: SafeHtmlDirectiveParams): void {
		if (value === oldValue || SSR) {
			return;
		}

		el.innerHTML = sanitize(value);
	},

	getSSRProps({value, oldValue}: SafeHtmlDirectiveParams) {
		if (value === oldValue) {
			return;
		}

		return {innerHTML: sanitize(value)};
	}
});

function sanitize(value: SafeHtmlDirectiveParams['value']): string {
	if (Object.isPrimitive(value)) {
		return xss.sanitize(toString(value), config.safeHtml);
	}

	return xss.sanitize(toString(value.value), {
		...config.safeHtml,
		...value.options,

		RETURN_DOM_FRAGMENT: false,
		RETURN_DOM: false
	});

	function toString(value: SafeHtmlDirectiveParams['value']): string {
		return value == null ? '' : String(value);
	}
}
