/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ImageLoader, imageLoaderFactory } from '@src/core/dom/image';
import type { InViewAdapter } from '@src/core/dom/in-view';
import type { ResizeWatcher } from '@src/core/dom/resize-observer';
import type * as cookie from '@src/core/cookies';
import type * as htmlHelpers from '@src/core/html';
import type * as browserHelpers from '@src/core/browser';
import type * as session from '@src/core/session';

import type updateOn from '@src/core/component/directives/update-on/engines';
import type iObserveDOM from '@src/traits/i-observe-dom/i-observe-dom';

import type InMemoryRouterEngine from '@src/core/router/engines/in-memory';
import type HistoryApiRouterEngine from '@src/core/router/engines/browser-history';

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
	cookie: typeof cookie;
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
