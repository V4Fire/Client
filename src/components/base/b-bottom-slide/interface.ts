/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bBottomSlide from 'components/base/b-bottom-slide/b-bottom-slide';
import type { UnsafeIBlock } from 'components/base/b-bottom-slide/b-bottom-slide';

export type HeightMode = 'content' | 'full';
export type Direction = -1 | 0 | 1;

export interface UnsafeBBottomSlide<CTX extends bBottomSlide = bBottomSlide> extends UnsafeIBlock<CTX> {
	// @ts-ignore (access)
	browser: CTX['browser'];

	// @ts-ignore (access)
	animation: CTX['animation'];

	// @ts-ignore (access)
	geometry: CTX['geometry'];

	// @ts-ignore (access)
	swipeControl: CTX['swipeControl'];

	// @ts-ignore (access)
	overlayAPI: CTX['overlayAPI'];

	// @ts-ignore (access)
	step: CTX['step'];

	// @ts-ignore (access)
	isPulling: CTX['isPulling'];

	// @ts-ignore (access)
	isViewportTopReached: CTX['isViewportTopReached'];

	// @ts-ignore (access)
	stickToStep: CTX['stickToStep'];

	// @ts-ignore (access)
	updateWindowPosition: CTX['updateWindowPosition'];
}
