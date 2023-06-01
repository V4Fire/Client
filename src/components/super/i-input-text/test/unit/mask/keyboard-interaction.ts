/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { DOM } from 'tests/helpers';

import { renderDummyInput } from 'components/super/i-input-text/test/helpers';
import type { Locator } from 'playwright';

test.describe('<i-input-text> masked input - keyboard interaction', () => {
	const inputSelector = DOM.elNameSelectorGenerator('b-super-i-input-text-dummy', 'input');

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should fill up the mask while typing when the static mask is set', async ({page}) => {
		await renderDummyInput(page, {
			mask: '%d🧑‍🤝‍🧑%d'
		});

		const input = page.locator(inputSelector);

		const
			keys = ['1', 'a', '2'],
			results = ['1🧑‍🤝‍🧑_', '1🧑‍🤝‍🧑_', '1🧑‍🤝‍🧑2'];

		for (let i = 0; i < keys.length; i++) {
			await input.type(keys[i]);
			await test.expect(input).toHaveValue(results[i]);
		}
	});

	test('should fill up the mask while typing when the infinitive mask and Unicode placeholder are set', async ({page}) => {
		await renderDummyInput(page, {
			mask: '%d-%d',
			maskRepetitions: true,
			maskPlaceholder: '🧑‍🤝‍🧑',
			maskDelimiter: ' '
		});

		const input = page.locator(inputSelector);

		const
			keys = ['1', 'a', '2', '5', '8'],
			results = ['1-🧑‍🤝‍🧑', '1-🧑‍🤝‍🧑', '1-2', '1-2 5-🧑‍🤝‍🧑', '1-2 5-8'];

		for (let i = 0; i < keys.length; i++) {
			await input.type(keys[i]);
			await test.expect(input).toHaveValue(results[i]);
		}
	});

	test([
		'should correctly fill up the mask while typing with the invalid symbols',
		'when the static mask is set'
	].join(' '), async ({page}) => {
		await renderDummyInput(page, {
			mask: '%d-%d'
		});

		const input = page.locator(inputSelector);
		await input.focus();

		await page.keyboard.press('F1');
		await test.expect(input).toHaveValue('');

		await page.keyboard.press('ArrowLeft');
		await test.expect(input).toHaveValue('');

		await page.keyboard.press('2');
		await test.expect(input).toHaveValue('2-_');
	});

	// FIXME: empty value doesn't display a placeholder
	test.skip([
		'should replace a text via keyboard `input` action',
		'when the infinitive mask and Unicode placeholder are set'
	].join(' '), async ({page}) => {
		const target = await renderDummyInput(page, {
			text: '1234',
			mask: '%d-%d',
			maskRepetitions: true,
			maskPlaceholder: '🧑‍🤝‍🧑',
			testmaskDelimiter: '🧑'
		});

		const input = page.locator(inputSelector);
		await input.focus();

		const values = ['2dsde12', '1', 'sdfr'];
		const results: Array<[string, number]> = [
			['2-1🧑2-🧑‍🤝‍🧑', '2-1🧑2-'.length],
			['1-🧑‍🤝‍🧑', '1-'.length],
			['🧑‍🤝‍🧑-🧑‍🤝‍🧑', 0]
		];

		for (let i = 0; i < values.length; i++) {
			await target.evaluate((ctx) => {
				const {input} = ctx.unsafe.$refs;
				ctx.unsafe.maskAPI.compiledMask!.selectionStart = 0;
				ctx.unsafe.maskAPI.compiledMask!.selectionEnd = input.value.length;
			});

			await input.fill(values[i]);

			const [value, selection] = results[i];

			await test.expect(input).toHaveValue(value);
			await assertInputSelectionStartIs(input, selection);
		}
	});

	test([
		'should modify a text via keyboard `input` action',
		'when the finite mask and Unicode placeholder are set'
	].join(' '), async ({page}) => {
		const target = await renderDummyInput(page, {
			text: '1234',
			mask: '%d-%d',
			maskRepetitions: 2,
			maskPlaceholder: '🧑‍🤝‍🧑',
			maskDelimiter: '🧑'
		});

		const input = page.locator(inputSelector);
		await input.focus();

		await target.evaluate((ctx) => {
			ctx.unsafe.maskAPI.compiledMask!.selectionStart = '1-'.length;
			ctx.unsafe.maskAPI.compiledMask!.selectionEnd = '1-2🧑3-'.length;
		});

		await input.fill('1-56ff1-4');

		await test.expect(input).toHaveValue('1-5🧑6-1');
		await assertInputSelectionStartIs(input, '1-5🧑6-1'.length);
	});

	// FIXME: empty value doesn't display a placeholder
	test.skip([
		'with the infinite mask and Unicode placeholder',
		'when deleting text via the `backspace` key',
		'the value should be removed char by char until it becomes empty;',
		'after that, a placeholder should appear;',
		'the placeholder should be deleted upon further use of the `backspace` key'
	].join(' '), async ({page}) => {
		await renderDummyInput(page, {
			text: '1234',
			mask: '%d-%d',
			maskRepetitions: true,
			maskPlaceholder: '🧑‍🤝‍🧑',
			maskDelimiter: '🧑'
		});

		const input = page.locator(inputSelector);
		await input.focus();

		const results: Array<[string, number]> = [
			['1-2🧑3-🧑‍🤝‍🧑', '1-2🧑3-'.length],
			['1-2🧑🧑‍🤝‍🧑-🧑‍🤝‍🧑', '1-2🧑'.length],
			['1-🧑‍🤝‍🧑', '1-'.length],
			['🧑‍🤝‍🧑-🧑‍🤝‍🧑', 0],
			['', 0],
			['', 0]
		];

		for (let i = 0; i < 6; i++) {
			await page.keyboard.press('Backspace');

			const [value, selection] = results[i];

			await test.expect(input).toHaveValue(value);
			await assertInputSelectionStartIs(input, selection);
		}
	});

	test([
		'should delete a text via `backspace` with bounding to the selected text',
		'preserving the intermediate placeholders',
		'when the infinitive mask and Unicode placeholder are set'
	].join(' '), async ({page}) => {
		const target = await renderDummyInput(page, {
			text: '1234',
			mask: '%d-%d',
			maskRepetitions: true,
			maskPlaceholder: '🧑‍🤝‍🧑',
			maskDelimiter: '🧑'
		});

		const input = page.locator(inputSelector);
		await input.focus();

		await target.evaluate((ctx) => {
			const {input} = ctx.unsafe.$refs;
			input.selectionStart = '1-'.length;
			input.selectionEnd = '1-2🧑3-'.length;
		});

		await page.keyboard.press('Backspace');

		await test.expect(input).toHaveValue('1-🧑‍🤝‍🧑🧑🧑‍🤝‍🧑-4');
		await assertInputSelectionStartIs(input, '1-'.length);
	});

	// FIXME: empty value doesn't display a placeholder
	test.skip([
		'with the infinite mask and Unicode placeholder',
		'when deleting text via the `delete` key',
		'the value should be removed char by char until it becomes empty;',
		'after that, a placeholder should appear;',
		'the placeholder should remain upon further use of the `delete` key'
	].join(' '), async ({page}) => {
		const target = await renderDummyInput(page, {
			text: '1234',
			mask: '%d-%d',
			maskRepetitions: true,
			maskPlaceholder: '🧑‍🤝‍🧑',
			maskDelimiter: '🧑'
		});

		const input = page.locator(inputSelector);
		await input.focus();

		await target.evaluate((ctx) => {
			const {input} = ctx.unsafe.$refs;

			input.selectionStart = 0;
			input.selectionEnd = 0;
		});

		const results: Array<[string, number]> = [
			['2-3🧑4-🧑‍🤝‍🧑', 0],
			['3-4', 0],
			['4-🧑‍🤝‍🧑', 0],
			['🧑‍🤝‍🧑-🧑‍🤝‍🧑', 0],
			['🧑‍🤝‍🧑-🧑‍🤝‍🧑', 0],
			['🧑‍🤝‍🧑-🧑‍🤝‍🧑', 0]
		];

		for (let i = 0; i < 6; i++) {
			await page.keyboard.press('Delete');

			const [value, selection] = results[i];

			await test.expect(input).toHaveValue(value);
			await assertInputSelectionStartIs(input, selection);
		}
	});

	test([
		'should delete a text via `delete` with bounding to the selected text',
		'removing the intermediate placeholders',
		'when the infinitive mask and Unicode placeholder are set'
	].join(' '), async ({page}) => {
		const target = await renderDummyInput(page, {
			text: '1234',
			mask: '%d-%d',
			maskRepetitions: true,
			maskPlaceholder: '🧑‍🤝‍🧑',
			maskDelimiter: '🧑'
		});

		const input = page.locator(inputSelector);
		await input.focus();

		await target.evaluate((ctx) => {
			const {input} = ctx.unsafe.$refs;
			input.selectionStart = '1-'.length;
			input.selectionEnd = '1-2🧑3-'.length;
		});

		await page.keyboard.press('Delete');

		await test.expect(input).toHaveValue('1-4');
		await assertInputSelectionStartIs(input, '1-'.length);
	});

	test('should navigate between the graphemes using the arrow keys', async ({page}) => {
		await renderDummyInput(page, {
			text: '123',
			mask: '%d-%d',
			maskRepetitions: true,
			maskPlaceholder: '🧑‍🤝‍🧑',
			maskDelimiter: '🧑‍🤝‍🧑'
		});

		const results = [
			new Array(2).fill('1-2🧑‍🤝‍🧑3-🧑‍🤝‍🧑'.length),
			new Array(2).fill('1-2🧑‍🤝‍🧑3-'.length),
			new Array(2).fill('1-2🧑‍🤝‍🧑'.length),
			new Array(2).fill('1-'.length),

			new Array(2).fill(''.length),
			new Array(2).fill(''.length),

			new Array(2).fill('1-'.length),
			new Array(2).fill('1-2🧑‍🤝‍🧑'.length),
			new Array(2).fill('1-2🧑‍🤝‍🧑3-'.length),
			new Array(2).fill('1-2🧑‍🤝‍🧑3-🧑‍🤝‍🧑'.length),
			new Array(2).fill('1-2🧑‍🤝‍🧑3-🧑‍🤝‍🧑'.length)
		];

		const input = page.locator(inputSelector);
		await input.focus();

		const [start, end] = results[0];
		await assertInputSelectionStartIs(input, start);
		await assertInputSelectionEndIs(input, end);

		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('ArrowLeft');

			const [start, end] = results[1 + i];
			await assertInputSelectionStartIs(input, start);
			await assertInputSelectionEndIs(input, end);
		}

		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('ArrowRight');

			const [start, end] = results[6 + i];
			await assertInputSelectionStartIs(input, start);
			await assertInputSelectionEndIs(input, end);
		}
	});

	async function assertInputSelectionStartIs(
		locator: Locator, start: number
	): Promise<void> {
		await test.expect(locator.evaluate((ctx) => (<HTMLInputElement>ctx).selectionStart))
			.resolves.toEqual(start);
	}

	async function assertInputSelectionEndIs(
		locator: Locator, end: number
	): Promise<void> {
		await test.expect(locator.evaluate((ctx) => (<HTMLInputElement>ctx).selectionEnd))
			.resolves.toEqual(end);
	}
});
