/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import type * as Mask from 'components/super/i-input-text/mask';
import type bTextarea from 'components/form/b-textarea/b-textarea';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import Utils from 'tests/helpers/utils';

test.describe('<b-textarea> mask API', () => {
	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const MaskAPI = await Utils.import<typeof Mask>(page, 'components/super/i-input-text/mask');
		await MaskAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));
	});

	test('applying a mask without providing a text value should have no effect', async ({page}) => {
		const target = await renderInput(page, {
			mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d'
		});

		test.expect(await target.evaluate(({unsafe}) => unsafe.$refs.input.value)).toBe('');
	});

	test('applying a mask to a predefined value', async ({page}) => {
		const target = await renderInput(page, {
			value: '79851234567',
			mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d'
		});

		test.expect(await target.evaluate(({unsafe}) => unsafe.$refs.input.value))
			.toBe('+7 (985) 123-45-67');
	});

	test('applying a mask to a predefined value that has a length less than the mask', async ({page}) => {
		const target = await renderInput(page, {
			value: '798512',
			mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d'
		});

		test.expect(await target.evaluate(({unsafe}) => unsafe.$refs.input.value))
			.toBe('+7 (985) 12_-__-__');
	});

	test('applying a mask to a non-normalized predefined value', async ({page}) => {
		const target = await renderInput(page, {
			value: '798_586xsd35473178x',
			mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d'
		});

		test.expect(await target.evaluate(({unsafe}) => unsafe.$refs.input.value))
			.toBe('+7 (985) 863-54-73');
	});

	test('applying a mask to a predefined value with the specified `maskPlaceholder`', async ({page}) => {
		const target = await renderInput(page, {
			value: '798586',
			mask: '+%d (%d%d%d) %d%d%d-%d%d-%d%d',
			maskPlaceholder: '*'
		});

		test.expect(await target.evaluate(({unsafe}) => unsafe.$refs.input.value))
			.toBe('+7 (985) 86*-**-**');
	});

	test('applying a mask with finite repetitions', async ({page}) => {
		const target = await renderInput(page, {
			value: '12357984',
			mask: '%d-%d',
			maskRepetitions: 2
		});

		test.expect(await target.evaluate(({unsafe}) => unsafe.$refs.input.value)).toBe('1-2 3-5');
		test.expect(await target.evaluate((ctx) => ctx.isMaskInfinite)).toBe(false);
	});

	test('applying a mask with finite repetitions and a given `maskDelimiter`', async ({page}) => {
		const target = await renderInput(page, {
			value: '12357984',
			mask: '%d-%d',
			maskRepetitions: 2,
			maskDelimiter: '//'
		});

		test.expect(await target.evaluate(({unsafe}) => unsafe.$refs.input.value)).toBe('1-2//3-5');
	});

	test('applying a mask with partial finite repetitions', async ({page}) => {
		const target = await renderInput(page, {
			value: '1',
			mask: '%d-%d',
			maskRepetitions: 2
		});

		test.expect(await target.evaluate(({unsafe}) => unsafe.$refs.input.value))
			.toBe('1-_');

		test.expect(await target.evaluate(({unsafe}) => {
			unsafe.value = '12';
			return unsafe.$refs.input.value;
		})).toBe('1-2');

		test.expect(await target.evaluate(({unsafe}) => {
			unsafe.value = '123';
			return unsafe.$refs.input.value;
		})).toBe('1-2 3-_');
	});

	test('applying a mask with infinite repetitions', async ({page}) => {
		const target = await renderInput(page, {
			value: '12357984',
			mask: '%d-%d',
			maskRepetitions: true
		});

		test.expect(await target.evaluate(({unsafe}) => unsafe.$refs.input.value)).toBe('1-2 3-5 7-9 8-4');
		test.expect(await target.evaluate((ctx) => ctx.isMaskInfinite)).toBe(true);
	});

	test('applying a mask with partial infinite repetitions', async ({page}) => {
		const target = await renderInput(page, {
			value: '1235798',
			mask: '%d-%d',
			maskRepetitions: true
		});

		test.expect(await target.evaluate(({unsafe}) => unsafe.$refs.input.value))
			.toBe('1-2 3-5 7-9 8-_');
	});

	test('applying a mask with custom non-terminals', async ({page}) => {
		const target = await renderInput(page, {
			value: '1235798',
			mask: '%l-%l',
			maskRepetitions: true,
			regExps: {l: /[1-4]/i}
		});

		test.expect(await target.evaluate(({unsafe}) => unsafe.$refs.input.value)).toBe('1-2 3-_');
	});

	test('checking `value` getter with empty textarea', async ({page}) => {
		const target = await renderInput(page, {});
		test.expect(await target.evaluate((ctx) => ctx.value)).toBe('');
	});

	test('checking the `value` getter with a mask and empty textarea', async ({page}) => {
		const target = await renderInput(page, {
			mask: '%d-%d'
		});

		test.expect(await target.evaluate((ctx) => ctx.value)).toBe('');
	});

	test('checking the `value` getter', async ({page}) => {
		const target = await renderInput(page, {
			value: '123'
		});

		test.expect(await target.evaluate((ctx) => ctx.value)).toBe('123');
	});

	test('setting the component value', async ({page}) => {
		const target = await renderInput(page, {
			value: '123'
		});

		test.expect(await target.evaluate((ctx) => {
			ctx.value = '34567';
			return ctx.value;
		})).toBe('34567');
	});

	test('checking the `value` getter with a mask', async ({page}) => {
		const target = await renderInput(page, {
			value: '123',
			mask: '%d-%d'
		});

		test.expect(await target.evaluate((ctx) => ctx.value)).toBe('1-2');
	});

	test('setting the component value with a mask', async ({page}) => {
		const target = await renderInput(page, {
			value: '123',
			mask: '%d-%d'
		});

		test.expect(await target.evaluate((ctx) => {
			ctx.value = '34567';
			return ctx.value;
		})).toBe('3-4');

		test.expect(await target.evaluate((ctx) => {
			ctx.value = '67';
			return ctx.value;
		})).toBe('6-7');
	});

	async function renderInput(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<JSHandle<bTextarea>> {
		return Component.createComponent(page, 'b-textarea', {
			attrs: {
				'data-id': 'target',
				...attrs
			}
		});
	}
});
