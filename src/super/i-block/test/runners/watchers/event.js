/* eslint-disable max-lines */

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

	describe('i-block watching for events', () => {
		it('watching for a document event', async () => {
			const target = await init();

			const scan = await target.evaluate((ctx) => {
				const res = [];

				ctx.watch('document.body:click', (e) => {
					res.push(e.target === document.body);
				});

				document.body.click();
				document.body.click();
				document.body.click();

				return res;
			});

			expect(scan).toEqual([true, true, true]);
		});

		it('watching for a component event', async () => {
			const target = await init();

			const scan = await target.evaluate((ctx) => {
				const res = [];

				ctx.watch('localEmitter:foo', (...args) => {
					res.push(...args);
				});

				ctx.localEmitter.emit('foo', 1, 2);
				ctx.localEmitter.emit('foo', 3, 4);
				ctx.localEmitter.emit('foo', 5, 6);

				return res;
			});

			expect(scan).toEqual([1, 2, 3, 4, 5, 6]);
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

			globalThis.renderComponents('b-dummy-watch', scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
