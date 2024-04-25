/* eslint-disable require-atomic-updates */

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
	h = include('tests/helpers').default;

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
		root;

	beforeAll(async () => {
		root = await h.component.waitForComponent(page, '.p-v4-components-demo');
	});

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('i-static-page', () => {
		describe('root modifiers', () => {
			it('simple usage', async () => {
				const scan = await root.evaluate((ctx) => {
					ctx.removeRootMod('foo');

					const
						res = [ctx.setRootMod('foo', 'bar')];

					res.push(ctx.getRootMod('foo'));
					res.push(ctx.removeRootMod('foo', 'bla'));
					res.push(ctx.getRootMod('foo'));

					res.push(ctx.removeRootMod('foo', 'bar'));
					res.push(ctx.getRootMod('foo'));

					ctx.setRootMod('foo', 'baz');

					res.push(ctx.getRootMod('foo'));
					res.push(ctx.removeRootMod('foo'));
					res.push(ctx.getRootMod('foo'));

					return res;
				});

				expect(scan).toEqual([
					true,
					'bar',

					false,
					'bar',

					true,
					undefined,

					'baz',
					true,
					undefined
				]);
			});

			it('should set classes', async () => {
				expect(
					await root.evaluate((ctx) => {
						ctx.removeRootMod('foo');
						ctx.setRootMod('foo', 'bar');
						return document.documentElement.classList.contains('p-v4-components-demo-foo-bar');
					})
				).toBeTrue();

				expect(
					await root.evaluate((ctx) => {
						ctx.removeRootMod('foo');
						return document.documentElement.classList.contains('p-v4-components-demo-foo-bar');
					})
				).toBeFalse();
			});

			it('should set classes if provided `globalName`', async () => {
				const target = await init({
					globalName: 'target'
				});

				expect(
					await target.evaluate((ctx) => {
						ctx.removeRootMod('foo');
						ctx.setRootMod('foo', 'bar');
						return document.documentElement.classList.contains('target-foo-bar');
					})
				).toBeTrue();

				expect(
					await target.evaluate((ctx) => {
						ctx.removeRootMod('foo');
						return document.documentElement.classList.contains('target-foo-bar');
					})
				).toBeFalse();
			});

			it('should set classes from another component', async () => {
				const target = await init();

				expect(
					await target.evaluate((ctx) => {
						ctx.removeRootMod('foo');
						ctx.setRootMod('foo', 'bar');
						return document.documentElement.classList.contains('b-dummy-foo-bar');
					})
				).toBeTrue();

				expect(
					await target.evaluate((ctx) => {
						ctx.removeRootMod('foo');
						return document.documentElement.classList.contains('b-dummy-foo-bar');
					})
				).toBeFalse();
			});
		});

		describe('`locale`', () => {
			it('simple usage', async () => {
				expect(await root.evaluate((ctx) => Boolean(ctx.locale))).toBeTrue();

				expect(
					await root.evaluate((ctx) => {
						ctx.locale = 'ru';
						return ctx.locale;
					})
				).toBe('ru');
			});

			it('should set the `lang` attribute', async () => {
				expect(await root.evaluate(() => Boolean(document.documentElement.getAttribute('lang'))))
					.toBeTrue();

				expect(
					await root.evaluate((ctx) => {
						ctx.locale = 'ru';
						return document.documentElement.getAttribute('lang');
					})
				).toBe('ru');
			});

			it('watching for changes', async () => {
				const scan = await root.evaluate(async (ctx) => {
					const res = [];

					ctx.locale = 'ru';
					ctx.watch('locale', (val, oldVal) => {
						res.push([val, oldVal]);
					});

					ctx.locale = 'en-US';
					await ctx.nextTick();

					ctx.locale = 'ru';
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
					['en-US', undefined],
					['ru', 'en-US']
				]);
			});
		});

		describe('`region`', () => {
			it('simple usage', async () => {
				expect(await root.evaluate((ctx) => Boolean(ctx.region))).toBeTrue();

				expect(
					await root.evaluate((ctx) => {
						ctx.region = 'RU';
						return ctx.region;
					})
				).toBe('RU');
			});

			it('watching for changes', async () => {
				const scan = await root.evaluate(async (ctx) => {
					const res = [];

					ctx.region = 'RU';
					ctx.watch('region', (val, oldVal) => {
						res.push([val, oldVal]);
					});

					ctx.region = 'US';
					await ctx.nextTick();

					ctx.region = 'RU';
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
					['US', undefined],
					['RU', 'US']
				]);
			});
		});

		describe('`reset`', () => {
			it('simple usage', async () => {
				expect(
					await root.evaluate(async (ctx) => {
						let
							res = false;

						ctx.globalEmitter.once('reset', () => {
							res = true;
						});

						ctx.reset();
						await ctx.nextTick();

						return res;
					})
				).toBeTrue();
			});

			it('silence reload', async () => {
				expect(
					await root.evaluate(async (ctx) => {
						let
							res = false;

						ctx.globalEmitter.once('reset.silence', () => {
							res = true;
						});

						ctx.reset('silence');
						await ctx.nextTick();

						return res;
					})
				).toBeTrue();
			});
		});
	});

	async function init(attrs = {}) {
		await page.evaluate((attrs) => {
			const scheme = [
				{
					attrs: {
						id: 'target',
						...attrs
					}
				}
			];

			globalThis.renderComponents('b-dummy', scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
