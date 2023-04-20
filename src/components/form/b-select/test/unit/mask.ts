/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderSelect } from 'components/form/b-select/test/helpers';

test.describe('<b-select> masked input simple usage', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('applying a mask without providing of the text value', async ({page}) => {
		const target = await renderSelect(page, {
			mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d'
		});

		await test.expect(target.evaluate((ctx) => ctx.unsafe.$refs.input.value)).resolves.toBe('');
	});

	test('applying a mask to the static content', async ({page}) => {
		const target = await renderSelect(page, {
			text: '79851234567',
			mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d'
		});

		await test.expect(target.evaluate((ctx) => ctx.unsafe.$refs.input.value)).resolves.toBe('+7 (985) 123-45-67');
	});

	test('applying a mask to the partial static content', async ({page}) => {
		const target = await renderSelect(page, {
			text: '798512',
			mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d'
		});

		await test.expect(target.evaluate((ctx) => ctx.unsafe.$refs.input.value)).resolves.toBe('+7 (985) 12_-__-__');
	});

	test('applying a mask to the non-normalized static content', async ({page}) => {
		const target = await renderSelect(page, {
			text: '798_586xsd35473178x',
			mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d'
		});

		await test.expect(target.evaluate((ctx) => ctx.unsafe.$refs.input.value)).resolves.toBe('+7 (985) 863-54-73');
	});

	test('applying a mask with `maskPlaceholder`', async ({page}) => {
		const target = await renderSelect(page, {
			text: '798586',
			mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d',
			maskPlaceholder: '*'
		});

		await test.expect(target.evaluate((ctx) => ctx.unsafe.$refs.input.value)).resolves.toBe('+7 (985) 86*-**-**');
	});

	test('applying a mask with finite repetitions', async ({page}) => {
		const target = await renderSelect(page, {
			text: '12357984',
			mask: '%d-%d',
			maskRepetitions: 2
		});

		await test.expect(target.evaluate((ctx) => ctx.unsafe.$refs.input.value)).resolves.toBe('1-2 3-5');
		await test.expect(target.evaluate((ctx) => ctx.isMaskInfinite)).resolves.toBeFalsy();
	});

	test('applying a mask with finite repetitions and `maskDelimiter`', async ({page}) => {
		const target = await renderSelect(page, {
			text: '12357984',
			mask: '%d-%d',
			maskRepetitions: 2,
			maskDelimiter: '//'
		});

		await test.expect(target.evaluate((ctx) => ctx.unsafe.$refs.input.value)).resolves.toBe('1-2//3-5');
	});

	test('applying a mask with partial finite repetitions', async ({page}) => {
		const target = await renderSelect(page, {
			text: '1',
			mask: '%d-%d',
			maskRepetitions: 2
		});

		await test.expect(target.evaluate((ctx) => ctx.unsafe.$refs.input.value))
			.resolves.toBe('1-_');

		await test.expect(target.evaluate((ctx) => {
			ctx.text = '12';
			return ctx.unsafe.$refs.input.value;
		})).toBe('1-2');

		await test.expect(target.evaluate((ctx) => {
			ctx.text = '123';
			return ctx.unsafe.$refs.input.value;
		})).toBe('1-2 3-_');
	});

	test('applying a mask with infinite repetitions', async ({page}) => {
		const target = await renderSelect(page, {
			text: '12357984',
			mask: '%d-%d',
			maskRepetitions: true
		});

		await test.expect(target.evaluate((ctx) => ctx.unsafe.$refs.input.value)).resolves.toBe('1-2 3-5 7-9 8-4');
		await test.expect(target.evaluate((ctx) => ctx.isMaskInfinite)).resolves.toBeTruthy();
	});

	test('applying a mask with partial infinite repetitions', async ({page}) => {
		const target = await renderSelect(page, {
			text: '1235798',
			mask: '%d-%d',
			maskRepetitions: true
		});

		await test.expect(target.evaluate((ctx) => ctx.unsafe.$refs.input.value)).resolves.toBe('1-2 3-5 7-9 8-_');
	});

	test('applying a mask with the custom non-terminals', async ({page}) => {
		const target = await renderSelect(page, {
			text: '1235798',
			mask: '%l-%l',
			maskRepetitions: true,
			regExps: 'return {l: /[1-4]/i}'
		});

		await test.expect(target.evaluate((ctx) => ctx.unsafe.$refs.input.value)).resolves.toBe('1-2 3-_');
	});

	test('checking the `value` accessor with an empty input', async ({page}) => {
		const target = await renderSelect(page, {});
		await test.expect(target.evaluate((ctx) => ctx.text)).resolves.toBe('');
	});

	test('checking the `value` accessor with a mask and empty input', async ({page}) => {
		const target = await renderSelect(page, {
			mask: '%d-%d'
		});

		await test.expect(target.evaluate((ctx) => ctx.text)).resolves.toBe('');
	});

	test('checking the `value` accessor', async ({page}) => {
		const target = await renderSelect(page, {
			text: '123'
		});

		await test.expect(target.evaluate((ctx) => ctx.text)).resolves.toBe('123');
	});

	test('setting the `value` accessor', async ({page}) => {
		const target = await renderSelect(page, {
			text: '123'
		});

		await test.expect(target.evaluate((ctx) => {
			ctx.text = '34567';
			return ctx.text;
		})).resolves.toBe('34567');
	});

	test('checking the `value` accessor with a mask', async ({page}) => {
		const target = await renderSelect(page, {
			text: '123',
			mask: '%d-%d'
		});

		await test.expect(target.evaluate((ctx) => ctx.text)).resolves.toBe('1-2');
	});

	test('setting the `value` accessor with a mask', async ({page}) => {
		const target = await renderSelect(page, {
			text: '123',
			mask: '%d-%d'
		});

		await test.expect(target.evaluate((ctx) => {
			ctx.text = '34567';
			return ctx.text;
		})).resolves.toBe('3-4');

		await test.expect(target.evaluate((ctx) => {
			ctx.text = '67';
			return ctx.text;
		})).resolves.toBe('6-7');
	});
});
