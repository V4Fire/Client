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

@component()
export default abstract class bBottomSlideProps extends iBlock {
	/**
	 * Component height mode:
	 *
	 * 1. `content` – the height value is based on a component content, but no more than the viewport height
	 * 2. `full` – the height value is equal to the viewport height
	 */
	@prop({type: String, validator: Object.hasOwnProperty(heightMode)})
	readonly heightMode: HeightMode = 'full';

	/**
	 * List of allowed component positions relative to the screen height (in percentages)
	 */
	@prop({type: Array, validator: (v: number[]) => v.every((a) => a >= 0 && a <= 100)})
	readonly stepsProp: number[] = [];

	/**
	 * The minimum height value of a visible part (in pixels), i.e.,
	 * even the component is closed, this part still be visible
	 */
	@prop({type: Number, validator: Number.isNonNegative})
	readonly visible: number = 0;

	/**
	 * The maximum height value to which you can pull the component
	 */
	@prop({type: Number, validator: (v: number) => v >= 0 && v <= 100})
	readonly maxVisiblePercent: number = 90;

	/**
	 * The maximum time in milliseconds after which we can assume that there was a quick swipe
	 */
	@prop({type: Number, validator: Number.isPositive})
	readonly fastSwipeDelay: number = (0.3).seconds();

	/**
	 * The minimum required amount of pixels of scrolling after which we can assume that there was a quick swipe
	 */
	@prop({type: Number, validator: Number.isNatural})
	readonly fastSwipeThreshold: number = 10;

	/**
	 * The minimum required amount of pixels of scrolling to swipe
	 */
	@prop({type: Number, validator: Number.isNatural})
	readonly swipeThreshold: number = 40;

	/**
	 * If true, the component will overlay background while it's opened
	 */
	@prop(Boolean)
	readonly overlay: boolean = true;

	/**
	 * The maximum value of overlay opacity
	 */
	@prop({type: Number, validator: Number.isBetweenZeroAndOne})
	readonly maxOpacity: number = 0.8;

	/**
	 * If true, then the content scroll will be automatically reset to the top after closing the component
	 */
	@prop(Boolean)
	readonly scrollToTopOnClose: boolean = true;

	/**
	 * If false, the inner content of the component won't be rendered if the component isn't opened
	 */
	@prop(Boolean)
	readonly forceInnerRender: boolean = true;

	/** {@link iVisible.hideIfOffline} */
	@prop(Boolean)
	readonly hideIfOffline: boolean = false;
}
