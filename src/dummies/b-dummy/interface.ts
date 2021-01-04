/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ImageLoader, imageLoaderFactory } from 'core/dom/image';
import { InViewAdapter } from 'core/dom/in-view';
import { ResizeWatcher } from 'core/dom/resize-observer';

export interface Directives {
	imageFactory: typeof imageLoaderFactory;
	image: typeof ImageLoader;
	inViewMutation: InViewAdapter;
	inViewObserver: InViewAdapter;
}

export interface Modules {
	resizeWatcher: typeof ResizeWatcher;
}
