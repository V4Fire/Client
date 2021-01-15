/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers');

/**
 * Emulates once swipe on slider
 *
 * @param {Page} page
 * @returns {Promise<void>}
 */
async function swipeOnce(page) {
	const
		selector = h.dom.elNameGenerator('.b-slider', 'window'),
		el = await h.dom.waitForEl(page, selector);

	const create = (clientX, selector) => page.evaluateHandle(({clientX, selector}) => ({
		touches: [
			new globalThis.Touch({
				clientX,
				target: document.querySelector(selector),
				identifier: Math.random()
			})
		]
	}), {clientX, selector});

	el.dispatchEvent('touchstart', await create(220, selector));
	el.dispatchEvent('touchmove', await create(120, selector));
	el.dispatchEvent('touchend', await create(0, selector));
}

/**
 * Initializes slider
 *
 * @param {Page} page
 * @param attrs
 * @param content
 * @returns {Promise<CanUndef<Playwright.JSHandle>|any>}
 */
async function initSlider(page, {attrs, content} = {}) {
	await page.evaluate(({attrs, content}) => {
		globalThis.removeCreatedComponents();

		Object.forEach(content, (el, key) => {
			// eslint-disable-next-line no-new-func
			content[key] = /return /.test(el) ? Function(el)() : el;
		});

		Object.forEach(attrs, (el, key) => {
			// eslint-disable-next-line no-new-func
			attrs[key] = /return /.test(el) ? Function(el)() : el;
		});

		const baseAttrs = {
			id: 'target'
		};

		const scheme = [
			{
				attrs: {
					...baseAttrs,
					...attrs
				},

				content
			}
		];

		globalThis.renderComponents('b-slider', scheme);
	}, {attrs, content});

	await h.bom.waitForIdleCallback(page);
	await h.component.waitForComponentStatus(page, '.b-slider', 'ready');
	return h.component.waitForComponent(page, '#target');
}

module.exports = {
	swipeOnce,
	initSlider
};
