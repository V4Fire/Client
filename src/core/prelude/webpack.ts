/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable camelcase */

import global from 'core/shims/global';

try {
	const
		ctx = global;

	__webpack_nonce__ = ctx[CSP_NONCE_STORE];
	__webpack_public_path__ = ctx.PUBLIC_PATH ?? PUBLIC_PATH;
} catch {}

if (!SSR) {
	globalThis.__webpack_component_styles_are_loaded__ = __webpack_component_styles_are_loaded__;
}

/**
 * Checks that styles for the given component are loaded
 * @param componentName
 */
function __webpack_component_styles_are_loaded__(componentName: string): boolean {
	try {
		const el = document.createElement('i');
		el.className = `${componentName}-is-style-loaded`;
		document.body.appendChild(el);

		const isStylesLoaded = getComputedStyle(el).color === 'rgba(0, 250, 154, 0)';
		document.body.removeChild(el);

		if (isStylesLoaded) {
			return true;
		}

	} catch (err) {
		stderr(err);
	}

	return false;
}
