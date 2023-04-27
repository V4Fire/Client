
/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';

import { $$ } from 'components/base/b-bottom-slide/const';
import type bBottomSlide from 'components/base/b-bottom-slide/b-bottom-slide';

export default class Geometry extends Friend {
	override readonly C!: bBottomSlide;

	/**
	 * Window height
	 */
	get windowHeight(): number {
		return document.documentElement.clientHeight;
	}

	/** @see [[contentHeightStore]] */
	get contentHeight(): number {
		return this.contentHeightStore;
	}

	/** @see [[contentMaxHeightStore]] */
	get contentMaxHeight(): number {
		return this.contentMaxHeightStore;
	}

	/**
	 * The maximum content height (in pixels)
	 */
	protected contentMaxHeightStore: number = 0;

	/**
	 * Content height (in pixels)
	 */
	protected contentHeightStore: number = 0;

	/**
	 * Initializes geometry of the elements
	 */
	async init(): Promise<void> {
		const {ctx} = this;

		const [header, content, view, window] = await Promise.all([
			ctx.waitRef<HTMLElement>('header', {label: $$.initGeometry}),
			ctx.waitRef<HTMLElement>('content'),
			ctx.waitRef<HTMLElement>('view'),
			ctx.waitRef<HTMLElement>('window')
		]);

		const
			{maxVisiblePercent} = ctx;

		const
			currentPage = ctx.history.current?.content;

		if (ctx.heightMode === 'content' && currentPage?.initBoundingRect) {
			const
				currentContentPageHeight = currentPage.el.scrollHeight;

			if (content.clientHeight !== currentContentPageHeight) {
				content.style.height = currentContentPageHeight.px;
			}
		}

		const
			maxVisiblePx = this.windowHeight * (maxVisiblePercent / 100),
			contentHeight = view.clientHeight + header.clientHeight;

		this.contentHeightStore = contentHeight > maxVisiblePx ? maxVisiblePx : contentHeight;
		this.contentMaxHeightStore = maxVisiblePx;

		if (currentPage) {
			Object.assign((<HTMLElement>currentPage.el).style, {
				maxHeight: (maxVisiblePx === 0 ? 0 : (maxVisiblePx - header.clientHeight)).px
			});
		}

		Object.assign(window.style, {
			// If documentElement height is equal to zero, maxVisiblePx is always be zero too,
			// even after new calling of initGeometry.
			// Also, view.clientHeight above would return zero as well, even though the real size is bigger.
			maxHeight: maxVisiblePx === 0 ? undefined : maxVisiblePx.px
		});
	}
}
