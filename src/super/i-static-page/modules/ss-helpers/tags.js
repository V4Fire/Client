/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('../interface');

const
	fs = require('fs-extra-promise'),
	delay = require('delay');

const
	{src, csp} = require('config'),
	{isFolder} = include('src/super/i-static-page/modules/const');

const nonce = {
	nonce: csp.nonce
};

exports.getScriptDecl = getScriptDecl;

/**
 * Returns declaration of a script tag to load the specified library.
 * If the "inline" parameter is set to true, the function will return a promise.
 *
 * @param {(InitializedLib|body)} lib - library or raw code
 * @param {string=} [body] - library body
 * @returns {(Promise<string>|string)}
 */
function getScriptDecl(lib, body) {
	if (lib.load === false || isFolder.test(lib.src)) {
		return '';
	}

	if (Object.isString(lib)) {
		return `<script ${normalizeAttrs(nonce)}>${lib}</script>`;
	}

	const attrs = normalizeAttrs({
		...Object.reject(lib, ['source', 'inline'].concat(lib.inline || body ? 'src' : [])),
		...nonce,
		...lib.attrs
	});

	if (lib.inline && !body) {
		return (async () => {
			while (!fs.existsSync(lib.src)) {
				await delay(500);
			}

			return `<script ${attrs}>requireMonic(${lib.src})</script>`;
		})();
	}

	return `<script ${attrs}>${body || ''}</script>`;
}

exports.getStyleDecl = getStyleDecl;

/**
 * Returns declaration of a link/style tag to load the specified style library.
 * If the "inline" parameter is set to true, the function will return a promise.
 *
 * @param {(InitializedStyleLib|body)} lib - library or raw code
 * @param {string=} [body] - library body
 * @returns {(Promise<string>|string)}
 */
function getStyleDecl(lib, body) {
	if (Object.isString(lib)) {
		return `<style ${normalizeAttrs(nonce)}>${lib}</style>`;
	}

	const
		rel = lib.attrs?.rel ?? 'stylesheet';

	const attrs = normalizeAttrs({
		...Object.reject(lib, ['src', 'source', 'inline', 'defer']),
		...nonce,
		...lib.attrs,
		...lib.inline || body ? null : {href: lib.src, rel},
		...lib.defer ? {rel: 'preload', onload: `this.rel='${rel}'`} : null
	});

	if (lib.inline && !body) {
		return (async () => {
			while (!fs.existsSync(lib.src)) {
				await delay(500);
			}

			return `<style ${attrs}>requireMonic(${lib.src})</style>`;
		})();
	}

	if (body) {
		return `<style ${attrs}>${body}</style>`;
	}

	return `<link ${attrs}>`;
}

exports.getLinkDecl = getLinkDecl;

/**
 * Returns declaration of a link tag to load the specified link
 *
 * @param {InitializedLink} link
 * @returns {string}
 */
function getLinkDecl(link) {
	const attrs = normalizeAttrs({
		href: src,
		...nonce,
		...Object.reject(link, ['src', 'source']),
		...link.attrs
	});

	return `<link ${attrs}>`;
}

exports.normalizeAttrs = normalizeAttrs;

/**
 * Takes an object with tag attributes and transforms it to a list with normalized attribute declarations
 *
 * @param {Object} attrs
 * @returns {!Array<string>}
 *
 * @example
 * ```js
 * // ['defer', 'type="text/javascript"']
 * normalizeAttrs({defer: true, type: 'text/javascript'});
 * ```
 */
function normalizeAttrs(attrs) {
	const
		normalizedAttrs = [];

	if (!attrs) {
		return normalizedAttrs;
	}

	Object.keys(attrs).forEach((key) => {
		let
			val = attrs[key];

		if (Object.isFunction(val)) {
			val = val();
		}

		if (val === undefined) {
			return;
		}

		if (Object.isString(val)) {
			normalizedAttrs.push(`${key}="${val}"`);

		} else if (val) {
			normalizedAttrs.push(key);
		}
	});

	normalizedAttrs.toString = () => normalizedAttrs.join(' ');
	return normalizedAttrs;
}
