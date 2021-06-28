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
	{initInput} = include('src/super/i-input-text/test/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('i-input-text masked input by using keyboard events', () => {
		it('typing a text with the static mask', async () => {
			const target = await initInput(page, {
				mask: '%d🧑‍🤝‍🧑%d'
			});

			const scan = await target.evaluate((ctx) => {
				const
					{input} = ctx.$refs;

				const
					res = [],
					keys = ['1', 'a', '2'];

				for (const key of keys) {
					input.dispatchEvent(new KeyboardEvent('keydown', {
						key,
						code: `Key${key.toUpperCase()}`
					}));

					res.push(input.value);
				}

				return res;
			});

			expect(scan).toEqual(['1🧑‍🤝‍🧑_', '1🧑‍🤝‍🧑_', '1🧑‍🤝‍🧑2']);
		});

		it('typing a text with the infinitive mask and Unicode placeholder', async () => {
			const target = await initInput(page, {
				mask: '%d-%d',
				maskRepetitions: true,
				maskPlaceholder: '🧑‍🤝‍🧑',
				maskDelimiter: ' '
			});

			const scan = await target.evaluate((ctx) => {
				const
					{input} = ctx.$refs;

				const
					res = [],
					keys = ['1', 'a', '2', '5', '8'];

				for (const key of keys) {
					input.dispatchEvent(new KeyboardEvent('keydown', {
						key,
						code: `Key${key.toUpperCase()}`
					}));

					res.push(input.value);
				}

				return res;
			});

			expect(scan).toEqual(['1-🧑‍🤝‍🧑', '1-🧑‍🤝‍🧑', '1-2', '1-2 5-🧑‍🤝‍🧑', '1-2 5-8']);
		});

		it('typing a text the static mask and invalid symbols', async () => {
			const target = await initInput(page, {
				mask: '%d-%d'
			});

			const scan = await target.evaluate((ctx) => {
				const
					{input} = ctx.$refs;

				const
					res = [];

				input.dispatchEvent(new KeyboardEvent('keydown', {
					key: 'F1',
					code: 'F1'
				}));

				res.push(input.value);

				input.dispatchEvent(new KeyboardEvent('keydown', {
					key: 'ArrowLeft',
					code: 'ArrowLeft'
				}));

				res.push(input.value);

				input.dispatchEvent(new KeyboardEvent('keydown', {
					key: '2',
					code: 'Key2'
				}));

				res.push(input.value);

				return res;
			});

			expect(scan).toEqual(['', '', '2-_']);
		});

		it('replacing a text with the infinitive mask and Unicode placeholder via `input`', async () => {
			const target = await initInput(page, {
				text: '1234',
				mask: '%d-%d',
				maskRepetitions: true,
				maskPlaceholder: '🧑‍🤝‍🧑',
				maskDelimiter: '🧑'
			});

			const scan = await target.evaluate(async (ctx) => {
				const
					input = ctx.block.element('input');

				const
					res = [],
					values = ['2dsde12', '1', 'sdfr'];

				input.focus();

				for (const val of values) {
					ctx.compiledMask.selectionStart = 0;
					ctx.compiledMask.selectionEnd = input.value.length;

					input.value = val;
					input.dispatchEvent(new InputEvent('input', {data: val}));

					await Promise.resolve((r) => setTimeout(r, 10));
					res.push([input.value, input.selectionStart]);
				}

				return res;
			});

			expect(scan).toEqual([
				['2-1🧑2-🧑‍🤝‍🧑', '2-1🧑2-'.length],
				['1-🧑‍🤝‍🧑', '1-'.length],
				['🧑‍🤝‍🧑-🧑‍🤝‍🧑', 0]
			]);
		});

		it('modifying a text with the finite mask and Unicode placeholder via `input`', async () => {
			const target = await initInput(page, {
				text: '1234',
				mask: '%d-%d',
				maskRepetitions: 2,
				maskPlaceholder: '🧑‍🤝‍🧑',
				maskDelimiter: '🧑'
			});

			const scan = await target.evaluate(async (ctx) => {
				const
					{input} = ctx.$refs;

				input.focus();

				ctx.compiledMask.selectionStart = '1-'.length;
				ctx.compiledMask.selectionEnd = '1-2🧑3-'.length;

				input.value = '1-56ff1-4';
				input.dispatchEvent(new InputEvent('input', {data: input.value}));

				await Promise.resolve((r) => setTimeout(r, 10));

				return [input.value, input.selectionStart];
			});

			expect(scan).toEqual(['1-5🧑6-1', '1-5🧑6-1'.length]);
		});

		it('deleting a text with the infinitive mask and Unicode placeholder via `backspace`', async () => {
			const target = await initInput(page, {
				text: '1234',
				mask: '%d-%d',
				maskRepetitions: true,
				maskPlaceholder: '🧑‍🤝‍🧑',
				maskDelimiter: '🧑'
			});

			const scan = await target.evaluate((ctx) => {
				const
					input = ctx.block.element('input');

				const
					res = [];

				for (let i = 0; i < 6; i++) {
					input.dispatchEvent(new KeyboardEvent('keydown', {
						key: 'Backspace',
						code: 'Backspace'
					}));

					res.push([input.value, input.selectionStart]);
				}

				return res;
			});

			expect(scan).toEqual([
				['1-2🧑3-🧑‍🤝‍🧑', '1-2🧑3-'.length],
				['1-2🧑🧑‍🤝‍🧑-🧑‍🤝‍🧑', '1-2🧑'.length],
				['1-🧑‍🤝‍🧑', '1-'.length],
				['🧑‍🤝‍🧑-🧑‍🤝‍🧑', 0],
				['', 0],
				['', 0]
			]);
		});

		it('deleting a text with the infinitive mask and Unicode placeholder via `backspace` with bounding', async () => {
			const target = await initInput(page, {
				text: '1234',
				mask: '%d-%d',
				maskRepetitions: true,
				maskPlaceholder: '🧑‍🤝‍🧑',
				maskDelimiter: '🧑'
			});

			const scan = await target.evaluate((ctx) => {
				const
					input = ctx.block.element('input');

				input.focus();

				input.selectionStart = '1-'.length;
				input.selectionEnd = '1-2🧑3-'.length;

				input.dispatchEvent(new KeyboardEvent('keydown', {
					key: 'Backspace',
					code: 'Backspace'
				}));

				return [input.value, input.selectionStart];
			});

			expect(scan).toEqual(['1-🧑‍🤝‍🧑🧑🧑‍🤝‍🧑-4', '1-'.length]);
		});

		it('deleting a text with the infinitive mask and Unicode placeholder via `delete`', async () => {
			const target = await initInput(page, {
				text: '1234',
				mask: '%d-%d',
				maskRepetitions: true,
				maskPlaceholder: '🧑‍🤝‍🧑',
				maskDelimiter: '🧑'
			});

			const scan = await target.evaluate((ctx) => {
				const
					input = ctx.block.element('input');

				const
					res = [];

				input.focus();
				input.selectionStart = 0;
				input.selectionEnd = 0;

				for (let i = 0; i < 6; i++) {
					input.dispatchEvent(new KeyboardEvent('keydown', {
						key: 'Delete',
						code: 'Delete'
					}));

					res.push([input.value, input.selectionStart]);
				}

				return res;
			});

			expect(scan).toEqual([
				['2-3🧑4-🧑‍🤝‍🧑', 0],
				['3-4', 0],
				['4-🧑‍🤝‍🧑', 0],
				['🧑‍🤝‍🧑-🧑‍🤝‍🧑', 0],
				['🧑‍🤝‍🧑-🧑‍🤝‍🧑', 0],
				['🧑‍🤝‍🧑-🧑‍🤝‍🧑', 0]
			]);
		});

		it('deleting a text with the infinitive mask and Unicode placeholder via `delete` with bounding', async () => {
			const target = await initInput(page, {
				text: '1234',
				mask: '%d-%d',
				maskRepetitions: true,
				maskPlaceholder: '🧑‍🤝‍🧑',
				maskDelimiter: '🧑'
			});

			const scan = await target.evaluate((ctx) => {
				const
					input = ctx.block.element('input');

				input.focus();

				input.selectionStart = '1-'.length;
				input.selectionEnd = '1-2🧑3'.length;

				input.dispatchEvent(new KeyboardEvent('keydown', {
					key: 'Delete',
					code: 'Delete'
				}));

				return [input.value, input.selectionStart];
			});

			expect(scan).toEqual(['1-4', '1-'.length]);
		});

		it('mask navigation via arrow keys', async () => {
			const target = await initInput(page, {
				text: '123',
				mask: '%d-%d',
				maskRepetitions: true,
				maskPlaceholder: '🧑‍🤝‍🧑',
				maskDelimiter: '🧑‍🤝‍🧑'
			});

			const scan = await target.evaluate((ctx) => {
				const
					{input} = ctx.$refs;

				const
					res = [];

				input.focus();
				res.push([input.selectionStart, input.selectionEnd]);

				for (let i = 0; i < 5; i++) {
					input.dispatchEvent(new KeyboardEvent('keydown', {
						key: 'ArrowLeft',
						code: 'ArrowLeft'
					}));

					res.push([input.selectionStart, input.selectionEnd]);
				}

				for (let i = 0; i < 5; i++) {
					input.dispatchEvent(new KeyboardEvent('keydown', {
						key: 'ArrowRight',
						code: 'ArrowRight'
					}));

					res.push([input.selectionStart, input.selectionEnd]);
				}

				return res;
			});

			expect(scan).toEqual([
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
			]);
		});
	});
};
