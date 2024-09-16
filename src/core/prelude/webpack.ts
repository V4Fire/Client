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

const loadedStyles = new Set();
const loadedStylesIndexed = Symbol('loadedStylesIndexed');

/**
 * Checks that styles for the given component are loaded
 * @param componentName
 */
function __webpack_component_styles_are_loaded__(componentName: string): boolean {
	try {
		const loaded = loadedStyles.has(componentName);

		if (loaded) {
			return true;
		}

		const {styleSheets} = document;

		for (let i = 0; i < styleSheets.length; i++) {
			const rules = styleSheets[i].cssRules;

			if (rules[loadedStylesIndexed] === true) {
				continue;
			}

			for (let r = 0; r < rules.length; r++) {
				const selector: CanUndef<string> = rules[r]['selectorText'];

				if (selector?.endsWith('-is-style-loaded')) {
					const component = selector.slice(1, -'-is-style-loaded'.length);
					loadedStyles.add(component);
				}

			}

			rules[loadedStylesIndexed] = true;
		}

		return loadedStyles.has(componentName);

	} catch (err) {
		stderr(err);
	}

	return false;
}
