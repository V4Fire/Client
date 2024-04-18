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
import DOMPurify from 'dompurify';

import { ComponentEngine, VNode } from 'core/component/engines';
import type { SafeHtmlDirectiveParams } from 'components/directives/safe-html/interface';

export * from 'components/directives/safe-html/interface';

ComponentEngine.directive('safe-html', {
	beforeCreate({value, oldValue}: SafeHtmlDirectiveParams, vnode: VNode) {
		if (SSR) {
			return;
		}

		if (value === oldValue) {
			return;
		}

		vnode.props = {
			...vnode.props,
			innerHTML: sanitize(value)
		};
	},

	getSSRProps({value, oldValue}: SafeHtmlDirectiveParams) {
		if (value === oldValue) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const {JSDOM} = require('jsdom');
		const jsdom = new JSDOM();

		return {innerHTML: sanitize(value, jsdom.window)};
	}
});

function sanitize(value: SafeHtmlDirectiveParams['value'], windowObject: typeof globalThis = globalThis): string {
	const domPurify = DOMPurify(windowObject);

	if (typeof value === 'string') {
		return domPurify.sanitize(value, config.safeHtml);

	}

	return domPurify.sanitize(
		value.value,

		{
			...config.safeHtml,
			...value.options,

			RETURN_DOM_FRAGMENT: false,
			RETURN_DOM: false
		}
	);
}
