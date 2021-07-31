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
	{initSelect} = include('src/form/b-select/test/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-select masked input simple usage', () => {
		it('applying a mask without providing of the text value', async () => {
			const target = await initSelect(page, {
				mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d'
			});

			expect(await target.evaluate((ctx) => ctx.$refs.input.value)).toBe('');
		});

		it('applying a mask to the static content', async () => {
			const target = await initSelect(page, {
				text: '79851234567',
				mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d'
			});

			expect(await target.evaluate((ctx) => ctx.$refs.input.value)).toBe('+7 (985) 123-45-67');
		});

		it('applying a mask to the partial static content', async () => {
			const target = await initSelect(page, {
				text: '798512',
				mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d'
			});

			expect(await target.evaluate((ctx) => ctx.$refs.input.value)).toBe('+7 (985) 12_-__-__');
		});

		it('applying a mask to the non-normalized static content', async () => {
			const target = await initSelect(page, {
				text: '798_586xsd35473178x',
				mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d'
			});

			expect(await target.evaluate((ctx) => ctx.$refs.input.value)).toBe('+7 (985) 863-54-73');
		});

		it('applying a mask with `maskPlaceholder`', async () => {
			const target = await initSelect(page, {
				text: '798586',
				mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d',
				maskPlaceholder: '*'
			});

			expect(await target.evaluate((ctx) => ctx.$refs.input.value)).toBe('+7 (985) 86*-**-**');
		});

		it('applying a mask with finite repetitions', async () => {
			const target = await initSelect(page, {
				text: '12357984',
				mask: '%d-%d',
				maskRepetitions: 2
			});

			expect(await target.evaluate((ctx) => ctx.$refs.input.value)).toBe('1-2 3-5');
			expect(await target.evaluate((ctx) => ctx.isMaskInfinite)).toBeFalse();
		});

		it('applying a mask with finite repetitions and `maskDelimiter`', async () => {
			const target = await initSelect(page, {
				text: '12357984',
				mask: '%d-%d',
				maskRepetitions: 2,
				maskDelimiter: '//'
			});

			expect(await target.evaluate((ctx) => ctx.$refs.input.value)).toBe('1-2//3-5');
		});

		it('applying a mask with partial finite repetitions', async () => {
			const target = await initSelect(page, {
				text: '1',
				mask: '%d-%d',
				maskRepetitions: 2
			});

			expect(await target.evaluate((ctx) => ctx.$refs.input.value))
				.toBe('1-_');

			expect(await target.evaluate((ctx) => {
				ctx.text = '12';
				return ctx.$refs.input.value;
			})).toBe('1-2');

			expect(await target.evaluate((ctx) => {
				ctx.text = '123';
				return ctx.$refs.input.value;
			})).toBe('1-2 3-_');
		});

		it('applying a mask with infinite repetitions', async () => {
			const target = await initSelect(page, {
				text: '12357984',
				mask: '%d-%d',
				maskRepetitions: true
			});

			expect(await target.evaluate((ctx) => ctx.$refs.input.value)).toBe('1-2 3-5 7-9 8-4');
			expect(await target.evaluate((ctx) => ctx.isMaskInfinite)).toBeTrue();
		});

		it('applying a mask with partial infinite repetitions', async () => {
			const target = await initSelect(page, {
				text: '1235798',
				mask: '%d-%d',
				maskRepetitions: true
			});

			expect(await target.evaluate((ctx) => ctx.$refs.input.value)).toBe('1-2 3-5 7-9 8-_');
		});

		it('applying a mask with the custom non-terminals', async () => {
			const target = await initSelect(page, {
				text: '1235798',
				mask: '%l-%l',
				maskRepetitions: true,
				regExps: 'return {l: /[1-4]/i}'
			});

			expect(await target.evaluate((ctx) => ctx.$refs.input.value)).toBe('1-2 3-_');
		});

		it('applying a mask with the custom non-terminals', async () => {
			const target = await initSelect(page, {
				text: '1235798',
				mask: '%l-%l',
				maskRepetitions: true,
				regExps: 'return {l: /[1-4]/i}'
			});

			expect(await target.evaluate((ctx) => ctx.$refs.input.value)).toBe('1-2 3-_');
		});

		it('checking the `value` accessor with an empty input', async () => {
			const target = await initSelect(page, {});
			expect(await target.evaluate((ctx) => ctx.text)).toBe('');
		});

		it('checking the `value` accessor with a mask and empty input', async () => {
			const target = await initSelect(page, {
				mask: '%d-%d'
			});

			expect(await target.evaluate((ctx) => ctx.text)).toBe('');
		});

		it('checking the `value` accessor', async () => {
			const target = await initSelect(page, {
				text: '123'
			});

			expect(await target.evaluate((ctx) => ctx.text)).toBe('123');
		});

		it('setting the `value` accessor', async () => {
			const target = await initSelect(page, {
				text: '123'
			});

			expect(await target.evaluate((ctx) => {
				ctx.text = '34567';
				return ctx.text;
			})).toBe('34567');
		});

		it('checking the `value` accessor with a mask', async () => {
			const target = await initSelect(page, {
				text: '123',
				mask: '%d-%d'
			});

			expect(await target.evaluate((ctx) => ctx.text)).toBe('1-2');
		});

		it('setting the `value` accessor with a mask', async () => {
			const target = await initSelect(page, {
				text: '123',
				mask: '%d-%d'
			});

			expect(await target.evaluate((ctx) => {
				ctx.text = '34567';
				return ctx.text;
			})).toBe('3-4');

			expect(await target.evaluate((ctx) => {
				ctx.text = '67';
				return ctx.text;
			})).toBe('6-7');
		});
	});
};
