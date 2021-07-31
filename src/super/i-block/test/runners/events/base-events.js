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
	h = include('tests/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('i-block base events', () => {
		it('`componentHook`', async () => {
			const target = await init();

			const scan = await target.evaluate((ctx) => {
				const
					res = [];

				ctx.on('onComponentHook:beforeDestroy', (...args) => {
					res.push(args);
				});

				ctx.on('onComponentHookChange', (...args) => {
					res.push(args);
				});

				ctx.$destroy();

				return res;
			});

			expect(scan).toEqual([
				['beforeDestroy', 'mounted'],
				['beforeDestroy', 'mounted'],
				['destroyed', 'beforeDestroy']
			]);
		});

		it('`componentStatus`', async () => {
			const target = await init();

			const scan = await target.evaluate((ctx) => {
				const
					res = [];

				ctx.on('onComponentStatus:destroyed', (...args) => {
					res.push(args);
				});

				ctx.on('onComponentStatusChange', (...args) => {
					res.push(args);
				});

				ctx.$destroy();

				return res;
			});

			expect(scan).toEqual([
				['destroyed', 'ready'],
				['destroyed', 'ready']
			]);
		});

		it('proxyCall', async () => {
			const target = await init({
				proxyCall: true
			});

			const scan = await target.evaluate((ctx) => {
				const
					res = [];

				ctx.$parent.emit('callChild', {
					check: ['componentName', 'b-dummy'],

					action() {
						res.push(1);
					}
				});

				ctx.$parent.emit('callChild', {
					check: ['instanceOf', ctx.instance.constructor],

					action() {
						res.push(2);
					}
				});

				ctx.$parent.emit('callChild', {
					check: ['globalName', 'foo'],

					action() {
						res.push(3);
					}
				});

				return res;
			});

			expect(scan).toEqual([1, 2]);
		});
	});

	async function init(attrs = {}) {
		await page.evaluate((attrs = {}) => {
			const scheme = [
				{
					attrs: {
						id: 'target',
						...attrs
					}
				}
			];

			globalThis.renderComponents('b-dummy', scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
