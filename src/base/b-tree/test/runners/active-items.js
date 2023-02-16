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

	describe('active elements.', () => {
		it('initialization with the predefined active element', async () => {
			const target = await init({active: 0});
			expect(await target.evaluate((ctx) => ctx.active)).toBe(0);

			expect(
				await target.evaluate(async (ctx) => ctx.block.getElMod(await ctx.activeElement, 'node', 'active'))
			).toBe('true');
		});

		// it('initialization with the predefined active element (primitive) with `multiple = true`', async () => {
		// 	const target = await init({active: 0, multiple: true});
		// 	expect(await target.evaluate((ctx) => [...ctx.active])).toEqual([0]);
		// });
		//
		// it('initialization with the predefined active element (array) with `multiple = true`', async () => {
		// 	const target = await init({active: [0, 1], multiple: true});
		// 	expect(await target.evaluate((ctx) => [...ctx.active])).toEqual([0, 1]);
		// });
		//
		// it('initialization with the predefined active element (set) with `multiple = true`', async () => {
		// 	const target = await init({active: 'new Set([0, 1])', multiple: true});
		// 	expect(await target.evaluate((ctx) => [...ctx.active])).toEqual([0, 1]);
		// });
		//
		// describe('switching of an active element ', () => {
		// 	it('default', async () => {
		// 		const
		// 			target = await init();
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.setActive(0);
		// 				return ctx.active;
		// 			})
		// 		).toBe(0);
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.setActive(1);
		// 				return ctx.active;
		// 			})
		// 		).toBe(1);
		//
		// 		expect(await target.evaluate((ctx) => ctx.unsetActive(1))).toBeFalse();
		// 		expect(await target.evaluate((ctx) => ctx.active)).toBe(1);
		// 	});
		//
		// 	it('with `cancelable = true`', async () => {
		// 		const
		// 			target = await init({cancelable: true});
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.setActive(1);
		// 				return ctx.active;
		// 			})
		// 		).toBe(1);
		//
		// 		expect(await target.evaluate((ctx) => ctx.unsetActive(1))).toBeTrue();
		// 		expect(await target.evaluate((ctx) => ctx.active)).toBeUndefined();
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.toggleActive(1);
		// 				return ctx.active;
		// 			})
		// 		).toBe(1);
		// 	});
		//
		// 	it('with `multiple = true`', async () => {
		// 		const
		// 			target = await init({multiple: true});
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.setActive(1);
		// 				ctx.setActive(0);
		// 				return [...ctx.active.keys()];
		// 			})
		// 		).toEqual([1, 0]);
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.unsetActive(1);
		// 				ctx.unsetActive(0);
		// 				return [...ctx.active.values()];
		// 			})
		// 		).toEqual([]);
		// 	});
		//
		// 	it('with `multiple = true; cancelable = false`', async () => {
		// 		const
		// 			target = await init({multiple: true, cancelable: false});
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.setActive(1);
		// 				ctx.setActive(5);
		// 				return [...ctx.active.keys()];
		// 			})
		// 		).toEqual([1, 5]);
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.unsetActive(1);
		// 				ctx.unsetActive(5);
		// 				return [...ctx.active.values()];
		// 			})
		// 		).toEqual([1, 5]);
		// 	});
		//
		// 	it('with `multiple = true; cancelable = true`', async () => {
		// 		const
		// 			target = await init({multiple: true, cancelable: true});
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.setActive(1);
		// 				ctx.setActive(0);
		// 				return [...ctx.active];
		// 			})
		// 		).toEqual([1, 0]);
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.unsetActive(1);
		// 				ctx.unsetActive(0);
		// 				return [...ctx.active];
		// 			})
		// 		).toEqual([]);
		// 	});
		//
		// 	it('and unfold parents folds', async () => {
		// 		const
		// 			target = await init();
		//
		// 		await target.evaluate((ctx) => ctx.setActive(5));
		//
		// 		const
		// 			el1 = await page.waitForSelector('[data-id="2"]', { state: 'attached' }),
		// 			el2 = await page.waitForSelector('[data-id="4"]', { state: 'attached' });
		//
		// 		expect([
		// 			(await el1.getAttribute('class')).includes('folded_false'),
		// 			(await el2.getAttribute('class')).includes('folded_false')
		// 		]).toEqual([true, true]);
		// 	});
		//
		// 	it('`toggleActive` and unfold parents folds', async () => {
		// 		const
		// 			target = await init();
		//
		// 		await target.evaluate((ctx) => ctx.toggleActive(5));
		//
		// 		const
		// 			el1 = await page.waitForSelector('[data-id="2"]', { state: 'attached' }),
		// 			el2 = await page.waitForSelector('[data-id="4"]', { state: 'attached' });
		//
		// 		expect([
		// 			(await el1.getAttribute('class')).includes('folded_false'),
		// 			(await el2.getAttribute('class')).includes('folded_false')
		// 		]).toEqual([true, true]);
		// 	});
		//
		// 	it('with `toggleActive` with primitive value', async () => {
		// 		const
		// 			target = await init({multiple: true});
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.toggleActive(1);
		// 				ctx.toggleActive(0);
		// 				ctx.toggleActive(1);
		// 				return [...ctx.active];
		// 			})
		// 		).toEqual([0]);
		// 	});
		//
		// 	it('with `toggleActive` with `Set`', async () => {
		// 		const
		// 			target = await init({multiple: true});
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.toggleActive(new Set([0, 1]));
		// 				return [...ctx.active];
		// 			})
		// 		).toEqual([0, 1]);
		//
		// 		const
		// 			el1 = await page.waitForSelector('[data-id="0"]', { state: 'attached' }),
		// 			el2 = await page.waitForSelector('[data-id="1"]', { state: 'attached' });
		//
		// 		expect([
		// 			(await el1.getAttribute('class')).includes('active_true'),
		// 			(await el2.getAttribute('class')).includes('active_true')
		// 		]).toEqual([true, true]);
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.toggleActive(new Set([1, 3]));
		// 				return [...ctx.active];
		// 			})
		// 		).toEqual([0, 3]);
		//
		// 		const
		// 			el3 = await page.waitForSelector('[data-id="0"]', { state: 'attached' }),
		// 			el4 = await page.waitForSelector('[data-id="1"]', { state: 'attached' }),
		// 			el5 = await page.waitForSelector('[data-id="3"]', { state: 'attached' });
		//
		// 		expect([
		// 			(await el3.getAttribute('class')).includes('active_true'),
		// 			(await el4.getAttribute('class')).includes('active_false'),
		// 			(await el5.getAttribute('class')).includes('active_true')
		// 		]).toEqual([true, true, true]);
		// 	});
		//
		// 	it('with `toggleActive` with `Set` with unsetPrevious', async () => {
		// 		const
		// 			target = await init({multiple: true});
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.toggleActive(new Set([0, 1]));
		// 				return [...ctx.active];
		// 			})
		// 		).toEqual([0, 1]);
		//
		// 		expect(
		// 			await target.evaluate((ctx) => {
		// 				ctx.toggleActive(new Set([2, 4]), true);
		// 				return [...ctx.active];
		// 			})
		// 		).toEqual([0, 1, 2, 4]);
		// 	});
		// });
		//
		// it('listening of change events', async () => {
		// 	const
		// 		target = await init();
		//
		// 	expect(
		// 		await target.evaluate((ctx) => {
		// 			const
		// 				log = [];
		//
		// 			ctx.on('immediateChange', (component, value) => {
		// 				log.push(['immediateChange', value]);
		// 			});
		//
		// 			ctx.on('onChange', (value) => {
		// 				log.push(['change', value]);
		// 			});
		//
		// 			ctx.on('onActionChange', (value) => {
		// 				log.push(['actionChange', value]);
		// 			});
		//
		// 			log.push(ctx.setActive(0));
		//
		// 			const event = new Event('click', {bubbles: true});
		// 			ctx.block.elements('item-wrapper')[1].dispatchEvent(event);
		//
		// 			return log;
		// 		})
		// 	).toEqual([
		// 		['immediateChange', 0],
		// 		['change', 0],
		//
		// 		true,
		//
		// 		['immediateChange', 1],
		// 		['change', 1],
		// 		['actionChange', 1]
		// 	]);
		// });
		//
		// it('watching for `active`', async () => {
		// 	const
		// 		target = await init();
		//
		// 	expect(
		// 		await target.evaluate(async (ctx) => {
		// 			const
		// 				log = [];
		//
		// 			ctx.watch('active', {immediate: true}, (val, oldVal, p) => {
		// 				log.push([val, oldVal, p?.path.join('.')]);
		// 			});
		//
		// 			ctx.setActive(0);
		//
		// 			await ctx.nextTick();
		//
		// 			ctx.setActive(1);
		//
		// 			await ctx.nextTick();
		//
		// 			return log;
		// 		})
		// 	).toEqual([
		// 		[undefined, undefined, undefined],
		// 		[0, undefined, 'active'],
		// 		[1, 0, 'active']
		// 	]);
		// });
		//
		// it('watching for `active` with `multiple = true`', async () => {
		// 	const
		// 		target = await init({multiple: true});
		//
		// 	expect(
		// 		await target.evaluate(async (ctx) => {
		// 			const
		// 				log = [];
		//
		// 			ctx.watch('active', {immediate: true}, (val, oldVal, p) => {
		// 				log.push([[...val], oldVal && [...oldVal], p?.path.join('.')]);
		// 			});
		//
		// 			ctx.setActive(0);
		//
		// 			await ctx.nextTick();
		//
		// 			ctx.setActive(1);
		//
		// 			await ctx.nextTick();
		//
		// 			return log;
		// 		})
		// 	).toEqual([
		// 		[[], undefined, undefined],
		// 		[[0], [], 'active'],
		// 		[[0, 1], [0], 'active']
		// 	]);
		// });
		//
		// it('checking of `activeElement`', async () => {
		// 	const target = await init({active: 0});
		// 	expect(await target.evaluate((ctx) => ctx.activeElement.tagName)).toBe('DIV');
		// });

		// it('checking of `activeElement` with `multiple = true`', async () => {
		// 	const
		// 		target = await init({active: [0, 1], multiple: true});
		//
		// 	expect(await target.evaluate((ctx) => Array.from(ctx.activeElement).map((el) => el.tagName)))
		// 		.toEqual(['DIV', 'DIV']);
		// });

		async function init(attrs) {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							items: [
								{value: 0, label: 0},
								{value: 1, label: 1},
								{
									value: 2,
									label: 2,
									children: [
										{
											value: 4,
											label: 4,
											children: [{value: 5, label: 5}]
										}
									]
								},
								{value: 3, label: 3}
							],

							id: 'target',
							theme: 'demo',

							...attrs,
							// eslint-disable-next-line no-eval
							active: /new /.test(attrs?.active) ? eval(attrs?.active) : attrs?.active
						}
					}
				];

				globalThis.renderComponents('b-tree', scheme);
			}, attrs);

			await h.component.waitForComponentStatus(page, '#target', 'ready');
			return h.component.waitForComponent(page, '#target');
		}
	});
};
