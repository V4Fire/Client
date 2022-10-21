// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	h = include('tests/helpers').default;

/**
 * Initializes a bottom slide component to test
 *
 * @param {object} props
 * @param {object} content
 * @returns {!Promise<[!Object, !Element]>}
 */
async function initBottomSlide(props = {}, content = undefined) {
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

module.exports.initBottomSlide = initBottomSlide;

/**
 * Invokes `open` of the specified component
 *
 * @param {!Object} component
 * @param {number} [step]
 * @returns {!Promise<void>}
 */
async function open(component, step = undefined) {
	const
		{page} = globalThis._testEnv;

	await component.evaluate((ctx, [step]) => ctx.open(step), [step]);
	await h.bom.waitForIdleCallback(page);
}

module.exports.open = open;

/**
 * Invokes `close` of the specified component
 *
 * @param {Object} component
 * @returns {!Promise<void>}
 */
 async function close(component) {
	const
		{page} = globalThis._testEnv;

	await component.evaluate((ctx) => ctx.close());
	await h.bom.waitForIdleCallback(page);
}

module.exports.close = close;

/**
 * Invokes `next` of the specified component
 *
 * @param {!Object} component
 * @returns {!Promise<void>}
 */
 async function next(component) {
	const
		{page} = globalThis._testEnv;

	await component.evaluate((ctx) => ctx.next());
	await h.bom.waitForIdleCallback(page);
}

module.exports.next = next;

/**
 * Invokes `prev` of the specified component
 *
 * @param {!Object} component
 * @returns {!Promise<void>}
 */
async function prev(component) {
	const
		{page} = globalThis._testEnv;

	await component.evaluate((ctx) => ctx.prev());
	await h.bom.waitForIdleCallback(page);
}

module.exports.prev = prev;

/**
 * Returns a value of the global window height
 *
 * @param {number} [percent] - percent of the resulting height to return
 * @returns {!Promise<number>}
 */
function getAbsolutePageHeight(percent = 100) {
	const
		{page} = globalThis._testEnv;

	return page.evaluate((percent) => Math.round(globalThis.innerHeight / 100 * percent), percent);
}

module.exports.getAbsolutePageHeight = getAbsolutePageHeight;

/**
 * Returns an offset between the global window and component window element
 *
 * @param {Object} component
 * @returns {!Promise<number>}
 */
function getAbsoluteComponentWindowOffset(component) {
	return component.evaluate((ctx) => Math.round(globalThis.innerHeight - ctx.block.element('window').getBoundingClientRect().y));
}

module.exports.getAbsoluteComponentWindowOffset = getAbsoluteComponentWindowOffset;

/**
 * Returns `offsetHeight` of the `window` element from the specified component
 *
 * @param {!Object} component
 * @returns {!Promise<number>}
 */
function getAbsoluteComponentWindowHeight(component) {
	return component.evaluate((ctx) => ctx.block.element('window').offsetHeight);
}

module.exports.getAbsoluteComponentWindowHeight = getAbsoluteComponentWindowHeight;

/**
 * Returns a `y` position from the component `boundedClientRect`
 *
 * @param {!Object} component
 * @returns {!Promise<number>}
 */
function getComponentWindowYPos(component) {
	return component.evaluate((ctx) => Math.round(ctx.block.element('window').getBoundingClientRect().y));
}

module.exports.getComponentWindowYPos = getComponentWindowYPos;
