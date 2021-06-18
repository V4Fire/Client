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
	{initInput} = include('src/form/b-input/test/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-input form API `info` / `error` messages', () => {
		it('without `messageHelpers`', async () => {
			const target = await initInput(page, {
				info: 'Hello',
				error: 'Error'
			});

			expect(await target.evaluate((ctx) => Boolean(ctx.block.element('info-box'))))
				.toBeFalse();

			expect(await target.evaluate((ctx) => Boolean(ctx.block.element('error-box'))))
				.toBeFalse();
		});

		it('providing `info`', async () => {
			const target = await initInput(page, {
				info: 'Hello',
				messageHelpers: true
			});

			expect(await target.evaluate((ctx) => ctx.info))
				.toBe('Hello');

			expect(await target.evaluate((ctx) => ctx.block.element('info-box').textContent.trim()))
				.toBe('Hello');

			expect(await target.evaluate((ctx) => ctx.mods.showInfo))
				.toBe('true');

			await target.evaluate((ctx) => {
				ctx.info = 'Bla';
			});

			expect(await target.evaluate((ctx) => ctx.info))
				.toBe('Bla');

			expect(await target.evaluate((ctx) => ctx.block.element('info-box').textContent.trim()))
				.toBe('Bla');

			expect(await target.evaluate((ctx) => ctx.mods.showInfo))
				.toBe('true');

			await target.evaluate((ctx) => {
				ctx.info = undefined;
			});

			expect(await target.evaluate((ctx) => ctx.info))
				.toBeUndefined();

			expect(await target.evaluate((ctx) => ctx.block.element('info-box').textContent.trim()))
				.toBe('');

			expect(await target.evaluate((ctx) => ctx.mods.showInfo))
				.toBe('false');
		});

		it('providing `error`', async () => {
			const target = await initInput(page, {
				error: 'Error',
				messageHelpers: true
			});

			expect(await target.evaluate((ctx) => ctx.error))
				.toBe('Error');

			expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
				.toBe('Error');

			expect(await target.evaluate((ctx) => ctx.mods.showError))
				.toBe('true');

			await target.evaluate((ctx) => {
				ctx.error = 'Bla';
			});

			expect(await target.evaluate((ctx) => ctx.error))
				.toBe('Bla');

			expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
				.toBe('Bla');

			expect(await target.evaluate((ctx) => ctx.mods.showError))
				.toBe('true');

			await target.evaluate((ctx) => {
				ctx.error = undefined;
			});

			expect(await target.evaluate((ctx) => ctx.error))
				.toBeUndefined();

			expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
				.toBe('');

			expect(await target.evaluate((ctx) => ctx.mods.showError))
				.toBe('false');
		});

		it('providing `info` and `error`', async () => {
			const target = await initInput(page, {
				info: 'Hello',
				error: 'Error',
				messageHelpers: true
			});

			expect(await target.evaluate((ctx) => ctx.info))
				.toBe('Hello');

			expect(await target.evaluate((ctx) => ctx.block.element('info-box').textContent.trim()))
				.toBe('Hello');

			expect(await target.evaluate((ctx) => ctx.mods.showInfo))
				.toBe('true');

			expect(await target.evaluate((ctx) => ctx.error))
				.toBe('Error');

			expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
				.toBe('Error');

			expect(await target.evaluate((ctx) => ctx.mods.showError))
				.toBe('true');
		});
	});
};
