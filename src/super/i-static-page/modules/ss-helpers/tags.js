/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('../interface');

const
	config = require('config');

const
	fs = require('fs-extra-promise'),
	delay = require('delay'),
	buble = require('buble');

const
	{Filters} = require('snakeskin');

const
	{isFolder} = include('src/super/i-static-page/modules/const'),
	{needInline} = include('src/super/i-static-page/modules/ss-helpers/helpers');

const cspAttrs = {
	nonce: config.csp.nonce
};

const defAttrs = {
	...cspAttrs
};

exports.getScriptDecl = getScriptDecl;

/**
 * Returns code to load the specified library.
 * If the "inline" parameter is set to true, the function will return a promise.
 *
 * @param {(InitializedLib|body)} lib - library or raw code
 * @param {string=} [body] - library body
 * @returns {(Promise<string>|string)}
 *
 * @example
 * ```js
 * // <script src="..."></script>
 * getScriptDecl({src: 'node_modules/jquery/dist/jquery.js'});
 *
 * // <script>...</script>;
 * getScriptDecl({src: 'node_modules/jquery/dist/jquery.js', inline: true});
 *
 * // document.write('<script src="..."></script>');
 * getScriptDecl({src: 'node_modules/jquery/dist/jquery.js', documentWrite: true});
 *
 * // <script>var a = 1;</script>;
 * getScriptDecl('var a = 1;');
 * ```
 */
function getScriptDecl(lib, body) {
	if (lib.load === false || isFolder.test(lib.src)) {
		return '';
	}

	if (Object.isString(lib)) {
		return `<script ${normalizeAttrs(cspAttrs)}>${lib}</script>`;
	}

	body = body || '';

	const
		isInline = Boolean(needInline(lib.inline) || body);

	const attrs = normalizeAttrs({
		...Object.select(lib, isInline ? [] : ['staticAttrs', 'defer', 'src']),
		...defAttrs,
		...lib.attrs
	});

	if (isInline && !body) {
		return (async () => {
			while (!fs.existsSync(lib.src)) {
				await delay(500);
			}

			const
				body = `include('${lib.src}');`;

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
		let
			decl = `document.write(\`<script ${attrs}\` + '><' + '/script>');`;

		if (config.es() === 'ES5') {
			decl = buble.transform(decl).code;
		}

		return decl;
	}

	return `<script ${attrs}>${body}</script>`;
}

exports.getStyleDecl = getStyleDecl;

/**
 * Returns code to load the specified style library.
 * If the "inline" parameter is set to true, the function will return a promise.
 *
 * @param {(InitializedStyleLib|body)} lib - library or raw code
 * @param {string=} [body] - library body
 * @returns {(Promise<string>|string)}
 *
 * @example
 * ```js
 * // <link href="..." rel="stylesheet">
 * getStyleDecl({src: 'node_modules/font-awesome/dist/font-awesome.css'});
 *
 * // <style>...</style>
 * getStyleDecl({src: 'node_modules/font-awesome/dist/font-awesome.css', inline: true});
 *
 * // document.write('<link href="..." rel="stylesheet">');
 * getStyleDecl({src: 'node_modules/font-awesome/dist/font-awesome.css', documentWrite: true});
 * ```
 */
function getStyleDecl(lib, body) {
	if (Object.isString(lib)) {
		return `<style ${normalizeAttrs(cspAttrs)}>${lib}</style>`;
	}

	body = body || '';

	const
		rel = lib.attrs?.rel ?? 'stylesheet',
		isInline = Boolean(needInline(lib.inline) || body);

	const attrsObj = {
		staticAttrs: lib.staticAttrs,
		...isInline ? cspAttrs : defAttrs,
		...lib.attrs
	};

	if (!isInline) {
		Object.assign(attrsObj, {
			href: lib.src,
			rel
		});

		if (lib.defer) {
			Object.assign(attrsObj, {
				rel: 'stylesheet',
				media: 'print',
				onload: `this.rel='${rel}'; this.onload=null;`
			});
		}
	}

	const
		attrs = normalizeAttrs(attrsObj);

	const wrap = (decl) => {
		if (lib.documentWrite) {
			decl = `document.write(\`${decl}\`);`;

			if (isInline) {
				return decl;
			}

			if (config.es() === 'ES5') {
				decl = buble.transform(decl).code;
			}

			return decl;
		}

		return decl;
	};

	if (isInline && !body) {
		return (async () => {
			while (!fs.existsSync(lib.src)) {
				await delay(500);
			}

			return wrap(`<style ${attrs}>include('${lib.src}');</style>`);
		})();
	}

	if (body) {
		return wrap(`<style ${attrs}>${body}</style>`);
	}

	return wrap(`<link ${attrs}>`);
}

exports.getLinkDecl = getLinkDecl;

/**
 * Returns code to load the specified link
 *
 * @param {InitializedLink} link
 * @returns {string}
 *
 * @example
 * ```js
 * // <link href="...">
 * getLinkDecl({src: 'assets/favicon.ico'});
 * ```
 */
function getLinkDecl(link) {
	const attrs = normalizeAttrs({
		href: link.src,
		staticAttrs: link.staticAttrs,
		...defAttrs,
		...link.attrs
	});

	let
		decl = `<link ${attrs}>`;

	if (link.documentWrite) {
		decl = `document.write(\`${decl}\`);`;

		if (config.es() === 'ES5') {
			decl = buble.transform(decl).code;
		}
	}

	return decl;
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
			if (key === 'nonce') {
				normalizedAttrs.push(`${key}="${val}"`);

			} else {
				normalizedAttrs.push(`${key}="${Filters.html(val, null, 'attrValue')}"`);
			}

		} else if (val) {
			normalizedAttrs.push(key);
		}
	});

	normalizedAttrs.toString = () => normalizedAttrs.join(' ');
	return normalizedAttrs;
}
