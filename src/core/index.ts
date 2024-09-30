/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import '@v4fire/core/core';
import { resolveAfterDOMLoaded } from 'core/event';

import { initApp, initState } from 'core/init';

import * as cookies from 'core/cookies';
import CookieStorage from 'core/kv-storage/engines/cookie';

import PageMetaData, { AbstractElementProperties } from 'core/page-meta-data';
import ThemeManager, { SystemThemeExtractorWeb } from 'core/theme-manager';

import * as session from 'core/session';

export * as cookies from 'core/cookies';
export * as session from 'core/session';

export { PageMetaData };
export * as pageMetaData from 'core/page-meta-data';

export { ThemeManager };
export * as themeManager from 'core/theme-manager';

export * as kvStorage from 'core/kv-storage';
export * as CookieEngine from 'core/kv-storage/engines/cookie';

export { initApp, initState };

//#unless runtime has storybook

if (SSR) {
	process.on('unhandledRejection', stderr);

} else {
	resolveAfterDOMLoaded()
		.then(() => {
			const
				targetToMount = document.querySelector<HTMLElement>('[data-root-component]'),
				rootComponentName = targetToMount?.getAttribute('data-root-component');

			return initApp(rootComponentName, {
				appProcessId: Object.fastHash(Math.random()),

				cookies: document,

				// FIXME: refactor core/session https://github.com/V4Fire/Client/issues/1329
				session: session.globalSession,

				location: getLocationAPI(),
				pageMetaData: new PageMetaData(getLocationAPI(), getPageMetaElements()),

				theme: new ThemeManager(
					{
						themeStorageEngine: new CookieStorage('v4ls', {
							cookies: cookies.from(document),
							maxAge: 2 ** 31 - 1
						}),

						systemThemeExtractor: new SystemThemeExtractorWeb()
					}
				),

				targetToMount
			});

			function getPageMetaElements(): AbstractElementProperties[] {
				return [
					{tag: 'title', attrs: {text: document.title}},
					...getDescriptor(document.head.querySelectorAll('meta')),
					...getDescriptor(document.head.querySelectorAll('link'))
				];

				function getDescriptor(list: NodeListOf<HTMLElement>) {
					return Array.from(list).map(({tagName, attributes}) => ({
						tag: tagName.toLowerCase(),
						attrs: Array.from(attributes).reduce((dict, {nodeName, nodeValue}) => {
							dict[nodeName] = nodeValue;
							return dict;
						}, {})
					}));
				}
			}

			function getLocationAPI(): URL {
				Object.defineProperties(location, {
					username: {
						configurable: true,
						enumerable: true,
						get: () => ''
					},

					password: {
						configurable: true,
						enumerable: true,
						get: () => ''
					},

					searchParams: {
						configurable: true,
						enumerable: true,
						get: () => new URLSearchParams(location.search)
					},

					toJSON: {
						configurable: true,
						enumerable: true,
						writable: false,
						value: () => location.toString()
					}
				});

				return Object.cast(location);
			}
		})

		.catch(stderr);
}

//#endunless
