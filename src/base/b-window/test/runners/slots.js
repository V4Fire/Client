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

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-window providing of slots', () => {
		it('`default` slot', async () => {
			const target = await init({
				content: {
					default: {
						tag: 'div',
						content: 'Hello content'
					}
				}
			});

			expect(await target.evaluate((ctx) => ctx.block.element('window').innerHTML))
				.toBe('<div>Hello content</div>');
		});

		it('`title` slot', async () => {
			const target = await init({
				content: {
					title: 'return ({title}) => title + "Foo"'
				}
			});

			expect(await target.evaluate((ctx) => ctx.block.element('title').innerHTML))
				.toBe('BlaFoo');
		});

		it('`body` slot', async () => {
			const target = await init({
				content: {
					body: {
						tag: 'div',
						content: 'Hello body'
					}
				}
			});

			expect(await target.evaluate((ctx) => ctx.block.element('title').innerHTML.trim()))
				.toBe('Bla');

			expect(await target.evaluate((ctx) => ctx.block.element('body').innerHTML))
				.toBe('<div>Hello body</div>');
		});

		it('`controls` slot', async () => {
			const target = await init({
				content: {
					controls: {
						tag: 'button',
						content: 'Close'
					}
				}
			});

			expect(await target.evaluate((ctx) => ctx.block.element('title').innerHTML.trim()))
				.toBe('Bla');

			expect(await target.evaluate((ctx) => ctx.block.element('controls').innerHTML))
				.toBe('<button>Close</button>');
		});

		it('third-party slots', async () => {
			const
				target = await init({attrs: {slotName: 'windowSlotTestDummy'}});

			expect(await target.evaluate((ctx) => ctx.block.element('window').innerHTML))
				.toBe('<div class="b-window__bla">Hello world!</div>');
		});

		async function init(params = {}) {
			await page.evaluate(({content, attrs}) => {
				Object.forEach(content, (el, key) => {
					// eslint-disable-next-line no-new-func
					content[key] = /return /.test(el) ? Function(el)() : el;
				});

				globalThis.renderComponents('b-window', [
					{
						content,

						attrs: {
							id: 'target',
							title: 'Bla',
							...attrs
						}
					}
				]);
			}, params);

			return h.component.waitForComponent(page, '#target');
		}
	});
};
