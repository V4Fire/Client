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

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('`iBlock.field`', () => {
		describe('system fields', () => {
			it('CRUD', async () => {
				const target = await init();

				const scan = await target.evaluate((ctx) => {
					const
						res = [ctx.field.get('tmp.foo.bar')];

					ctx.watch('tmp.foo.bar', {deep: true, immediate: true, collapse: false}, (val) => {
						res.push(val);
					});

					ctx.field.set('tmp.foo.bar', 1);
					res.push(ctx.field.get('tmp.foo.bar'));

					ctx.field.delete('tmp.foo.bar');
					res.push(ctx.field.get('tmp.foo.bar'));

					return res;
				});

				expect(scan).toEqual([
					undefined,
					undefined,

					1,
					1,

					undefined,
					undefined
				]);
			});

			it('CRUD on a third-party object', async () => {
				const target = await init();

				const scan = await target.evaluate((ctx) => {
					const
						res = [ctx.field.get('tmp.foo.bar', ctx.r)];

					ctx.watch('r.tmp.foo.bar', {deep: true, immediate: true, collapse: false}, (val) => {
						res.push(val);
					});

					ctx.field.set('tmp.foo.bar', 1, ctx.r);
					res.push(ctx.field.get('tmp.foo.bar', ctx.r));

					ctx.field.delete('tmp.foo.bar', ctx.r);
					res.push(ctx.field.get('tmp.foo.bar', ctx.r));

					return res;
				});

				expect(scan).toEqual([
					undefined,
					undefined,

					1,
					1,

					undefined,
					undefined
				]);
			});

			it('CRUD with providing `getter`', async () => {
				const target = await init();

				const scan = await target.evaluate((ctx) => {
					const
						getter = (prop, obj) => Object.get(obj, prop.camelize(false)),
						res = [ctx.field.get('tmp.foo_bla.bar', getter)];

					ctx.watch('tmp.fooBla.bar', {deep: true, immediate: true, collapse: false}, (val) => {
						res.push(val);
					});

					ctx.field.set('tmp.foo_bla.bar', 1, String.camelize(false));
					res.push(ctx.field.get('tmp.foo_bla.bar', getter));

					ctx.field.delete('tmp.foo_bla.bar', String.camelize(false));
					res.push(ctx.field.get('tmp.foo_bla.bar', getter));

					return res;
				});

				expect(scan).toEqual([
					undefined,
					undefined,

					1,
					1,

					undefined,
					undefined
				]);
			});

			it('CRUD on a third-party object with providing `getter`', async () => {
				const target = await init();

				const scan = await target.evaluate((ctx) => {
					const
						getter = (prop, obj) => Object.get(obj, prop.camelize(false)),
						res = [ctx.field.get('tmp.foo_bla.bar', ctx.r, getter)];

					ctx.watch('r.tmp.fooBla.bar', {deep: true, immediate: true, collapse: false}, (val) => {
						res.push(val);
					});

					ctx.field.set('tmp.foo_bla.bar', 1, ctx.r, String.camelize(false));
					res.push(ctx.field.get('tmp.foo_bla.bar', ctx.r, getter));

					ctx.field.delete('tmp.foo_bla.bar', ctx.r, String.camelize(false));
					res.push(ctx.field.get('tmp.foo_bla.bar', ctx.r, getter));

					return res;
				});

				expect(scan).toEqual([
					undefined,
					undefined,

					1,
					1,

					undefined,
					undefined
				]);
			});
		});

		describe('fields', () => {
			it('CRUD', async () => {
				const target = await init();

				const scan = await target.evaluate((ctx) => {
					const
						res = [ctx.field.get('reactiveTmp.foo.bar')];

					ctx.watch('reactiveTmp.foo.bar', {deep: true, immediate: true, collapse: false}, (val) => {
						res.push(val);
					});

					ctx.field.set('reactiveTmp.foo.bar', 1);
					res.push(ctx.field.get('reactiveTmp.foo.bar'));

					ctx.field.delete('reactiveTmp.foo.bar');
					res.push(ctx.field.get('reactiveTmp.foo.bar'));

					return res;
				});

				expect(scan).toEqual([
					undefined,
					undefined,

					1,
					1,

					undefined,
					undefined
				]);
			});

			it('CRUD on a third-party object', async () => {
				const target = await init();

				const scan = await target.evaluate((ctx) => {
					const
						res = [ctx.field.get('reactiveTmp.foo.bar', ctx.r)];

					ctx.watch('r.reactiveTmp.foo.bar', {deep: true, immediate: true, collapse: false}, (val) => {
						res.push(val);
					});

					ctx.field.set('reactiveTmp.foo.bar', 1, ctx.r);
					res.push(ctx.field.get('reactiveTmp.foo.bar', ctx.r));

					ctx.field.delete('reactiveTmp.foo.bar', ctx.r);
					res.push(ctx.field.get('reactiveTmp.foo.bar', ctx.r));

					return res;
				});

				expect(scan).toEqual([
					undefined,
					undefined,

					1,
					1,

					undefined,
					undefined
				]);
			});

			it('CRUD with providing `getter`', async () => {
				const target = await init();

				const scan = await target.evaluate((ctx) => {
					const
						getter = (prop, obj) => Object.get(obj, prop.camelize(false)),
						res = [ctx.field.get('reactiveTmp.foo_bla.bar', getter)];

					ctx.watch('reactiveTmp.fooBla.bar', {deep: true, immediate: true, collapse: false}, (val) => {
						res.push(val);
					});

					ctx.field.set('reactiveTmp.foo_bla.bar', 1, String.camelize(false));
					res.push(ctx.field.get('reactiveTmp.foo_bla.bar', getter));

					ctx.field.delete('reactiveTmp.foo_bla.bar', String.camelize(false));
					res.push(ctx.field.get('reactiveTmp.foo_bla.bar', getter));

					return res;
				});

				expect(scan).toEqual([
					undefined,
					undefined,

					1,
					1,

					undefined,
					undefined
				]);
			});

			it('CRUD on a third-party object with providing `getter`', async () => {
				const target = await init();

				const scan = await target.evaluate((ctx) => {
					const
						getter = (prop, obj) => Object.get(obj, prop.camelize(false)),
						res = [ctx.field.get('reactiveTmp.foo_bla.bar', ctx.r, getter)];

					ctx.watch('r.reactiveTmp.fooBla.bar', {deep: true, immediate: true, collapse: false}, (val) => {
						res.push(val);
					});

					ctx.field.set('reactiveTmp.foo_bla.bar', 1, ctx.r, String.camelize(false));
					res.push(ctx.field.get('reactiveTmp.foo_bla.bar', ctx.r, getter));

					ctx.field.delete('reactiveTmp.foo_bla.bar', ctx.r, String.camelize(false));
					res.push(ctx.field.get('reactiveTmp.foo_bla.bar', ctx.r, getter));

					return res;
				});

				expect(scan).toEqual([
					undefined,
					undefined,

					1,
					1,

					undefined,
					undefined
				]);
			});
		});

		describe('props', () => {
			it('getting a prop', async () => {
				const target = await init();
				expect(await target.evaluate((ctx) => ctx.field.get('p.fooBar'))).toBe(1);
			});

			it('getting a prop via `getter`', async () => {
				const target = await init();
				expect(
					await target.evaluate((ctx) => {
						const getter = (prop, obj) => Object.get(obj, prop.camelize(false));
						return ctx.field.get('p.foo_bar', getter);
					})
				).toBe(1);
			});
		});
	});

	async function init() {
		await page.evaluate(() => {
			const scheme = [
				{
					attrs: {
						id: 'target',
						p: {fooBar: 1}
					}
				}
			];

			globalThis.renderComponents('b-dummy', scheme);
		});

		return h.component.waitForComponent(page, '#target');
	}
};
