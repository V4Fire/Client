/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('../interface');

const
	$C = require('collection.js'),
	config = require('config');

const
	fs = require('fs-extra'),
	delay = require('delay'),
	buble = require('buble');

const
	{csp} = config,
	{Filters} = require('snakeskin');

const
	{hasInclude, escapeStringLiteralRgxp} = include('build/replacers/include.js'),
	{isFolder} = include('src/super/i-static-page/modules/const'),
	{needInline} = include('src/super/i-static-page/modules/ss-helpers/helpers');

const
	nonce = csp.nonce();

const defAttrs = {
	// eslint-disable-next-line no-nested-ternary
	nonce: nonce ? csp.postProcessor ? nonce : [`window['${csp.nonceStore()}']`] : undefined
};

const defInlineAttrs = {
	nonce: nonce != null && csp.postProcessor ? nonce : undefined
};

exports.getScriptDecl = getScriptDecl;

/**
 * Returns code to load the specified library.
 * If the `inline` parameter is set to `true`, the function will return a promise.
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
 * // (function () {
 * //   var el = document.createElement('script');
 * //   el.src = '...';
 * //   (document.body || document.head).appendChild(el);
 * // })();
 * getScriptDecl({src: 'node_modules/jquery/dist/jquery.js', js: true});
 *
 * // document.write('<script src="..."></script>');
 * getScriptDecl({src: 'node_modules/jquery/dist/jquery.js', js: true, defer: false});
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
		return `<script ${normalizeAttrs(defInlineAttrs)}>${lib}</script>`;
	}

	body = body || '';

	const
		isInline = Boolean(needInline(lib.inline) || body),
		createElement = lib.js && lib.defer !== false;

	let
		attrs,
		props = '';

	if (isInline) {
		attrs = normalizeAttrs({
			staticAttrs: lib.staticAttrs,
			...defInlineAttrs,
			...lib.attrs
		}, createElement);

	} else {
		const attrsObj = {
			src: lib.src,
			staticAttrs: lib.staticAttrs,
			...defAttrs,
			...lib.attrs
		};

		if (attrsObj.async) {
			if (createElement) {
				delete attrsObj.async;
			}

		} else if (createElement) {
			props += 'el.async = false;';

		} else if (!lib.js && lib.defer !== false) {
			attrsObj.defer = null;
		}

		attrs = normalizeAttrs(attrsObj, createElement);
	}

	if (isInline && !body) {
		return (async () => {
			while (!fs.existsSync(lib.src)) {
				await delay(500);
			}

			const
				body = `include('${lib.src}');`;

			if (lib.js) {
				return `${body}\n`;
			}

			return `<script ${attrs}>${body}</script>`;
		})();
	}

	if (body) {
		if (lib.js) {
			return `${body}\n`;
		}

		return `<script ${attrs}>${body}</script>`;
	}

	if (createElement) {
		return `
(function () {
	var el = document.createElement('script');
	${props}
	${attrs}
	document.head.appendChild(el);
})();
`;
	}

	if (lib.js) {
		let
			decl = `document.write(\`<script ${attrs}\` + '><' + '/script>');`;

		if (/ES[35]$/.test(config.es())) {
			decl = buble.transform(decl).code;
		}

		return decl;
	}

	return `<script ${attrs}>${body}</script>`;
}

exports.getStyleDecl = getStyleDecl;

/**
 * Returns code to load the specified style library.
 * If the `inline` parameter is set to `true`, the function will return a promise.
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
 * // (function () {
 * //   var el = document.createElement('link');
 * //   el.href = '...';
 * //   el.setAttribute('rel', 'stylesheet');
 * //   (document.body || document.head).appendChild(el);
 * // })();
 * getStyleDecl({src: 'node_modules/font-awesome/dist/font-awesome.css', js: true});
 * ```
 */
function getStyleDecl(lib, body) {
	if (Object.isString(lib)) {
		return `<style ${normalizeAttrs(defInlineAttrs)}>${lib}</style>`;
	}

	body = body || '';

	const
		rel = lib.attrs?.rel ?? 'stylesheet',
		isInline = Boolean(needInline(lib.inline) || body);

	const attrsObj = {
		staticAttrs: lib.staticAttrs,
		...isInline ? defInlineAttrs : defAttrs,
		...lib.attrs
	};

	let
		decl = '';

	if (!isInline) {
		Object.assign(attrsObj, {
			href: lib.src,
			rel
		});

		if (lib.defer !== false) {
			Object.assign(attrsObj, {
				media: 'print',
				onload: `this.media='${lib.attrs?.media ?? 'all'}'; this.onload=null;`
			});

			const preloadAttrs = $C.extend(true, {}, lib, {
				defer: false,
				attrs: {
					rel: 'preload',
					as: 'style'
				}
			});

			decl = getStyleDecl(preloadAttrs);
		}
	}

	const
		attrs = normalizeAttrs(attrsObj, lib.js);

	if (isInline && !body) {
		return (async () => {
			while (!fs.existsSync(lib.src)) {
				await delay(500);
			}

			if (lib.js) {
				decl += createTag('style', `include('${lib.src}');`);

			} else {
				decl += `<style ${attrs}>include('${lib.src}');</style>`;
			}

			return decl;
		})();
	}

	if (body) {
		if (lib.js) {
			decl += createTag('style', body);

		} else {
			decl += `<style ${attrs}>${body}</style>`;
		}

	} else if (lib.js) {
		decl += createTag('link');

	} else {
		decl += `<link ${attrs}>`;
	}

	return decl;

	function createTag(tag, content) {
		if (content) {
			if (hasInclude.test(content)) {
				content = `
//#set convertToStringLiteral
el.innerHTML = ${content}
//#unset convertToStringLiteral
`;

			} else {
				content = `el.innerHTML = \`${content.replace(escapeStringLiteralRgxp, '\\$1')}\`;`;

				if (/ES[35]$/.test(config.es())) {
					content = buble.transform(content).code;
				}
			}
		}

		return `
(function () {
	var el = document.createElement('${tag}');
	${content || ''}
	${attrs}
	document.head.appendChild(el);
})();
`;
	}
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
	const tag = link.tag || 'link';

	const attrs = normalizeAttrs({
		href: link.src,
		staticAttrs: link.staticAttrs,
		...defAttrs,
		...link.attrs
	}, link.js);

	if (link.js) {
		return `
(function () {
	var el = document.createElement('${tag}');
	${attrs}
	document.head.appendChild(el);
})();
`;
	}

	return `<${tag} ${attrs}>`;
}

exports.normalizeAttrs = normalizeAttrs;

/**
 * Takes an object with tag attributes and transforms it to a list with normalized attribute declarations
 *
 * @param {Object=} [attrs]
 * @param {boolean=} [dynamic] - if true, the attributes are applied dynamically via `setAttribute`
 * @returns {!Array<string>}
 *
 * @example
 * ```js
 * // ['defer', 'type="text/javascript"']
 * normalizeAttrs({defer: true, type: 'text/javascript'});
 *
 * // ["el.setAttribute('defer', 'defer');", "el.setAttribute('type', 'text/javascript');"]
 * normalizeAttrs({defer: true, type: 'text/javascript'}, true);
 * ```
 */
function normalizeAttrs(attrs, dynamic = false) {
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

		const
			needWrap = Object.isString(val);

		if (dynamic) {
			const normalize = (str) => str.replace(/'/g, "\\'");
			key = normalize(key);

			let
				attr;

			if (key === 'staticAttrs') {
				attr = `
	var tmpEl = document.createElement('div');
	tmpEl.innerHTML = '<div ${normalize(val)}></div>';
	tmpEl = tmpEl.children[0];
	var tmpElAttrs = tmpEl.attributes;
	for (var i = 0; i < tmpElAttrs.length; i++) {
		el.setAttribute(tmpElAttrs[i].name, tmpElAttrs[i].value);
	}
`;
			} else if (needWrap) {
				attr = `el.setAttribute('${key}', '${val == null ? key : normalize(val)}');`;

			} else {
				attr = `el.setAttribute('${key}', ${val});`;
			}

			normalizedAttrs.push(attr);
			return;
		}

		if (key === 'staticAttrs') {
			normalizedAttrs.push(val);
			return;
		}

		key = Filters.html(key, null, 'attrKey');

		if (needWrap) {
			val = Filters.html(val, null, 'attrValue');
			normalizedAttrs.push(`${key}="${val}"`);

		} else if (val == null) {
			normalizedAttrs.push(key);

		} else {
			normalizedAttrs.push(`${key}="\${${val}}"`);
		}
	});

	normalizedAttrs.toString = () => normalizedAttrs.join(dynamic ? '\n\t' : ' ');
	return normalizedAttrs;
}
