/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	h = include('tests/helpers');

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	let
		ctx;

	const check = async (val) => {
		expect(await page.evaluate(() => globalThis.tVal)).toBe(val);
	};

	describe('updateOn', () => {
		beforeEach(async () => {
			await h.utils.reloadAndWaitForIdle(page);
			ctx = await h.component.waitForComponent(page, '#dummy-component');
		});

		it('executes a handler on event', async () => {
			await ctx.evaluate((ctx) => {
				ctx.directives.updateOn.add(ctx.$el, {
					emitter: ctx.selfEmitter,
					event: 'foo',
					handler: () => globalThis.tVal = true
				}, ctx);

				ctx.emit('foo');
			});

			await check(true);
		});

		it('executes a handler on field change', async () => {
			await ctx.evaluate((ctx) => {
				ctx.directives.updateOn.add(ctx.$el, {
					emitter: 'testField',
					handler: () => globalThis.tVal = true
				}, ctx);

				ctx.testField = 2;
			});

			await check(true);
		});

		it('executes a handler on promise resolve', async () => {
			await ctx.evaluate((ctx) => {
				globalThis.tVal = 0;

				/** @type {Function} */
				let pRes;

				ctx.directives.updateOn.add(ctx.$el, {
					emitter: new Promise((res) => pRes = res),
					single: true,
					handler: () => globalThis.tVal++,
					errorHandler: () => globalThis.tVal--
				}, ctx);

				pRes();
			});

			await check(1);
		});

		it('executes a handler once with `single` provided', async () => {
			await ctx.evaluate((ctx) => {
				globalThis.tVal = 0;

				ctx.directives.updateOn.add(ctx.$el, {
					emitter: ctx.selfEmitter,
					event: 'foo',
					single: true,
					handler: () => globalThis.tVal++
				}, ctx);

				ctx.emit('foo');
				ctx.emit('foo');
			});

			await check(1);
		});

		it('executes an error handler if promise was rejected', async () => {
			await ctx.evaluate((ctx) => {
				globalThis.tVal = 0;

				/** @type {Function} */
				let pRej;

				ctx.directives.updateOn.add(ctx.$el, {
					emitter: new Promise((res, rej) => pRej = rej),
					single: true,
					handler: () => globalThis.tVal++,
					errorHandler: () => globalThis.tVal--
				}, ctx);

				pRej();
			});

			await check(-1);
		});

		it('provides an arguments into handler', async () => {
			await ctx.evaluate((ctx) => {
				ctx.directives.updateOn.add(ctx.$el, {
					emitter: ctx.selfEmitter,
					event: 'foo',
					handler: (el, ctx, val) => globalThis.tVal = val
				}, ctx);

				ctx.emit('foo', 1);
			});

			await check(1);
		});

		it('remove', async () => {
			await ctx.evaluate((ctx) => {
				ctx.directives.updateOn.add(ctx.$el, {
					emitter: ctx.selfEmitter,
					event: 'foo',
					handler: (el, val) => globalThis.tVal = val
				}, ctx);

				ctx.directives.updateOn.remove(ctx.$el, ctx);
				ctx.emit('foo', 1);
			});

			await check(undefined);
		});
	});
};
