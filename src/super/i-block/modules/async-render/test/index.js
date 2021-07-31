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

/**
 * Starts a test
 *
 * @param {Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('`iBlock.asyncRender`', () => {
		it('nullish rendering', async () => {
			const target = await init('nullish rendering');
			expect(await target.evaluate((ctx) => ctx.block.element('result').innerHTML)).toBe('');
		});

		[
			'infinite rendering',
			'infinite rendering with providing a function'
		].forEach((desc) => {
			it(desc, async () => {
				const target = await init(desc);

				expect(
					await target.evaluate((ctx) => ctx.block.element('result').textContent.trim())
				).toBe('Element: 0; Hook: beforeMount;');

				expect(
					await target.evaluate(async (ctx) => {
						const wrapper = ctx.block.element('result');
						ctx.block.element('force').click();
						await ctx.localEmitter.promisifyOnce('asyncRenderChunkComplete');
						return wrapper.textContent.trim();
					})
				).toBe('Element: 1; Hook: mounted;');

				expect(
					await target.evaluate(async (ctx) => {
						const wrapper = ctx.block.element('result');
						ctx.block.element('defer-force').click();
						await ctx.localEmitter.promisifyOnce('asyncRenderChunkComplete');
						return wrapper.textContent.trim();
					})
				).toBe('Element: 2; Hook: mounted;');
			});
		});

		it('deactivating/activating the parent component while rendering', async () => {
			const target = await init('deactivating/activating the parent component while rendering');

			expect(
				await target.evaluate(async (ctx) => {
					const wrapper = ctx.block.element('result');

					const
						res = [wrapper.textContent.trim()];

					ctx.block.element('deactivate').click();
					await ctx.async.sleep(500);

					res.push(wrapper.textContent.trim());
					return res;
				})
			).toEqual(['', '']);

			expect(
				await target.evaluate(async (ctx) => {
					const wrapper = ctx.block.element('result');
					ctx.block.element('activate').click();
					await ctx.localEmitter.promisifyOnce('asyncRenderComplete');
					return wrapper.textContent.trim();
				})
			).toBe('Element: 0; Hook: activated; Element: 1; Hook: activated;');
		});

		it('updating the parent component state', async () => {
			const target = await init('updating the parent component state');

			expect(
				await target.evaluate(async (ctx) => {
					const wrapper = ctx.block.element('result');

					const
						res = [wrapper.textContent.trim()];

					ctx.block.element('update').click();
					await ctx.localEmitter.promisifyOnce('asyncRenderComplete');

					res.push(wrapper.textContent.trim());

					res.push(ctx.tmp.oldRefs[0].hook);
					res.push(ctx.tmp.oldRefs[1].hook);

					return res;
				})
			).toEqual([
				'Element: 0; Hook: beforeMount;  Element: 1; Hook: beforeMount;',
				'Element: 0; Hook: beforeUpdate;  Element: 1; Hook: beforeMount;',

				'updated',
				'destroyed'
			]);
		});

		it('clearing by the specified group name', async () => {
			const target = await init('clearing by the specified group name');

			expect(
				await target.evaluate(async (ctx) => {
					const wrapper = ctx.block.element('result');

					const
						res = [wrapper.textContent.trim()];

					ctx.block.element('update').click();
					await ctx.localEmitter.promisifyOnce('asyncRenderComplete');

					res.push(wrapper.textContent.trim());
					return res;
				})
			).toEqual([
				'Element: 0; Hook: beforeMount; Element: 1; Hook: mounted;',
				'Element: 0; Hook: beforeUpdate; Element: 1; Hook: mounted; Element: 1; Hook: updated;'
			]);

			expect(
				await target.evaluate((ctx) => {
					const wrapper = ctx.block.element('result');
					ctx.block.element('clear').click();
					return wrapper.textContent.trim();
				})
			).toBe('Element: 0; Hook: beforeUpdate;');
		});

		it('loading dynamic modules', async () => {
			const target = await init('loading dynamic modules');

			expect(
				await target.evaluate(async (ctx) => {
					const wrapper = ctx.block.element('result');
					await ctx.localEmitter.promisifyOnce('asyncRenderComplete');
					return wrapper.textContent.trim();
				})
			).toBe('Ok 1  Ok 2');
		});

		[
			[
				'simple array rendering',
				'Element: 4',
				'Element: 1; Hook: beforeMount; Element: 2; Hook: mounted; Element: 3; Hook: mounted; Element: 4; Hook: mounted;'
			],

			[
				'array rendering with specifying a chunk size',
				'Element: 4',
				'Element: 1; Hook: beforeMount; Element: 2; Hook: beforeMount; Element: 3; Hook: beforeMount; Element: 4; Hook: mounted;'
			],

			[
				'array rendering with specifying a start position and chunk size',
				'Element: 4',
				'Element: 2; Hook: beforeMount; Element: 3; Hook: beforeMount; Element: 4; Hook: mounted;'
			],

			[
				'simple object rendering',
				'Element: b,',
				'Element: a,1; Hook: beforeMount; Element: b,2; Hook: mounted;'
			],

			[
				'object rendering with specifying a start position',
				'Element: b,',
				'Element: b,2; Hook: beforeMount;'
			],

			[
				'simple string rendering',
				'Element: 🇷🇺',
				'Element: 1; Hook: beforeMount; Element: 😃; Hook: mounted; Element: à; Hook: mounted; Element: 🇷🇺; Hook: mounted;'
			],

			[
				'simple iterable rendering',
				'Element: 2',
				'Element: 1; Hook: beforeMount; Element: 2; Hook: mounted;'
			],

			[
				'range rendering with specifying a filter',
				'Element: 2',
				'Element: 0; Hook: beforeMount; Element: 2; Hook: mounted;'
			],

			[
				'range rendering with `useRAF`',
				'Element: 1',
				'Element: 0; Hook: beforeMount; Element: 1; Hook: mounted;'
			]
		].forEach(([desc, last, expected]) => {
			it(desc, async () => {
				const target = await init(desc);

				expect(
					await target.evaluate(async (ctx, last) => {
						const wrapper = ctx.block.element('result');

						if (!new RegExp(RegExp.escape(last)).test(wrapper.textContent)) {
							await ctx.localEmitter.promisifyOnce('asyncRenderComplete');
						}

						return wrapper.textContent.trim();
					}, last)
				).toBe(expected);
			});
		});

		[
			['range rendering by click', 'Element: 0; Hook: mounted;'],
			['iterable with promises rendering by click', 'Element: 1; Hook: mounted; Element: 2; Hook: mounted;'],
			['promise with iterable rendering by click', 'Element: 1; Hook: mounted; Element: 2; Hook: mounted;'],
			['promise with nullish rendering by click', '']

		].forEach(([desc, expected]) => {
			it(desc, async () => {
				const target = await init(desc);

				expect(await target.evaluate((ctx) => ctx.block.element('result').innerHTML))
					.toBe('');

				expect(
					await target.evaluate(async (ctx) => {
						const wrapper = ctx.block.element('result');
						ctx.block.element('emit').click();

						await Promise.race([
							ctx.localEmitter.promisifyOnce('asyncRenderComplete'),
							ctx.async.sleep(300)
						]);

						return wrapper.textContent.trim();
					})
				).toBe(expected);
			});
		});
	});

	async function init(stage) {
		await page.evaluate((stage) => {
			const scheme = [
				{
					attrs: {
						id: 'target',
						stage
					}
				}
			];

			globalThis.renderComponents('b-dummy-async-render', scheme);
		}, stage);

		return h.component.waitForComponent(page, '#target');
	}
};
