/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iVisible from 'components/traits/i-visible/i-visible';

import iBlock, { component, prop } from 'components/super/i-block/i-block';

import { heightMode } from 'components/base/b-bottom-slide/const';
import type { HeightMode } from 'components/base/b-bottom-slide/interface';

@component({partial: 'bBottomSlide'})
export default abstract class iBottomSlideProps extends iBlock {
	/**
	 * Component height mode:
	 *
	 * 1. `content` - the height value is based on the component content, but no larger than the viewport height;
	 * 2. `full` - the height value is equal to the height of the viewport.
	 */
	@prop({type: String, validator: Object.hasOwnProperty(heightMode)})
	readonly heightMode: HeightMode = 'full';

	/**
	 * A list of allowed component positions relative to screen height (percentage)
	 */
	@prop({type: Array, validator: (v: number[]) => v.every((a) => a >= 0 && a <= 100)})
	readonly stepsProp: number[] = [];

	/**
	 * The minimum value of the height of the visible part (in pixels), i.e., even if the component is closed,
	 * this part will still be visible
	 */
	@prop({type: Number, validator: Number.isNonNegative})
	readonly visible: number = 0;

	/**
	 * The maximum height the component can be pulled to
	 */
	@prop({type: Number, validator: (v: number) => v >= 0 && v <= 100})
	readonly maxVisiblePercent: number = 90;

	/**
	 * The maximum time in milliseconds after which it can be considered that there was a fast swipe
	 */
	@prop({type: Number, validator: Number.isPositive})
	readonly fastSwipeDelay: number = (0.3).seconds();

	/**
	 * The minimum required number of scroll pixels, after which it can be considered that there was a fast swipe
	 */
	@prop({type: Number, validator: Number.isNatural})
	readonly fastSwipeThreshold: number = 10;

	/**
	 * The minimum number of scroll pixels required for a swipe
	 */
	@prop({type: Number, validator: Number.isNatural})
	readonly swipeThreshold: number = 40;

	/**
	 * If true, the component will overlay the background while it is open
	 */
	@prop(Boolean)
	readonly overlay: boolean = true;

	/**
	 * Maximum overlay opacity
	 */
	@prop({type: Number, validator: Number.isBetweenZeroAndOne})
	readonly maxOpacity: number = 0.8;

	/**
	 * If true, content scrolling automatically resets to the top after the component closes
	 */
	@prop(Boolean)
	readonly scrollToTopOnClose: boolean = true;

	/**
	 * If set to false, the inner content of the component won't be rendered until the component is opened.
	 */
	@prop(Boolean)
	readonly forceInnerRender: boolean = true;

	/** {@link iVisible.hideIfOffline} */
	@prop(Boolean)
	readonly hideIfOffline: boolean = false;
}
