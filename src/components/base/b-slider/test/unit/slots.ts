/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';
import Utils from 'tests/helpers/utils';

import type * as Block from 'components/friends/block';
import { renderSlider } from 'components/base/b-slider/test/helpers';

test.describe('<b-slider> slots rendering', () => {
	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const api = await Utils.import<typeof Block>(page, 'components/friends/block');

		await api.evaluate(({default: block, element}) => {
			block.addToPrototype({element});
		});
	});

	test('should display the `default` slot as slides', async ({page}) => {
		const
			slotId = 'slot';

		const slider = await renderSlider(page, {
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

	test('should render the `beforeItems` slot before the first slide', async ({page}) => {
		const
			slotId = 'slot',
			slideId = 'slide';

		const slider = await renderSlider(page, {
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

	test('should render the `afterItems` slot after the last slide', async ({page}) => {
		const
			slotId = 'slot',
			slideId = 'slide';

		const slider = await renderSlider(page, {
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

	test('should render the `before` slot before the slider window (area with slides)', async ({page}) => {
		const
			slotId = 'slot';

		const slider = await renderSlider(page, {
			children: {
				before: {
					type: 'div',
					attrs: {id: slotId}
				}
			}
		});

		const id = await slider.evaluate((ctx) => {
			const {block: $b} = ctx.unsafe;
			return $b?.element('window')?.previousElementSibling?.id;
		});

		test.expect(id).toEqual(slotId);
	});

	test('should render the `after` slot after the slider window (area with slides)', async ({page}) => {
		const
			slotId = 'slot';

		const slider = await renderSlider(page, {
			children: {
				after: {
					type: 'div',
					attrs: {id: slotId}
				}
			}
		});

		const id = await slider.evaluate((ctx) => {
			const {block: $b} = ctx.unsafe;
			return $b?.element('window')?.nextElementSibling?.id;
		});

		test.expect(id).toEqual(slotId);
	});
});
