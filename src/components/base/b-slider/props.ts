/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iItems from 'components/traits/i-items/i-items';
import iData, { component, prop } from 'components/super/i-data/i-data';

import { sliderModes, alignTypes } from 'components/base/b-slider/const';
import type { Mode, AlignType } from 'components/base/b-slider/interface';

@component()
export default abstract class bSliderProps extends iData {
	/** @see [[iItems.Item]] */
	readonly Item!: object;

	/** @see [[iItems.Items]] */
	readonly Items!: Array<this['Item']>;

	/** @see [[iItems.items]] */
	@prop(Array)
	readonly itemsProp: iItems['items'] = [];

	/** @see [[iItems.item]] */
	@prop({type: [String, Function], required: false})
	readonly item?: iItems['item'];

	/** @see [[iItems.itemKey]] */
	@prop({type: [String, Function], required: false})
	readonly itemKey?: iItems['itemKey'];

	/** @see [[iItems.itemProps]] */
	@prop({type: [Function, Object], required: false})
	readonly itemProps?: iItems['itemProps'];

	/**
	 * A slider mode:
	 *
	 * 1. With the `slide` mode, it is impossible to skip slides.
	 *    That is, we can't get from the first slide directly to the third or other stuff.
	 *
	 * 2. With the `scroll` mode, to scroll slides is used the browser native scrolling.
	 */
	@prop({type: String, validator: Object.hasOwnProperty(sliderModes)})
	readonly modeProp: Mode = 'slide';

	/**
	 * If true, the height calculation will be based on rendered elements.
	 * The component will create an additional element to contain the rendered elements,
	 * while it will not be visible to the user. This may be useful if you need to hide scroll on mobile devices,
	 * but you don't know the exact size of the elements that can be rendered into a component.
	 */
	@prop(Boolean)
	readonly dynamicHeight: boolean = false;

	/**
	 * If true, a user will be automatically returned to the first slide when scrolling the last slide.
	 * That is, the slider will work "in a circle".
	 */
	@prop(Boolean)
	readonly circular: boolean = false;

	/**
	 * This prop controls how many slides will scroll.
	 * For example, by specifying `center`, the slider will stop when the active slide is
	 * in the slider's center when scrolling.
	 */
	@prop({type: String, validator: Object.hasOwnProperty(alignTypes)})
	readonly align: AlignType = 'center';

	/**
	 * If true, the first slide will be aligned to the start position (the left bound).
	 */
	@prop(Boolean)
	readonly alignFirstToStart: boolean = true;

	/**
	 * How much does the shift along the X-axis corresponds to a finger movement
	 */
	@prop({type: Number, validator: (v) => Number.isPositiveBetweenZeroAndOne(v)})
	readonly deltaX: number = 0.9;

	/**
	 * The minimum required percentage to scroll the slider to another slide
	 */
	@prop({type: Number, validator: (v) => Number.isPositiveBetweenZeroAndOne(v)})
	readonly threshold: number = 0.3;

	/**
	 * The minimum required percentage for the scroll slider to another slide in fast motion on the slider
	 */
	@prop({type: Number, validator: (v) => Number.isPositiveBetweenZeroAndOne(v)})
	readonly fastSwipeThreshold: number = 0.05;

	/**
	 * Time (in milliseconds) after which we can assume that there was a quick swipe
	 */
	@prop({type: Number, validator: (v) => Number.isNatural(v)})
	readonly fastSwipeDelay: number = (0.3).seconds();

	/**
	 * The minimum displacement threshold along the X-axis at which the slider will be considered to be used (in px)
	 */
	@prop({type: Number, validator: (v) => Number.isNatural(v)})
	readonly swipeToleranceX: number = 10;

	/**
	 * The minimum Y-axis offset threshold at which the slider will be considered to be used (in px)
	 */
	@prop({type: Number, validator: (v) => Number.isNatural(v)})
	readonly swipeToleranceY: number = 50;
}
