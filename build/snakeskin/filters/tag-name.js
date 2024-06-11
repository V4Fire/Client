/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	Snakeskin = require('snakeskin');

const
	{webpack} = require('@config/config'),
	{Vars} = Snakeskin;

module.exports = [
	/**
	 * Expands the `_` snippet as `<div v-tag=${rootTag}>`
	 *
	 * @param {string} tag
	 * @param {object} attrs
	 * @param {string} rootTag
	 * @returns {string}
	 *
	 * @example
	 * ```
	 * - rootTag = 'span'
	 *
	 * /// <span class="foo"><span class="bar"></span</span
	 * < _.foo
	 *   < _.bar
	 * ```
	 */
	function expandRootTag(tag, attrs, rootTag) {
		if (tag === '_') {
			const tag = rootTag ? [JSON.stringify(rootTag)] : ["rootTag || 'div'"];
			attrs['v-tag'] = tag;

			if (webpack.ssr) {
				attrs[':is'] = tag;
				return 'component';
			}

			return 'div';
		}

		return tag;
	},

	/**
	 * Expands the `:section` and `:/section` snippets.
	 * These snippets facilitate the use of semantic HTML tags, like `<article>` or `<section>`,
	 * without worrying about heading levels.
	 *
	 * @param {string} tag
	 * @returns {string}
	 *
	 * @example
	 * ```
	 * /// <article><h2>Foo</h2></article>
	 * < article:section
	 *   < h1
	 *     Foo
	 * < :/section
	 * ```
	 */
	function expandSection(tag) {
		Vars.h = Vars.h ?? 0;

		if (/^(.*):section$/.test(tag)) {
			if (Vars.h < 6) {
				Vars.h++;
			}

			return RegExp.$1.trim() || 'section';
		}

		if (/^(.*):-section$/.test(tag)) {
			if (Vars.h > 0) {
				Vars.h--;
			}

			return '?';
		}

		if (/^h(\d)$/.test(tag)) {
			const v = Number(RegExp.$1) + Vars.h;
			return `h${v < 6 ? v : 6}`;
		}

		return tag;
	},

	/**
	 * Expands the `a:void` snippet as `<a href="javascript:void(0)">`
	 *
	 * @param {string} tag
	 * @param {object} attrs
	 * @returns {string}
	 *
	 * @example
	 * ```
	 * /// <a class="bar" href="javascript:void(0)"></a>
	 * < a:void.bar
	 * ```
	 */
	function expandVoidLink(tag, attrs) {
		if (/^a:void$/.test(tag)) {
			attrs.href = ['javascript:void(0)'];
			return 'a';
		}

		return tag;
	},

	/**
	 * Expands the `button:link` snippet as `<button class="a">`
	 *
	 * @param {string} tag
	 * @param {object} attrs
	 * @returns {string}
	 *
	 * @example
	 * ```
	 * /// <button class="bar a"></button>
	 * < button:link.bar
	 * ```
	 */
	function expandButtonLink(tag, attrs) {
		if (/^button:a$/.test(tag)) {
			attrs.type = ['button'];
			attrs.class = Array.concat([], attrs.class, 'a');
			return 'button';
		}

		return tag;
	}
];
