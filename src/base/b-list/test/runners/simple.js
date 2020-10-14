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
 * @param {Page} page
 */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-list simple list with defined items', () => {
		const init = async (attrs = {}) => {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							id: 'target',

							items: [
								{
									label: 'Foo',
									value: 0
								},

								{
									label: 'Bla',
									value: 1
								}
							],

							...attrs
						}
					}
				];

				globalThis.renderComponents('b-list', scheme);
			}, attrs);

			await h.bom.waitForIdleCallback(page);
			return h.component.waitForComponent(page, '#target');
		};

		it('initialization', async () => {
			const
				target = await init();

			expect(
				await target.evaluate((ctx) => {
					const items = Array.from(ctx.block.elements('item'));
					return items.map((el) => el.textContent.trim());
				})

			).toEqual(['Foo', 'Bla']);

			expect(await target.evaluate((ctx) => ctx.active)).toBeUndefined();
		});

		it('initialization with the predefined active element', async () => {
			const target = await init({active: 0});
			expect(await target.evaluate((ctx) => ctx.active)).toBe(0);
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
			expect(await target.evaluate((ctx) => ctx.activeElement.tagName)).toBe('A');
		});

		it('checking of `activeElement` with `multiple = true`', async () => {
			const
				target = await init({active: [0, 1], multiple: true});

			expect(await target.evaluate((ctx) => Array.from(ctx.activeElement).map((el) => el.tagName)))
				.toEqual(['A', 'A']);
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
				await target.evaluate((ctx) => {
					const
						log = [];

					ctx.watch('active', {immediate: true}, (val, oldVal, p) => {
						log.push([val, oldVal, p?.path.join('.')]);
					});

					ctx.setActive(0);
					ctx.setActive(1);

					return log;
				})

			).toEqual([
				[],
				[0, undefined, 'active'],
				[1, 0, 'active']
			]);
		});
	});
};
