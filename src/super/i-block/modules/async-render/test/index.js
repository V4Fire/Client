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
	h = include('tests/helpers');

/**
 * Starts a test
 *
 * @param {Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	let
		target;

	beforeAll(async () => {
		await page.evaluate(() => {
			globalThis.renderComponents('b-dummy-async-render', [
				{
					attrs: {
						id: 'target'
					}
				}
			]);
		});

		target = await h.component.waitForComponent(page, '#target');
	});

	describe('`iBlock.asyncRender`', () => {
		[
			[
				'simple array rendering',
				'simple-array-rendering',
				'Element: 4',
				'Element: 1; Hook: beforeMount; Element: 2; Hook: mounted; Element: 3; Hook: mounted; Element: 4; Hook: mounted; '
			],

			[
				'array rendering with specifying a chunk size',
				'array-rendering-with-chunk-size',
				'Element: 4',
				'Element: 1; Hook: beforeMount; Element: 2; Hook: beforeMount; Element: 3; Hook: beforeMount; Element: 4; Hook: mounted; '
			],

			[
				'array rendering with specifying a start position and chunk size',
				'array-rendering-with-start-and-chunk-size',
				'Element: 4',
				'Element: 2; Hook: beforeMount; Element: 3; Hook: beforeMount; Element: 4; Hook: mounted; '
			],

			[
				'simple object rendering',
				'simple-object-rendering',
				'Element: b,',
				'Element: a,1; Hook: beforeMount; Element: b,2; Hook: mounted; '
			],

			[
				'object rendering with specifying a start position',
				'object-rendering-with-start',
				'Element: b,',
				'Element: b,2; Hook: beforeMount; '
			],

			[
				'simple string rendering',
				'simple-string-rendering',
				'Element: 🇷🇺',
				'Element: 1; Hook: beforeMount; Element: 😃; Hook: mounted; Element: à; Hook: mounted; Element: 🇷🇺; Hook: mounted; '
			],

			[
				'simple iterable rendering',
				'simple-iterable-rendering',
				'Element: 2',
				'Element: 1; Hook: beforeMount; Element: 2; Hook: mounted; '
			],

			[
				'range rendering with specifying a filter',
				'range-rendering-with-filter',
				'Element: 2',
				'Element: 0; Hook: beforeMount; Element: 2; Hook: mounted; '
			]
		].forEach(([des, selector, last, expected]) => {
			it(des, async () => {
				expect(
					await target.evaluate(async (ctx, [selector, last]) => {
						const wrapper = ctx.block.element(selector);

						if (!new RegExp(RegExp.escape(last)).test(wrapper.innerText)) {
							await ctx.localEmitter.promisifyOnce('asyncRenderComplete');
						}

						return wrapper.innerHTML;
					}, [selector, last])
				).toBe(expected);
			});
		});

		it('nullish rendering', async () => {
			expect(
				await target.evaluate((ctx) => ctx.block.element('nullish-rendering').innerHTML)
			).toBe('');
		});

		describe('emitted by a click', () => {
			[
				['range', 'Element: 0; Hook: mounted; '],
				['iterable with promises', 'Element: 1; Hook: mounted; Element: 2; Hook: mounted; '],
				['promise with iterable', 'Element: 1; Hook: mounted; Element: 2; Hook: mounted; '],
				['promise with nullish', '']

			].forEach(([name, expected]) => {
				it(`${name} rendering`, async () => {
					const
						s = name.split(/\s+/).join('-');

					expect(
						await target.evaluate((ctx, s) => ctx.block.element(`${s}-rendering-by-click`).innerHTML, s)
					).toBe('');

					expect(
						await target.evaluate(async (ctx, s) => {
							const wrapper = ctx.block.element(`${s}-rendering-by-click`);
							ctx.block.element(`${s}-rendering-by-click-btn`).click();

							await Promise.race([
								ctx.localEmitter.promisifyOnce('asyncRenderComplete'),
								ctx.async.sleep(300)
							]);

							return wrapper.innerHTML;
						}, s)
					).toBe(expected);
				});
			});
		});
	});
};
