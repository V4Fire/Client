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

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-list simple using', () => {
		it('initialization', async () => {
			const
				target = await init();

			expect(
				await target.evaluate((ctx) => {
					const items = Array.from(ctx.block.elements('item'));
					return items.map((el) => el.textContent.trim());
				})

			).toEqual(['Foo', 'Bla']);

			expect(
				await target.evaluate((ctx) => ctx.block.element('link').getAttribute('title'))
			).toBe('Custom attr');

			expect(await target.evaluate((ctx) => ctx.active)).toBeUndefined();
		});

		it('initialization with the predefined active element', async () => {
			const target = await init({active: 0});
			expect(await target.evaluate((ctx) => ctx.active)).toBe(0);
		});

		it('initialization with the predefined active element (primitive) with `multiple = true`', async () => {
			const target = await init({active: 0, multiple: true});
			expect(await target.evaluate((ctx) => [...ctx.active])).toEqual([0]);
		});

		it('initialization with the predefined active element (array) with `multiple = true`', async () => {
			const target = await init({active: [0, 1], multiple: true});
			expect(await target.evaluate((ctx) => [...ctx.active])).toEqual([0, 1]);
		});

		it('initialization with the predefined active element (set) with `multiple = true`', async () => {
			const target = await init({active: 'new Set([0, 1])', multiple: true});
			expect(await target.evaluate((ctx) => [...ctx.active])).toEqual([0, 1]);
		});

		it('changing of items', async () => {
			const
				target = await init();

			expect(
				await target.evaluate(async (ctx) => {
					const
						log = [];

					ctx.on('onItemsChange', (val) => {
						log.push(Object.fastClone(val));
					});

					ctx.items = [{label: 'Bar', value: []}];

					log.push(ctx.items);

					await ctx.nextTick();
					return log;
				})

			).toEqual([
				[{label: 'Bar', value: []}],
				[{label: 'Bar', value: []}]
			]);
		});

		it('switching of an active element', async () => {
			const
				target = await init();

			expect(
				await target.evaluate((ctx) => {
					ctx.setActive(0);
					return ctx.active;
				})

			).toBe(0);

			expect(
				await target.evaluate((ctx) => {
					ctx.setActive(1);
					return ctx.active;
				})

			).toBe(1);

			expect(await target.evaluate((ctx) => ctx.unsetActive(1))).toBeFalse();
			expect(await target.evaluate((ctx) => ctx.active)).toBe(1);
		});

		it('switching of an active element with `cancelable = true`', async () => {
			const
				target = await init({cancelable: true});

			expect(
				await target.evaluate((ctx) => {
					ctx.setActive(1);
					return ctx.active;
				})

			).toBe(1);

			expect(await target.evaluate((ctx) => ctx.unsetActive(1))).toBeTrue();
			expect(await target.evaluate((ctx) => ctx.active)).toBeUndefined();

			expect(
				await target.evaluate((ctx) => {
					ctx.toggleActive(1);
					return ctx.active;
				})

			).toBe(1);
		});

		it('switching of an active element with `multiple = true`', async () => {
			const
				target = await init({multiple: true});

			expect(
				await target.evaluate((ctx) => {
					ctx.setActive(1);
					ctx.setActive(0);
					return [...ctx.active.keys()];
				})

			).toEqual([1, 0]);

			expect(
				await target.evaluate((ctx) => {
					ctx.unsetActive(1);
					ctx.unsetActive(0);
					return [...ctx.active.values()];
				})

			).toEqual([]);
		});

		it('switching of an active element with `multiple = true; cancelable = false`', async () => {
			const
				target = await init({multiple: true, cancelable: false});

			expect(
				await target.evaluate((ctx) => {
					ctx.setActive(1);
					ctx.setActive(0);
					return [...ctx.active.keys()];
				})

			).toEqual([1, 0]);

			expect(
				await target.evaluate((ctx) => {
					ctx.unsetActive(1);
					ctx.unsetActive(0);
					return [...ctx.active.values()];
				})

			).toEqual([1, 0]);
		});

		it('checking of `activeElement`', async () => {
			const target = await init({active: 0});
			expect(await target.evaluate((ctx) => ctx.activeElement.tagName)).toBe('BUTTON');
		});

		it('checking of `activeElement` with `multiple = true`', async () => {
			const
				target = await init({active: [0, 1], multiple: true});

			expect(await target.evaluate((ctx) => Array.from(ctx.activeElement).map((el) => el.tagName)))
				.toEqual(['BUTTON', 'BUTTON']);
		});

		it('listening of change events', async () => {
			const
				target = await init();

			expect(
				await target.evaluate((ctx) => {
					const
						log = [];

					ctx.on('immediateChange', (component, value) => {
						log.push(['immediateChange', value]);
					});

					ctx.on('onChange', (value) => {
						log.push(['change', value]);
					});

					ctx.on('onActionChange', (value) => {
						log.push(['actionChange', value]);
					});

					log.push(ctx.setActive(0));

					const event = new Event('click', {bubbles: true});
					ctx.block.elements('item')[1].querySelector(ctx.block.getElSelector('link')).dispatchEvent(event);

					return log;
				})

			).toEqual([
				['immediateChange', 0],
				['change', 0],

				true,

				['immediateChange', 1],
				['change', 1],
				['actionChange', 1]
			]);
		});

		it('watching for `active`', async () => {
			const
				target = await init();

			expect(
				await target.evaluate(async (ctx) => {
					const
						log = [];

					ctx.watch('active', {immediate: true}, (val, oldVal, p) => {
						log.push([val, oldVal, p?.path.join('.')]);
					});

					ctx.setActive(0);

					await ctx.nextTick();

					ctx.setActive(1);

					await ctx.nextTick();

					return log;
				})

			).toEqual([
				[undefined, undefined, undefined],
				[0, undefined, 'active'],
				[1, 0, 'active']
			]);
		});

		it('watching for `active` with `multiple = true`', async () => {
			const
				target = await init({multiple: true});

			expect(
				await target.evaluate(async (ctx) => {
					const
						log = [];

					ctx.watch('active', {immediate: true}, (val, oldVal, p) => {
						log.push([[...val], oldVal && [...oldVal], p?.path.join('.')]);
					});

					ctx.setActive(0);

					await ctx.nextTick();

					ctx.setActive(1);

					await ctx.nextTick();

					return log;
				})

			).toEqual([
				[[], undefined, undefined],
				[[0], [], 'active'],
				[[0, 1], [0], 'active']
			]);
		});
	});

	async function init(attrs = {}) {
		await page.evaluate((attrs) => {
			const scheme = [
				{
					attrs: {
						id: 'target',

						items: [
							{
								label: 'Foo',
								value: 0,
								attrs: {
									title: 'Custom attr'
								}
							},

							{
								label: 'Bla',
								value: 1
							}
						],

						...attrs,
						// eslint-disable-next-line no-eval
						active: /new /.test(attrs.active) ? eval(attrs.active) : attrs.active
					}
				}
			];

			globalThis.renderComponents('b-list', scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
