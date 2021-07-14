/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	h = include('tests/helpers');

/**
 * @param {object} props
 * @param {object} content
 */
async function init(props = {}, content = undefined) {
	content = {
		default: content ?? {
			tag: 'div',
			content: 'Hello content',
			attrs: {
				id: 'test-div'
			}
		}
	};

	const
		{page} = globalThis._testEnv;

	await page.evaluate(([props, content]) => {
		globalThis.removeCreatedComponents();

		globalThis.renderComponents('b-bottom-slide', [
			{
				attrs: {
					...props,
					id: 'target'
				},
				content
			}
		]);
	}, [props, content]);

	const
		componentNode = await page.waitForSelector('#target', {state: 'attached'}),
		component = await h.component.waitForComponent(page, '#target');

	await h.bom.waitForIdleCallback(page);

	return [component, componentNode];
}

module.exports.init = init;

/**
 * @param {object} c
 * @param {number} [step]
 */
async function open(c, step = undefined) {
	const
		{page} = globalThis._testEnv;

	await c.evaluate((ctx, [step]) => ctx.open(step), [step]);
	await h.bom.waitForIdleCallback(page);
}

module.exports.open = open;

/**
 * @param {object} c
 */
 async function close(c) {
	const
		{page} = globalThis._testEnv;

	await c.evaluate((ctx) => ctx.close());
	await h.bom.waitForIdleCallback(page);
}

module.exports.close = close;

/**
 * @param {object} c
 */
 async function next(c) {
	const
		{page} = globalThis._testEnv;

	await c.evaluate((ctx) => ctx.next());
	await h.bom.waitForIdleCallback(page);
}

module.exports.next = next;

/**
 * @param {object} c
 */
 async function prev(c) {
	const
		{page} = globalThis._testEnv;

	await c.evaluate((ctx) => ctx.prev());
	await h.bom.waitForIdleCallback(page);
}

module.exports.prev = prev;

/**
 * @param {number} percent
 */
function getAbsolutePageHeight(percent = 100) {
	const
		{page} = globalThis._testEnv;

	return page.evaluate((percent) => Math.round(globalThis.innerHeight / 100 * percent), percent);
}

module.exports.getAbsolutePageHeight = getAbsolutePageHeight;

/**
 * @param {object} c
 */
function getAbsoluteComponentWindowOffset(c) {
	return c.evaluate((ctx) => Math.round(globalThis.innerHeight - ctx.block.element('window').getBoundingClientRect().y));
}

module.exports.getAbsoluteComponentWindowOffset = getAbsoluteComponentWindowOffset;

/**
 * @param {object} c
 */
function getAbsoluteComponentWindowHeight(c) {
	return c.evaluate((ctx) => ctx.block.element('window').offsetHeight);
}

module.exports.getAbsoluteComponentWindowHeight = getAbsoluteComponentWindowHeight;

/**
 * @param {object} c
 */
function getComponentWindowYPos(c) {
	return c.evaluate((ctx) => Math.round(ctx.block.element('window').getBoundingClientRect().y));
}

module.exports.getComponentWindowYPos = getComponentWindowYPos;
