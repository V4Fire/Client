/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ImageLoader, imageLoaderFactory } from 'core/dom/image';

import type * as htmlHelpers from 'core/html';
import type * as browserHelpers from 'core/browser';
import type * as session from 'core/session';

import type iObserveDOM from 'traits/i-observe-dom/i-observe-dom';

import type InMemoryRouterEngine from 'core/router/engines/in-memory';
import type HistoryApiRouterEngine from 'core/router/engines/browser-history';

export interface Directives {
	imageFactory: typeof imageLoaderFactory;
	image: typeof ImageLoader;
}

export interface Modules {
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
