'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	Snakeskin = require('snakeskin');

const
	{Vars} = Snakeskin;

module.exports = [
	/**
	 * Expands the `_` snippet as a `<${rootTag}>` tag
	 *
	 * @param {string} tag
	 * @param {!Object} attrs
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
			if (rootTag) {
				return rootTag;
			}

			attrs['v-tag'] = ["rootTag || 'div'"];
			return 'div';
		}

		return tag;
	},

	/**
	 * Expands the `:section` and `:/section` snippets.
	 * These snippets help to use semantics HTML tags, like `article` or `section` and don't care about `h` types.
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
	 * Expands the `a:void` snippet as a `<a href="javascript:void(0)">` tag
	 *
	 * @param {string} tag
	 * @param {!Object} attrs
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
	 * Expands the `button:link` snippet as a `<button class="a">` tag
	 *
	 * @param {string} tag
	 * @param {!Object} attrs
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
			attrs.class = (attrs.class || []).concat('a');
			return 'button';
		}

		return tag;
	},

	/**
	 * Expands the `@component` snippet as a `<component v4-flyweight-component>` tag
	 *
	 * @param {string} tag
	 * @param {!Object} attrs
	 * @returns {string}
	 *
	 * @example
	 * ```
	 * /// <span v4-flyweight-component="b-button"></span>
	 * < @b-button
	 * ```
	 */
	function expandFlyweightComponent(tag, attrs) {
		const
			flyweightPrfx = '@';

		if (tag.startsWith(flyweightPrfx)) {
			attrs['v4-flyweight-component'] = [tag.slice(flyweightPrfx.length)];
			attrs[':instance-of'] = attrs['v4-flyweight-component'];
			return 'span';
		}

		return tag;
	}
];
