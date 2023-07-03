/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable camelcase,no-new-func */

try {
	const
		ctx = Function('return this')();

	__webpack_nonce__ = ctx[CSP_NONCE_STORE];
	__webpack_public_path__ = ctx.PUBLIC_PATH ?? PUBLIC_PATH;
} catch {}

/**
 * Checks that styles for the given component are loaded
 * @param componentName
 */
function checkComponentStylesAreLoaded(componentName: string): boolean {
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

globalThis.checkComponentStylesAreLoaded = checkComponentStylesAreLoaded;
