/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import watch from 'core/object/watch';

import CookieStorage from 'core/kv-storage/engines/cookie';

import PageMetaData from 'core/page-meta-data';
import ThemeManager, { SystemThemeExtractorStub } from 'core/theme-manager';
import HydrationStore from 'core/hydration-store';

import * as net from 'core/net';
import * as cookies from 'core/cookies';
import { i18nFactory } from 'core/i18n';

import Provider, { providers, instanceCache } from 'core/data';
import type { DataProviderProp } from 'components/super/i-block/providers/interface';
import type { State } from 'core/component';
import type { InitAppOptions, CreateAppOptions } from 'core/init/interface';

/**
 * Returns the application state object and parameters for creating an application instance based on
 * the passed initialization parameters
 *
 * @param opts - initialization options
 */
export function getAppParams(opts: InitAppOptions): {
	state: State;
	createAppOpts: Pick<InitAppOptions, keyof CreateAppOptions>;
} {
	let {route, hydrationStore} = opts;

	if (route == null && SSR) {
		route = opts.location.pathname + opts.location.search;
	}

	if (hydrationStore != null) {
		const store = new HydrationStore();
		Object.assign(store, hydrationStore);
		hydrationStore = store;

	} else {
		hydrationStore = new HydrationStore();
	}

	const resolvedState = {
		...opts,
		appProcessId: opts.appProcessId ?? Object.fastHash(Math.random()),

		i18n: (
			keysetName: CanArray<string>, customLocale?: Language
		) => i18nFactory(keysetName, customLocale ?? opts.locale),

		route,
		cookies: cookies.from(opts.cookies),

		net: opts.net ?? net,
		async: new Async(),

		theme: opts.theme ?? new ThemeManager(
			{
				themeStorageEngine: new CookieStorage('v4ls', {
					cookies: cookies.from(opts.cookies),
					maxAge: 2 ** 31 - 1
				}),

				systemThemeExtractor: new SystemThemeExtractorStub()
			}
		),

		pageMetaData: opts.pageMetaData ?? new PageMetaData(opts.location),

		hydrationStore
	};

	resolvedState.createDataProviderInstance = createDataProviderInstance.bind(null, resolvedState);
	resolvedState.destroy = destroy.bind(null, resolvedState);

	resolvedState.async.worker(() => {
		try {
			setTimeout(() => {
				Object.keys(resolvedState).forEach((key) => {
					delete resolvedState[key];
				});
			}, 0);
		} catch {}
	});

	return {
		// Make the state observable
		state: SSR ? resolvedState : watch(resolvedState).proxy,

		createAppOpts: {
			targetToMount: opts.targetToMount,

			// eslint-disable-next-line @v4fire/unbound-method
			setup: opts.setup
		}
	};
}

function destroy(remoteState: State) {
	const
		isThisApp = new RegExp(RegExp.escape(`:${RegExp.escape(remoteState.appProcessId)}:`));

	Object.forEach(instanceCache, (provider, key) => {
		if (isThisApp.test(key)) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			provider?.destroy();
			delete instanceCache[key];
		}
	});

	remoteState.async.clearAll();
}

function createDataProviderInstance(remoteState: State, provider: DataProviderProp): CanNull<Provider> {
	const opts = {
		i18n: remoteState.i18n,
		id: remoteState.appProcessId,
		remoteState
	};

	let
		dp: Provider;

	if (Object.isString(provider)) {
		const
			ProviderConstructor = <CanUndef<typeof Provider>>providers[provider];

		if (ProviderConstructor == null) {
			if (provider === 'Provider') {
				return null;
			}

			throw new ReferenceError(`The provider "${provider}" is not defined`);
		}

		dp = new ProviderConstructor(opts);
		registerDestructor();

	} else if (Object.isFunction(provider)) {
		const ProviderConstructor = Object.cast<typeof Provider>(provider);

		dp = new ProviderConstructor(opts);
		registerDestructor();

	} else {
		dp = <Provider>provider;
	}

	return dp;

	function registerDestructor() {
		remoteState.async.worker(() => {
			instanceCache[dp.getCacheKey()]?.destroy();
		});
	}
}
