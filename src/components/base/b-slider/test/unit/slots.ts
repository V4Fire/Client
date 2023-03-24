/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import Utils from 'tests/helpers/utils';

import type * as Block from 'components/friends/block';

import type bSlider from 'components/base/b-slider/b-slider';

test.describe('<b-slider> slots rendering', () => {
	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const api = await Utils.import<typeof Block>(page, 'components/friends/block');

		await api.evaluate(({default: block, element}) => {
			block.addToPrototype({element});
		});
	});

	test('`default`: the slot for slides', async ({page}) => {
		const
			slotId = 'slot';

		const slider = await render(page, {
			children: {
				default: {
					type: 'div',
					attrs: {id: slotId}
				}
			}
		});

		const
			id = await slider.evaluate((ctx) => ctx.content?.firstElementChild?.id);

		test.expect(id).toBe(slotId);
	});

	test('`beforeItems`: the slot for content before the first slide', async ({page}) => {
		const
			slotId = 'slot',
			slideId = 'slide';

		const slider = await render(page, {
			attrs: {
				items: [1],
				item: 'section',
				itemProps: {id: slideId}
			},

			children: {
				beforeItems: {
					type: 'div',
					attrs: {id: slotId}
				}
			}
		});

		const ids = await slider.evaluate((ctx) => {
			const
				slot = ctx.content?.firstElementChild,
				slide = slot?.nextElementSibling;

			return {slotId: slot?.id, slideId: slide?.id};
		});

		test.expect(ids.slotId).toBe(slotId);
		test.expect(ids.slideId).toBe(slideId);
	});

	test('`afterItems`: the slot for content after the last slide', async ({page}) => {
		const
			slotId = 'slot',
			slideId = 'slide';

		const slider = await render(page, {
			attrs: {
				items: [1],
				item: 'section',
				itemProps: {id: slideId}
			},

			children: {
				afterItems: {
					type: 'div',
					attrs: {id: slotId}
				}
			}
		});

		const ids = await slider.evaluate((ctx) => {
			const
				slot = ctx.content?.lastElementChild,
				slide = slot?.previousElementSibling;

			return {slotId: slot?.id, slideId: slide?.id};
		});

		test.expect(ids.slotId).toBe(slotId);
		test.expect(ids.slideId).toBe(slideId);
	});

	test('`before`: the slot for content before the slider window (area with slides)', async ({page}) => {
		const
			slotId = 'slot';

		const slider = await render(page, {
			children: {
				before: {
					type: 'div',
					attrs: {id: slotId}
				}
			}
		});

		const id = await slider.evaluate((ctx) => {
			const
				{block: $b} = ctx.unsafe;

			return $b?.element('window')?.previousElementSibling?.id;
		});

		test.expect(id).toEqual(slotId);
	});

	test('`after`: the slot for content after the slider window (area with slides)', async ({page}) => {
		const
			slotId = 'slot';

		const slider = await render(page, {
			children: {
				after: {
					type: 'div',
					attrs: {id: slotId}
				}
			}
		});

		const id = await slider.evaluate((ctx) => {
			const
				{block: $b} = ctx.unsafe;

			return $b?.element('window')?.nextElementSibling?.id;
		});

		test.expect(id).toEqual(slotId);
	});

	/**
	 * @param page
	 * @param params
	 */
	function render(page: Page, params: RenderComponentsVnodeParams = {}): Promise<JSHandle<bSlider>> {
		return Component.createComponent<bSlider>(page, 'b-slider', params);
	}
});
