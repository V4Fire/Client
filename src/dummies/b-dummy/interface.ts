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
import type * as htmlHelpers from 'core/html';
import type * as browserHelpers from 'core/browser';
import type * as session from 'core/session';

import type updateOn from 'core/component/directives/update-on/engines';
import type iObserveDOM from 'traits/i-observe-dom/i-observe-dom';

import type InMemoryRouterEngine from 'core/router/engines/in-memory';
import type HistoryApiRouterEngine from 'core/router/engines/browser-history';

export interface Directives {
	imageFactory: typeof imageLoaderFactory;
	image: typeof ImageLoader;
	inViewMutation: InViewAdapter;
	inViewObserver: InViewAdapter;
	updateOn: typeof updateOn;
}

export interface Modules {
	resizeWatcher: typeof ResizeWatcher;
	iObserveDOM: typeof iObserveDOM;
	htmlHelpers: typeof htmlHelpers;
	browserHelpers: typeof browserHelpers;
	session: typeof session;
}

export interface Engines {
	router: {
		inMemoryRouterEngine: typeof InMemoryRouterEngine;
		historyApiRouterEngine: typeof HistoryApiRouterEngine;
	};
}
