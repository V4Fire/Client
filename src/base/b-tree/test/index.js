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
	h = include('tests/helpers').default,
	testActive = include('src/traits/i-active-items/test/main-cases');

/**
 * Starts a test
 *
 * @param {Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	const defaultItems = [
		{value: 'bar'},

		{
			value: 'foo',
			children: [
				{value: 'foo_1'},
				{value: 'foo_2'},

				{
					value: 'foo_3',
					children: [{value: 'foo_3_1'}]
				},

				{value: 'foo_4'},
				{value: 'foo_5'},
				{value: 'foo_6'}
			]
		}
	];

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	// Describe('b-tree rendering data from the `items` prop', () => {
	// 	it('initialization', async () => {
	// 		const
	// 			target = await init();
	//
	// 		await expectAsync(target.evaluate((ctx) => ctx.isFunctional === false))
	// 			.toBeResolvedTo(true);
	//
	// 		const
	// 			promises = await Promise.all(checkOptionTree({items: defaultItems, target})),
	// 			checkboxes = await page.$$('.b-checkbox');
	//
	// 		expect(promises.length).toEqual(checkboxes.length);
	// 	});
	//
	// 	it('all items unfolded by default', async () => {
	// 		const items = [
	// 			{value: 'bar'},
	//
	// 			{
	// 				value: 'foo',
	// 				children: [
	// 					{value: 'foo_1'},
	// 					{value: 'foo_2'},
	//
	// 					{
	// 						value: 'foo_3',
	// 						folded: false,
	// 						children: [{value: 'foo_3_1', children: [{value: 'foo_3_1_1'}]}]
	// 					}
	// 				]
	// 			}
	// 		];
	//
	// 		const target = await init({items});
	// 		await Promise.all(checkOptionTree({items, target}));
	// 	});
	//
	// 	describe('setting of the external `renderFilter`', () => {
	// 		it('renders by one with a timeout', async () => {
	// 			const bTree = await init({attrs: {
	// 				renderChunks: 1,
	// 				renderFilter: 'return () => new Promise((res) => setTimeout(() => res(true), 0.5.second()))'
	// 			}});
	//
	// 			await h.bom.waitForIdleCallback(page);
	//
	// 			const
	// 				waitForRender = () => bTree.evaluate((ctx) => ctx.async.sleep(500)),
	// 				getCheckboxes = () => page.$$('.b-checkbox');
	//
	// 			await waitForRender();
	// 			await expect((await getCheckboxes()).length).toBe(1);
	//
	// 			await waitForRender();
	// 			await expect((await getCheckboxes()).length).toBe(2);
	//
	// 			await waitForRender();
	// 			await expect((await getCheckboxes()).length).toBe(3);
	// 		});
	//
	// 		it('renders using the context data', async () => {
	// 			await init({
	// 				attrs: {renderFilter: `return (ctx, item) => {
	// 						if (ctx.level === 0 ) {
	// 							return true;
	// 						}
	//
	// 						return false;
	// 				}`}
	// 			});
	//
	// 			await h.bom.waitForIdleCallback(page);
	//
	// 			await expect((await page.$$('.b-checkbox')).length).toBe(2);
	// 		});
	// 	});
	//
	// 	it('setting of the external `nestedRenderFilter`', async () => {
	// 		const items = [
	// 			{
	// 				value: 'foo',
	// 				children: [
	// 					{value: 'foo_1'},
	// 					{value: 'foo_2'},
	//
	// 					{
	// 						value: 'foo_3',
	// 						children: [{value: 'foo_3_1', children: [{value: 'foo_3_1_1'}]}]
	// 					}
	// 				]
	// 			},
	//
	// 			{value: 'bar'}
	// 		];
	//
	// 		await init({
	// 			items,
	// 			attrs: {
	// 				renderChunks: 1,
	// 				nestedRenderFilter: 'return () => new Promise((res) => setTimeout(() => res(true), 0.5.second()))'
	// 			}
	// 		});
	//
	// 		await waitForCheckboxCount(2);
	// 		await waitForCheckboxCount(3);
	// 		await waitForCheckboxCount(4);
	// 		await waitForCheckboxCount(5);
	// 		await waitForCheckboxCount(6);
	// 		await waitForCheckboxCount(7);
	// 	});
	//
	// 	async function init({items, attrs, content} = {}) {
	// 		if (items == null) {
	// 			items = defaultItems;
	// 		}
	//
	// 		await page.evaluate(({items, attrs, content}) => {
	// 			globalThis.removeCreatedComponents();
	//
	// 			parseParams(content);
	// 			parseParams(attrs);
	//
	// 			const baseAttrs = {
	// 				theme: 'demo',
	// 				item: 'b-checkbox-functional',
	// 				items,
	// 				id: 'target',
	// 				renderChunks: 2
	// 			};
	//
	// 			const scheme = [
	// 				{
	// 					attrs: {
	// 						...baseAttrs,
	// 						...attrs
	// 					},
	//
	// 					content
	// 				}
	// 			];
	//
	// 			globalThis.renderComponents('b-tree', scheme);
	//
	// 			function parseParams(obj) {
	// 				Object.forEach(obj, (el, key) => {
	// 					// eslint-disable-next-line no-new-func
	// 					obj[key] = /return /.test(el) ? Function(el)() : el;
	// 				});
	// 			}
	// 		}, {items, attrs, content});
	//
	// 		return h.component.waitForComponent(page, '#target');
	// 	}
	// });
	//
	// describe('b-tree rendering data from a data provider', () => {
	// 	it('initialization', async () => {
	// 		await init();
	// 		await waitForCheckboxCount(14);
	// 		await h.bom.waitForIdleCallback(page);
	//
	// 		expect((await page.$$('.b-checkbox')).length).toBe(14);
	// 	});
	//
	// 	async function init() {
	// 		await page.evaluate(() => {
	// 			globalThis.removeCreatedComponents();
	//
	// 			const scheme = [
	// 				{
	// 					attrs: {
	// 						theme: 'demo',
	// 						dataProvider: 'demo.NestedList',
	// 						item: 'b-checkbox-functional',
	// 						id: 'target'
	// 					}
	// 				}
	// 			];
	//
	// 			globalThis.renderComponents('b-tree', scheme);
	// 		});
	//
	// 		await h.component.waitForComponentStatus(page, '.b-tree', 'ready');
	// 		return h.component.waitForComponent(page, '#target');
	// 	}
	// });
	//
	// describe('b-tree providing of the `default` slot', () => {
	// 	it('initialization', async () => {
	// 		const
	// 			target = await init();
	//
	// 		await expectAsync(target.evaluate((ctx) => ctx.isFunctional === false))
	// 			.toBeResolvedTo(true);
	//
	// 		const
	// 			promises = await Promise.all(checkOptionTree({items: defaultItems, target})),
	// 			refs = await h.dom.getRefs(page, 'item');
	//
	// 		expect(promises.length).toEqual(refs.length);
	// 	});
	//
	// 	async function init() {
	// 		await page.evaluate((items) => {
	// 			const defaultSlot = {
	// 				tag: 'div',
	// 				content: 'Item',
	// 				attrs: {
	// 					'data-test-ref': 'item'
	// 				}
	// 			};
	//
	// 			const scheme = [
	// 				{
	// 					attrs: {
	// 						items,
	// 						id: 'target',
	// 						theme: 'demo'
	// 					},
	//
	// 					content: {
	// 						default: defaultSlot
	// 					}
	// 				}
	// 			];
	//
	// 			globalThis.renderComponents('b-tree', scheme);
	// 		}, defaultItems);
	//
	// 		return h.component.waitForComponent(page, '#target');
	// 	}
	// });
	//
	// describe('b-tree public API.', () => {
	// 	const items = [
	// 		{value: 1},
	// 		{value: 2},
	// 		{
	// 			value: 3,
	// 			children: [
	// 				{
	// 					value: 4,
	// 					children: [{value: 6}]
	// 				}
	// 			]
	// 		},
	// 		{value: 5}
	// 	];
	//
	// 	it('traverse', async () => {
	// 		const
	// 			target = await init();
	//
	// 		let res = await target.evaluate((ctx) => [...ctx.traverse()].map(([item]) => item.id));
	//
	// 		expect(res).toEqual([1, 2, 3, 5, 4, 6]);
	//
	// 		res = await target.evaluate((ctx) => [...ctx.traverse(ctx, {deep: false})].map(([item]) => item.id));
	//
	// 		expect(res).toEqual([1, 2, 3, 5]);
	// 	});
	//
	// 	it('fold/unfold', async () => {
	// 		const
	// 			target = await init();
	//
	// 		await target.evaluate(async (ctx) => {
	// 			await ctx.unfold();
	// 		});
	//
	// 		let nodes = [
	// 			await h.dom.waitForEl(page, `[data-id$="-${3}"]`),
	// 			await h.dom.waitForEl(page, `[data-id$="-${4}"]`)
	// 		];
	//
	// 		await expect(
	// 			nodes.every(async (node) => (await node.getAttribute('class')).includes('folded_false'))
	// 		).toBe(true);
	//
	// 		await target.evaluate(async (ctx) => {
	// 			await ctx.fold();
	// 		});
	//
	// 		nodes = [
	// 			await h.dom.waitForEl(page, `[data-id$="-${3}"]`),
	// 			await h.dom.waitForEl(page, `[data-id$="-${4}"]`)
	// 		];
	//
	// 		expect(
	// 			nodes.every(async (node) => (await node.getAttribute('class')).includes('folded_true'))
	// 		).toBeTrue();
	//
	// 		await target.evaluate((ctx) => {
	// 			ctx.unfold(ctx.items[2]);
	// 		});
	//
	// 		nodes = [
	// 			await h.dom.waitForEl(page, `[data-id$="-${3}"]`),
	// 			await h.dom.waitForEl(page, `[data-id$="-${4}"]`)
	// 		];
	//
	// 		const res = nodes.reduce(async (acc, cur) => {
	// 			if ((await cur.getAttribute('class')).includes('folded_false')) {
	// 				return ++acc;
	// 			}
	//
	// 			return acc;
	// 		}, 0);
	//
	// 		await expectAsync(res).toBeResolvedTo(1);
	// 	});
	//
	// 	async function init() {
	// 		await page.evaluate((items) => {
	// 			const scheme = [
	// 				{
	// 					attrs: {
	// 						items,
	// 						id: 'target',
	// 						theme: 'demo'
	// 					}
	// 				}
	// 			];
	//
	// 			globalThis.renderComponents('b-tree', scheme);
	// 		}, items);
	//
	// 		return h.component.waitForComponent(page, '#target');
	// 	}
	// });

	describe('active elements.', () => {
		it('initialization with the predefined active element', async () => {
			const target = await init({active: 0});
			expect(await target.evaluate((ctx) => ctx.active)).toBe(0);

			expect(
				await target.evaluate(async (ctx) => ctx.block.getElMod(await ctx.activeElement, ctx.nodeName, 'active'))
			).toBe('true');
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
						log.push(val);
					});

					ctx.items = [{label: 'Bar', value: 1}];

					log.push(ctx.items);

					await ctx.nextTick();
					return log;
				})

			).toEqual([
				[{label: 'Bar', value: 1, mods: {id: 1, active: false}}],
				[{label: 'Bar', value: 1, mods: {id: 1, active: false}}]
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
					ctx.block.elements('item-wrapper')[1].dispatchEvent(event);

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

		it('checking of `activeElement`', async () => {
			const target = await init({active: 0});
			expect(await target.evaluate((ctx) => ctx.activeElement.tagName)).toBe('DIV');
		});

		it('checking of `activeElement` with `multiple = true`', async () => {
			const
				target = await init({active: [0, 1], multiple: true});

			expect(await target.evaluate((ctx) => Array.from(ctx.activeElement).map((el) => el.tagName)))
				.toEqual(['DIV', 'DIV']);
		});

		async function init(attrs) {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							items: [
								{value: 0},
								{value: 1},
								{
									value: 2,
									children: [
										{
											value: 3,
											children: [{value: 4}]
										}
									]
								},
								{value: 5}
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

			return h.component.waitForComponent(page, '#target');
		}
	});

	async function waitForCheckboxCount(v) {
		await page.waitForFunction((v) => document.querySelectorAll('.b-checkbox').length === v, v);
		await expect((await page.$$('.b-checkbox')).length).toBe(v);
	}

	function getFoldedClass(target, value = true) {
		return target.evaluate(
			(ctx, v) => ctx.block.getFullElName('node', 'folded', v),
			value
		);
	}

	function checkOptionTree({items, target, queue = [], level = 0, foldSelector}) {
		items.forEach((item) => {
			const
				isBranch = Object.isArray(item.children);

			queue.push((async () => {
				const
					element = await h.dom.waitForEl(page, `[data-id$="-${item.id}"]`);

				const
					foldedPropValue = await target.evaluate((ctx) => ctx.folded),
					foldedInitModValue = item.folded != null ? item.folded : foldedPropValue,
					foldedClass = await getFoldedClass(target, foldedInitModValue);

				await expectAsync(element.getAttribute('data-level')).toBeResolvedTo(String(level));

				if (isBranch) {
					const
						selector = foldSelector || await target.evaluate((ctx) => `.${ctx.block.getFullElName('fold')}`),
						fold = await h.dom.waitForEl(element, selector);

					await expectAsync(
						element.getAttribute('class').then((className) => className.includes(foldedClass))
					).toBeResolvedTo(true);

					if (foldedInitModValue) {
						await fold.click();
					}
				}
			})());

			if (isBranch) {
				checkOptionTree({
					items: item.children,
					level: level + 1,
					target,
					queue,
					foldSelector
				});
			}
		});

		return queue;
	}
};
