// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers').default;

/**
 * Emulates the `once` swipe on a slider
 *
 * @param {Page} page
 * @returns {!Promise<void>}
 */
async function swipeOnce(page) {
	const
		selector = h.dom.elNameGenerator('.b-slider', 'window'),
		el = await h.dom.waitForEl(page, selector);

	const create = (clientX, selector) => page.evaluateHandle(({clientX, selector}) => ({
		touches: [
			new Touch({
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
 * Initializes a slider
 *
 * @param {Page} page
 * @param {Object=} [attrs]
 * @param {Object=} [content]
 * @returns {!Promise<Playwright.JSHandle>}
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

	await h.component.waitForComponentStatus(page, '.b-slider', 'ready');
	return h.component.waitForComponent(page, '#target');
}

/**
 * Creates the default slot
 */
function defaultSlotFn() {
	const items = [1, 2, 3, 4].map((i) => ({
		tag: 'img',
		data: {
			attrs: {
				'data-test-ref': 'item',
				id: `slide${i}`,
				src: 'https://fakeimg.pl/300x200',
				width: 300,
				height: 200
			}
		}
	}));

	return `return () => ${JSON.stringify(items)}`;
}

/**
 * Creates a component with the default slot and a slide mode to test gestures
 *
 * @param {Page} page
 * @returns {!Object} component
 */
function initDefaultSlider(page) {
	return initSlider(page, {content: {default: defaultSlotFn()}, attrs: {mode: 'slide'}});
}

/**
 * Returns an index of the current visible slide
 *
 * @param {!Object} component
 * @returns {!Promise<number>}
 */
function current(component) {
	return component.evaluate((ctx) => ctx.current);
}

/**
 * Returns an index of the last slide
 *
 * @param {!Object} component
 * @returns {!Promise<number>}
 */
function lastIndex(component) {
	return component.evaluate((ctx) => ctx.contentLength - 1);
}

/**
 * Switches to the last slide
 *
 * @param {!Object} component
 * @returns {!Promise<number>}
 */
async function toLastSlide(component) {
	await component.evaluate((ctx) => ctx.current = ctx.contentLength - 1);
}

/**
 * Returns the current slider scroll position
 *
 * @param {Object} component
 * @returns {!Promise<number>}
 */
function currentOffset(component) {
	return component.evaluate((ctx) => ctx.currentOffset);
}

module.exports = {
	swipeOnce,
	initSlider,
	defaultSlotFn,
	initDefaultSlider,
	current,
	lastIndex,
	toLastSlide,
	currentOffset
};
