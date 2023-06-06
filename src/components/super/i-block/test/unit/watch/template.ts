/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable max-lines-per-function, require-atomic-updates */

import test from 'tests/config/unit/test';

import { renderWatchDummy } from 'components/super/i-block/test/helpers';

test.describe('<i-block> watch - template', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('component should re-render when the root of the deeply nested field is updated', async ({page}) => {
		const target = await renderWatchDummy(page);

		const scan = await target.evaluate(async (ctx) => {
			const
				el = ctx.unsafe.block!.element('complex-obj-store')!,
				res = [el.textContent];

			ctx.complexObjStore = {a: 1};
			await ctx.nextTick();
			res.push(el.textContent);

			return res;
		});

		test.expect(scan).toEqual([
			'{"a":{"b":{"c":1,"d":2}}}',
			'{"a":1}'
		]);
	});

	test('component should re-render when the deeply nested property of the field is updated', async ({page}) => {
		const target = await renderWatchDummy(page);

		const scan = await target.evaluate(async (ctx) => {
			const
				el = ctx.unsafe.block!.element('complex-obj-store')!,
				res = [el.textContent];

			(<any>ctx.complexObjStore).a.b.c++;
			await ctx.nextTick();
			res.push(el.textContent);

			return res;
		});

		test.expect(scan).toEqual([
			'{"a":{"b":{"c":1,"d":2}}}',
			'{"a":{"b":{"c":2,"d":2}}}'
		]);
	});

	test([
		'the cache of the computed field should be invalidated when the store field changes,',
		'and the updated value should be rendered'
	].join(' '), async ({page}) => {
		const target = await renderWatchDummy(page);

		{
			const scan = await target.evaluate(async (ctx) => {
				const
					el = ctx.unsafe.block!.element('complex-obj')!,
					res = [el.textContent];

				(<any>ctx.complexObjStore).a.b.c++;
				await ctx.nextTick();
				res.push(el.textContent);

				return res;
			});

			test.expect(scan).toEqual([
				'{"a":{"b":{"c":1,"d":2}}}',
				'{"a":{"b":{"c":2,"d":2}}}'
			]);
		}

		{
			const scan = await target.evaluate(async (ctx) => {
				const
					el = ctx.unsafe.block!.element('cached-complex-obj')!,
					res = [el.textContent];

				(<any>ctx.complexObjStore).a.b.c++;
				await ctx.nextTick();
				res.push(el.textContent);

				return res;
			});

			test.expect(scan).toEqual([
				'{"a":{"b":{"c":2,"d":2}}}',
				'{"a":{"b":{"c":3,"d":2}}}'
			]);
		}
	});

	test('component should re-render when a value is added to the Set field', async ({page}) => {
		const target = await renderWatchDummy(page);

		const scan = await target.evaluate(async (ctx) => {
			const
				el = ctx.unsafe.block!.element('set-field')!,
				res = [el.textContent];

			ctx.setField.add('bla');
			await ctx.nextTick();
			res.push(el.textContent);

			return res;
		});

		test.expect(scan).toEqual([
			'[]',
			'["bla"]'
		]);
	});

	test([
		'child component should re-render when a value is added',
		'to the Set field of the parent component'
	].join(' '), async ({page}) => {
		const target = await renderWatchDummy(page);

		const scan = await target.evaluate(async (ctx) => {
			const
				el = ctx.unsafe.block!.element('component-with-slot')!,
				res = [el.textContent?.trim()];

			ctx.setField.add('bla');
			await ctx.nextTick();
			res.push(el.textContent?.trim());

			return res;
		});

		test.expect(scan).toEqual([
			'[]',
			'["bla"]'
		]);
	});

	test('component should not re-render when a system field is updated', async ({page}) => {
		const target = await renderWatchDummy(page);

		const scan = await target.evaluate(async (ctx) => {
			const
				el = ctx.unsafe.block!.element('system-complex-obj-store')!,
				res = [el.textContent];

			(<any>ctx.systemComplexObjStore).a.b.c++;
			await ctx.nextTick();
			res.push(el.textContent);

			return res;
		});

		test.expect(scan).toEqual([
			'{"a":{"b":{"c":1,"d":2}}}',
			'{"a":{"b":{"c":1,"d":2}}}'
		]);
	});

	test('component should re-render when the watchable modifier is updated', async ({page}) => {
		const target = await renderWatchDummy(page);

		const scan = await target.evaluate(async (ctx) => {
			const
				el = ctx.unsafe.block!.element('watchable-mod')!,
				res = [[el.textContent, ctx.mods.watchable, ctx.unsafe.block!.getMod('watchable')]];

			await ctx.setMod('watchable', 'val-1');
			await ctx.nextTick();
			res.push([el.textContent, ctx.mods.watchable, ctx.unsafe.block!.getMod('watchable')]);

			await ctx.setMod('watchable', 'val-2');
			await ctx.nextTick();
			res.push([el.textContent, ctx.mods.watchable, ctx.unsafe.block!.getMod('watchable')]);

			await ctx.removeMod('watchable');
			await ctx.nextTick();
			res.push([el.textContent, ctx.mods.watchable, ctx.unsafe.block!.getMod('watchable')]);

			return res;
		});

		test.expect(scan).toEqual([
			['', undefined, undefined],
			['val-1', 'val-1', 'val-1'],
			['val-2', 'val-2', 'val-2'],
			['', undefined, undefined]
		]);
	});

	// FIXME: this test seems to be meaningless - the field doesn't affect the test results
	test('component should re-render when both the watchable modifier and a field are updated', async ({page}) => {
		const target = await renderWatchDummy(page);

		const scan = await target.evaluate(async (ctx) => {
			(<any>ctx.complexObjStore).a.b.c++;

			const
				el = ctx.unsafe.block!.element('watchable-mod')!,
				res = [el.textContent];

			await ctx.setMod('watchable', 'val-1');
			await ctx.nextTick();
			res.push(el.textContent);

			await ctx.setMod('watchable', 'val-2');
			await ctx.nextTick();
			res.push(el.textContent);

			return res;
		});

		test.expect(scan).toEqual([
			'',
			'val-1',
			'val-2'
		]);
	});

	test('component should not re-render when the non watchable modifier is updated', async ({page}) => {
		const target = await renderWatchDummy(page);

		const scan = await target.evaluate(async (ctx) => {
			const
				el = ctx.unsafe.block!.element('non-watchable-mod')!,
				res = [[el.textContent, ctx.mods.nonWatchable, ctx.unsafe.block!.getMod('nonWatchable')]];

			await ctx.setMod('nonWatchable', 'val-2');
			await ctx.nextTick();
			res.push([el.textContent, ctx.mods.nonWatchable, ctx.unsafe.block!.getMod('nonWatchable')]);

			await ctx.removeMod('non-watchable');
			await ctx.nextTick();
			res.push([el.textContent, ctx.mods.nonWatchable, ctx.unsafe.block!.getMod('nonWatchable')]);

			await ctx.forceUpdate();
			await ctx.nextTick();
			res.push([el.textContent, ctx.mods.nonWatchable, ctx.unsafe.block!.getMod('nonWatchable')]);

			return res;
		});

		test.expect(scan).toEqual([
			['val-1', 'val-1', 'val-1'],
			['val-1', 'val-2', 'val-2'],
			['val-1', undefined, undefined],
			['', undefined, undefined]
		]);
	});
});
