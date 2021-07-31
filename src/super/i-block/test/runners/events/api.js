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

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe("i-block events' API", () => {
		it('should normalize an event name', async () => {
			const target = await init();

			const scan = await target.evaluate((ctx) => {
				const
					res = [];

				ctx.on('onFoo_bar', (...args) => {
					res.push(...args);
				});

				ctx.on('onFoo-bar', (...args) => {
					res.push(...args);
				});

				ctx.on('onFooBar', (...args) => {
					res.push(...args);
				});

				ctx.emit('foo bar', 1);

				return res;
			});

			expect(scan).toEqual([1, 1, 1]);
		});

		it('should emit double events', async () => {
			const target = await init();

			const scan = await target.evaluate((ctx) => {
				const
					res = [];

				ctx.on('foo', (ctx, ...args) => {
					res.push(ctx.componentName, ...args);
				});

				ctx.on('onFoo', (...args) => {
					res.push(...args);
				});

				ctx.emit('foo', 1, {a: 1});

				return res;
			});

			expect(scan).toEqual(['b-dummy', 1, {a: 1}, 1, {a: 1}]);
		});

		it('removing listeners', async () => {
			const target = await init();

			const scan = await target.evaluate((ctx) => {
				const
					res = [];

				ctx.on('foo', (ctx, ...args) => {
					res.push(ctx.componentName, ...args);
				});

				ctx.on('onFoo', (...args) => {
					res.push(...args);
				});

				ctx.off('onFoo');

				ctx.off('foo', () => {
					// Loopback
				});

				ctx.emit('foo', 1, {a: 1});

				return res;
			});

			expect(scan).toEqual(['b-dummy', 1, {a: 1}]);
		});

		it('removing listeners via `async`', async () => {
			const target = await init();

			const scan = await target.evaluate((ctx) => {
				const
					res = [];

				ctx.on('foo', (ctx, ...args) => {
					res.push(ctx.componentName, ...args);
				});

				ctx.on('onFoo', (...args) => {
					res.push(...args);
				}, {group: 'foo'});

				ctx.async.off({group: 'foo'});
				ctx.emit('foo', 1, {a: 1});

				return res;
			});

			expect(scan).toEqual(['b-dummy', 1, {a: 1}]);
		});

		it('`once`', async () => {
			const target = await init();

			const scan = await target.evaluate((ctx) => {
				const
					res = [];

				ctx.on('foo', (ctx, ...args) => {
					res.push(ctx.componentName, ...args);
				});

				ctx.once('onFoo', (...args) => {
					res.push(...args);
				});

				ctx.emit('foo', 1, {a: 1});
				ctx.emit('foo', 2, {a: 2});

				return res;
			});

			expect(scan).toEqual([
				'b-dummy',
				1,
				{a: 1},

				1,
				{a: 1},

				'b-dummy',
				2,
				{a: 2}
			]);
		});

		it('`promisifyOnce`', async () => {
			const target = await init();

			const scan = await target.evaluate((ctx) => {
				const res = ctx.promisifyOnce('onFoo');
				ctx.emit('foo', 1, {a: 1});

				return res;
			});

			expect(scan).toEqual(1);
		});

		describe('dispatching of events', () => {
			it('simple usage', async () => {
				const target = await init({
					dispatching: true
				});

				const scan = await target.evaluate((ctx) => {
					const
						res = [];

					ctx.on('onFoo', (...args) => {
						res.push(...args);
					});

					ctx.rootEmitter.on('b-dummy::foo', (ctx, ...args) => {
						res.push(ctx.componentName, ...args);
					});

					ctx.rootEmitter.on('b-dummy::onFoo', (...args) => {
						res.push(...args);
					});

					ctx.emit('foo', 1, {a: 1});

					return res;
				});

				expect(scan).toEqual([1, {a: 1}, 'b-dummy', 1, {a: 1}, 1, {a: 1}]);
			});

			it('providing `globalName`', async () => {
				const target = await init({
					dispatching: true,
					globalName: 'baz'
				});

				const scan = await target.evaluate((ctx) => {
					const
						res = [];

					ctx.on('onFoo', (...args) => {
						res.push(...args);
					});

					ctx.rootEmitter.on('b-dummy::foo', (ctx, ...args) => {
						res.push(ctx.componentName, ...args);
					});

					ctx.rootEmitter.on('b-dummy::onFoo', (...args) => {
						res.push(...args);
					});

					ctx.rootEmitter.on('baz::foo', (ctx, ...args) => {
						res.push(ctx.componentName, ...args);
					});

					ctx.rootEmitter.on('baz::onFoo', (...args) => {
						res.push(...args);
					});

					ctx.emit('foo', 1, {a: 1});

					return res;
				});

				expect(scan).toEqual([
					1,
					{a: 1},

					'b-dummy',
					1,
					{a: 1},

					1,
					{a: 1},

					'b-dummy',
					1,
					{a: 1},

					1,
					{a: 1}
				]);
			});

			it('providing `selfDispatching`', async () => {
				const target = await init({
					dispatching: true
				});

				const scan = await target.evaluate((ctx) => {
					const
						res = [];

					Object.set(ctx.r, 'selfDispatching', true);

					ctx.on('onFoo', (...args) => {
						res.push(...args);
					});

					ctx.rootEmitter.on('foo', (ctx, ...args) => {
						res.push(ctx.componentName, ...args);
					});

					ctx.rootEmitter.on('onFoo', (...args) => {
						res.push(...args);
					});

					ctx.emit('foo', 1, {a: 1});
					Object.set(ctx.r, 'selfDispatching', false);

					return res;
				});

				expect(scan).toEqual([1, {a: 1}, 'b-dummy', 1, {a: 1}, 1, {a: 1}]);
			});

			it("shouldn't self dispatch hook events", async () => {
				const target = await init({
					dispatching: true
				});

				const scan = await target.evaluate((ctx) => {
					const
						res = [];

					Object.set(ctx.r, 'selfDispatching', true);

					ctx.on('onComponentHook:beforeDestroy', (...args) => {
						res.push(...args);
					});

					ctx.on('onComponentStatus:destroyed', (...args) => {
						res.push(...args);
					});

					ctx.rootEmitter.on('onComponentHook:beforeDestroy', (ctx, ...args) => {
						res.push(ctx.componentName, ...args);
					});

					ctx.rootEmitter.on('onComponentStatus:destroyed', (ctx, ...args) => {
						res.push(ctx.componentName, ...args);
					});

					ctx.$destroy();
					Object.set(ctx.r, 'selfDispatching', false);

					return res;
				});

				expect(scan).toEqual(['beforeDestroy', 'mounted', 'destroyed', 'ready']);
			});
		});
	});

	async function init(attrs = {}) {
		await page.evaluate((attrs = {}) => {
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
