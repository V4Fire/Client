describe('active elements.', () => {
	it('initialization with the predefined active element', async () => {
		const target = await init({active: 0});
		expect(await target.evaluate((ctx) => ctx.active)).toBe(0);

		expect(
			await target.evaluate(async (ctx) => ctx.block.getElMod(await ctx.activeElement, 'node', 'active'))
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
				ctx.setActive(5);
				return [...ctx.active.keys()];
			})
		).toEqual([1, 5]);

		expect(
			await target.evaluate((ctx) => {
				ctx.unsetActive(1);
				ctx.unsetActive(5);
				return [...ctx.active.values()];
			})
		).toEqual([1, 5]);
	});

	it('switching of an active element with `multiple = true; cancelable = true`', async () => {
		const
			target = await init({multiple: true, cancelable: true});

		expect(
			await target.evaluate((ctx) => {
				ctx.setActive(1);
				ctx.setActive(0);
				return [...ctx.active];
			})
		).toEqual([1, 0]);

		expect(
			await target.evaluate((ctx) => {
				ctx.unsetActive(1);
				ctx.unsetActive(0);
				return [...ctx.active];
			})
		).toEqual([]);
	});

	it('switching of an active element and unfold parents folds', async () => {
		const
			target = await init();

		expect(
			await target.evaluate((ctx) => {
				ctx.setActive(4);
				return [
					ctx.getFoldedMod(2),
					ctx.getFoldedMod(3)
				];
			})
		).toEqual(['false', 'false']);
	});

	it('switching of an active element (toggleActive) and unfold parents folds', async () => {
		const
			target = await init();

		expect(
			await target.evaluate((ctx) => {
				ctx.toggleActive(4);
				return [
					ctx.getFoldedMod(2),
					ctx.getFoldedMod(3)
				];
			})
		).toEqual(['false', 'false']);
	});

	it('switching of an active element with `toggleActive` with primitive value', async () => {
		const
			target = await init({multiple: true});

		expect(
			await target.evaluate((ctx) => {
				ctx.toggleActive(1);
				ctx.toggleActive(0);
				ctx.toggleActive(1);
				return [...ctx.active];
			})
		).toEqual([0]);
	});

	it('switching of an active element with `toggleActive` with set value', async () => {
		const
			target = await init({multiple: true});

		expect(
			await target.evaluate((ctx) => {
				ctx.toggleActive(new Set([0, 1]));
				return [...ctx.active];
			})
		).toEqual([0, 1]);

		expect(
			await target.evaluate((ctx) => [
				ctx.block.getElMod(ctx.block.element('node', {id: 0}), 'node', 'active'),
				ctx.block.getElMod(ctx.block.element('node', {id: 1}), 'node', 'active')
			])
		).toEqual(['true', 'true']);

		expect(
			await target.evaluate((ctx) => {
				ctx.toggleActive(new Set([1, 3]));
				return [...ctx.active];
			})
		).toEqual([0, 3]);

		expect(
			await target.evaluate((ctx) => [
				ctx.block.getElMod(ctx.block.element('node', {id: 0}), 'node', 'active'),
				ctx.block.getElMod(ctx.block.element('node', {id: 1}), 'node', 'active'),
				ctx.block.getElMod(ctx.$refs.children[0].block.element('node', {id: ctx.values.get(3)}), 'node', 'active')
			])
		).toEqual(['true', 'false', 'true']);
	});

	it('switching of an active element with `toggleActive` with set value with unsetPrevious', async () => {
		const
			target = await init({multiple: true});

		expect(
			await target.evaluate((ctx) => {
				ctx.toggleActive(new Set([0, 1]));
				return [...ctx.active];
			})
		).toEqual([0, 1]);

		expect(
			await target.evaluate((ctx) => {
				ctx.toggleActive(new Set([2, 4]), true);
				return [...ctx.active];
			})
		).toEqual([2, 4]);
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
