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
	{initInput} = include('src/dummies/b-dummy-text/test/helpers');

/**
 * @param {Page} page
 */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-dummy-text masked input by using keyboard events', () => {
		it('typing a text with the static mask', async () => {
			const target = await initInput(page, {
				mask: '%d🧑‍🤝‍🧑%d'
			});

			const scan = await target.evaluate((ctx) => {
				const
					res = [],
					input = ctx.block.element('input');

				input.dispatchEvent(new KeyboardEvent('keydown', {
					key: '1',
					code: 'Key1'
				}));

				res.push(input.value);

				input.dispatchEvent(new KeyboardEvent('keydown', {
					key: 'a',
					code: 'KeyA'
				}));

				res.push(input.value);

				input.dispatchEvent(new KeyboardEvent('keydown', {
					key: '2',
					code: 'Key2'
				}));

				res.push(input.value);

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
					res = [],
					input = ctx.block.element('input');

				input.dispatchEvent(new KeyboardEvent('keydown', {
					key: '1',
					code: 'Key1'
				}));

				res.push(input.value);

				input.dispatchEvent(new KeyboardEvent('keydown', {
					key: 'a',
					code: 'KeyA'
				}));

				res.push(input.value);

				input.dispatchEvent(new KeyboardEvent('keydown', {
					key: '2',
					code: 'Key2'
				}));

				res.push(input.value);

				input.dispatchEvent(new KeyboardEvent('keydown', {
					key: '5',
					code: 'Key5'
				}));

				res.push(input.value);

				input.dispatchEvent(new KeyboardEvent('keydown', {
					key: '8',
					code: 'Key8'
				}));

				res.push(input.value);

				return res;
			});

			expect(scan).toEqual(['1-🧑‍🤝‍🧑', '1-🧑‍🤝‍🧑', '1-2', '1-2 5-🧑‍🤝‍🧑', '1-2 5-8']);
		});
	});
};
