/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ImageLoader, imageLoaderFactory } from 'core/dom/image';
import type { InViewAdapter } from 'core/dom/in-view';
import type { ResizeWatcher } from 'core/dom/resize-observer';

export interface Directives {
	imageFactory: typeof imageLoaderFactory;
	image: typeof ImageLoader;
	inViewMutation: InViewAdapter;
	inViewObserver: InViewAdapter;
}

export interface Modules {
	resizeWatcher: typeof ResizeWatcher;
}
