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
	{Filters} = require('snakeskin');

const
	{csp} = require('config'),
	{isFolder} = include('src/super/i-static-page/modules/const'),
	{needInline} = include('src/super/i-static-page/modules/ss-helpers/helpers');

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

	body = body || '';

	const attrs = normalizeAttrs({
		...Object.select(lib, lib.inline || body ? [] : ['staticAttrs', 'defer', 'src']),
		...nonce,
		...lib.attrs
	});

	if (needInline(lib.inline) && !body) {
		return (async () => {
			while (!fs.existsSync(lib.src)) {
				await delay(500);
			}

			const
				body = `include(${lib.src})`;

			if (lib.documentWrite) {
				return `${body}\n`;
			}

			return `<script ${attrs}>${body}</script>`;
		})();
	}

	if (body) {
		if (lib.documentWrite) {
			return `${body}\n`;
		}

		return `<script ${attrs}>${body}</script>`;
	}

	if (lib.documentWrite) {
		return `document.write('<script ${attrs}' + '><' + '/script>');`;
	}

	return `<script ${attrs}>${body}</script>`;
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

	body = body || '';

	const
		rel = lib.attrs?.rel ?? 'stylesheet';

	const attrs = normalizeAttrs({
		staticAttrs: lib.staticAttrs,
		...nonce,
		...lib.attrs,
		...lib.inline || body ? null : {href: lib.src, rel},
		...lib.defer ? {rel: 'preload', onload: `this.rel='${rel}'`} : null
	});

	const
		wrap = (decl) => lib.documentWrite ? `document.write('${decl}');` : decl;

	if (needInline(lib.inline) && !body) {
		return (async () => {
			while (!fs.existsSync(lib.src)) {
				await delay(500);
			}

			return wrap(`<style ${attrs}>include(${lib.src})</style>`);
		})();
	}

	if (body) {
		return wrap(`<style ${attrs}>${body}</style>`);
	}

	return wrap(`<link ${attrs}>`);
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
		href: link.src,
		staticAttrs: link.staticAttrs,
		...nonce,
		...link.attrs
	});

	const decl = `<link ${attrs}>`;
	return link.documentWrite ? `document.write('${decl}');` : decl;
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

		if (key === 'staticAttrs') {
			normalizedAttrs.push(val);
			return;
		}

		key = Filters.html(key, null, 'attrKey');

		if (Object.isString(val)) {
			normalizedAttrs.push(`${key}="${Filters.html(val, null, 'attrValue')}"`);

		} else if (val) {
			normalizedAttrs.push(key);
		}
	});

	normalizedAttrs.toString = () => normalizedAttrs.join(' ');
	return normalizedAttrs;
}
