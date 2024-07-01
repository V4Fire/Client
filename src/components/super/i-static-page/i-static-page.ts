/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-static-page/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import { Xor128 } from 'core/random/xor128';

import { RestrictedCache } from 'core/cache';
import { instanceCache } from 'core/data';

import { setLocale, locale } from 'core/i18n';

import type { AppliedRoute, InitialRoute } from 'core/router';

import * as cookies from 'core/cookies';
import CookieStorage from 'core/kv-storage/engines/cookie';

import { SystemThemeExtractorWeb } from 'components/super/i-static-page/modules/theme';

import {

	resetComponents,

	GlobalEnvironment,
	ComponentResetType

} from 'core/component';

import type bRouter from 'components/base/b-router/b-router';
import type iBlock from 'components/super/i-block/i-block';

import iPage, { component, field, system, computed, hook, watch } from 'components/super/i-page/i-page';

import PageMetaData from 'components/super/i-static-page/modules/page-meta-data';
import createProviderDataStore, { ProviderDataStore } from 'components/super/i-static-page/modules/provider-data-store';
import themeManagerFactory, { ThemeManager } from 'components/super/i-static-page/modules/theme';

import type { RootMod } from 'components/super/i-static-page/interface';

export * from 'components/super/i-page/i-page';
export * from 'components/super/i-static-page/modules/theme';

export { createProviderDataStore };
export * from 'components/super/i-static-page/modules/provider-data-store';

export * from 'components/super/i-static-page/interface';

const
	$$ = symbolGenerator();

@component()
export default abstract class iStaticPage extends iPage {
	/**
	 * Type: the page parameters
	 */
	readonly PageParams!: this['Router']['PageParams'];

	/**
	 * Type: the page query
	 */
	readonly PageQuery!: this['Router']['PageQuery'];

	/**
	 * Type: the page meta information
	 */
	readonly PageMeta!: this['Router']['PageMeta'];

	/**
	 * Type: the router
	 */
	readonly Router!: bRouter;

	/**
	 * Type: the current page
	 */
	readonly CurrentPage!: AppliedRoute<this['PageParams'], this['PageQuery'], this['PageMeta']>;

	/**
	 * A module for manipulating page metadata, such as the page title or description
	 */
	@system<iStaticPage>((o) => new PageMetaData({
		document: o.remoteState.document ?? document
	}))

	readonly pageMetaData!: PageMetaData;

	/**
	 * A module to work with data of data providers globally
	 */
	@system(() => createProviderDataStore(new RestrictedCache(10)))
	readonly providerDataStore!: ProviderDataStore;

	/**
	 * A module to manage app themes from the Design System
	 */
	@system<iStaticPage>((o) => themeManagerFactory(
		o,
		{
			themeStorageEngine: new CookieStorage('v4ls', {
				cookies: cookies.from(o.remoteState.cookies ?? cookies.createCookieStore('')),
				maxAge: 2 ** 31 - 1
			}),

			systemThemeExtractor: new SystemThemeExtractorWeb(o)
		}
	))

	readonly theme: CanUndef<ThemeManager>;

	/**
	 * True if the current user is authorized
	 */
	@field((o) => o.sync.link('remoteState.isAuth'))
	isAuth!: boolean;

	/**
	 * True if there is a connection to the Internet
	 */
	@field((o) => o.sync.link('remoteState.isOnline'))
	isOnline!: boolean;

	/**
	 * Last date when the application was online
	 */
	@system((o) => o.sync.link('remoteState.lastOnlineDate'))
	lastOnlineDate?: Date;

	/**
	 * Initial value for the active route.
	 * This field is typically used in cases of SSR and hydration.
	 */
	@system((o) => o.remoteState.route)
	initialRoute?: InitialRoute | this['CurrentPage'];

	/**
	 * An object whose properties will extend the global object.
	 * For example, for SSR rendering, the proper functioning of APIs such as `document.cookie` or `location` is required.
	 * Using this object, polyfills for all necessary APIs can be passed through.
	 */
	@system<iStaticPage>({
		atom: true,
		init: (o) => o.initGlobalEnv(o.remoteState)
	})

	globalEnv!: GlobalEnvironment;

	/**
	 * Number of external root instances of the application.
	 * This parameter allows you to detect memory leaks when using asyncRender.
	 */
	@system()
	readonly remoteRootInstances: number = 0;

	/**
	 * The name of the active route page
	 */
	@computed({cache: true, dependencies: ['route.meta.name']})
	get activePage(): CanUndef<string> {
		return this.field.get('route.meta.name');
	}

	@computed()
	override get route(): CanUndef<this['CurrentPage']> {
		return this.field.get('routeStore');
	}

	/**
	 * Sets a new route object
	 *
	 * @param value
	 * @emits `setRoute(value: CanUndef<this['CurrentPage']>)`
	 */
	override set route(value: CanUndef<this['CurrentPage']>) {
		this.field.set('routeStore', value);
		this.emit('setRoute', value);
	}

	/**
	 * The application locale
	 */
	get locale(): Language {
		return this.field.get<Language>('localeStore')!;
	}

	/**
	 * Sets a new application locale
	 * @param value
	 */
	set locale(value: Language) {
		this.field.set('localeStore', value);

		try {
			document.documentElement.setAttribute('lang', value);
		} catch {}

		setLocale(value);
	}

	override get randomGenerator(): IterableIterator<number> {
		this[$$.randomGenerator] ??= new Xor128(19881989);
		return this[$$.randomGenerator];
	}

	/**
	 * True if component teleports should be mounted
	 */
	@field()
	protected shouldMountTeleports: boolean = false;

	/**
	 * The route information object store
	 * {@link iStaticPage.route}
	 */
	@field<iStaticPage>((o) => SSR ? undefined : o.initialRoute)
	protected routeStore?: this['CurrentPage'];

	/**
	 * A link to the router instance
	 */
	@system()
	protected routerStore?: this['Router'];

	/** {@link iStaticPage.locale} */
	@field(() => {
		const
			lang = locale.value;

		if (Object.isTruly(lang)) {
			try {
				const
					el = document.documentElement;

				if (lang != null) {
					el.setAttribute('lang', lang);

				} else {
					el.removeAttribute('lang');
				}

			} catch {}
		}

		return lang;
	})

	protected localeStore!: string;

	/**
	 * Cache of root modifiers
	 */
	@system()
	protected rootMods: Dictionary<RootMod> = {};

	/**
	 * Sends a message to reset data of all components.
	 * The method can accept a reset type:
	 *
	 * 1. `'load'` - reloads provider data of all components;
	 * 2. `'load.silence'` - reloads provider data of all components without triggering of component state;
	 * 3. `'router'` - reloads router data of all components;
	 * 4. `'router.silence'` - reloads router data of all components without triggering of component state;
	 * 5. `'storage'` - reloads storage data of all components;
	 * 6. `'storage.silence'` - reloads storage data of all components without triggering of component state;
	 * 7. `'silence'` - reloads all components without triggering of component state.
	 *
	 * @param [type] - the reset type
	 */
	reset(type?: ComponentResetType): void {
		this.nextTick(() => resetComponents(type), {
			label: $$.reset
		});
	}

	/**
	 * @inheritDoc
	 * @param name
	 * @param value
	 * @param [component] - an instance of the component that wants to set the modifier
	 */
	override setRootMod(name: string, value: unknown, component: iBlock = this): boolean {
		let
			root: HTMLElement;

		try {
			root = document.documentElement;

		} catch {
			return false;
		}

		if (value === undefined || !Object.isTruly(root)) {
			return false;
		}

		const
			cl = root.classList,
			globalName = (component.globalName ?? component.componentName).dasherize();

		const
			modKey = this.getRootModKey(name, component),
			modClass = this.provide.fullComponentName(globalName, name, value).replace(/_/g, '-');

		const
			normalizedValue = String(value).dasherize(),
			cache = this.rootMods[modKey];

		if (cache) {
			if (cache.value === normalizedValue && cache.component === component) {
				return false;
			}

			cl.remove(cache.class);
		}

		cl.add(modClass);

		this.rootMods[modKey] = {
			name: name.dasherize(),
			value: normalizedValue,
			class: modClass,
			component
		};

		return true;
	}

	/**
	 * @inheritDoc
	 * @param name
	 * @param [value]
	 * @param [component] - an instance of the component that wants to remove the modifier
	 */
	override removeRootMod(name: string, value?: unknown, component: iBlock = this): boolean {
		let
			root: HTMLElement;

		try {
			root = document.documentElement;

		} catch {
			return false;
		}

		if (!Object.isTruly(root)) {
			return false;
		}

		const
			modKey = this.getRootModKey(name, component),
			cache = this.rootMods[modKey];

		if (cache) {
			if (cache.component !== component) {
				return false;
			}

			const
				normalizedValue = value !== undefined ? String(value).dasherize() : undefined;

			if (normalizedValue === undefined || normalizedValue === cache.value) {
				root.classList.remove(cache.class);
				delete this.rootMods[modKey];
				return true;
			}
		}

		return false;
	}

	/**
	 * @inheritDoc
	 * @param name
	 * @param [component] - an instance of the component that wants to get the modifier
	 */
	override getRootMod(name: string, component: iBlock = this): CanUndef<string> {
		return this.rootMods[this.getRootModKey(name, component)]?.value;
	}

	/**
	 * Returns a key to save the specified root element modifier
	 *
	 * @param name - the modifier name
	 * @param [component]
	 */
	protected getRootModKey(name: string, component: iBlock = this): string {
		return `${(component.globalName ?? component.componentName).dasherize()}_${name.camelize(false)}`;
	}

	/**
	 * Initializes the slot for component teleports and mounts the teleported content
	 */
	@hook('mounted')
	protected async mountTeleports(): Promise<void> {
		if (SSR) {
			return;
		}

		document.body.append(Object.assign(document.createElement('div'), {
			id: 'teleports'
		}));

		await this.async.nextTick();
		this.shouldMountTeleports = true;
	}

	/**
	 * Synchronization of the `localeStore` field
	 * @param locale
	 */
	@watch(['localeStore', 'globalEmitter:i18n.setLocale'])
	protected syncLocaleWatcher(locale: Language): void {
		if (this.locale === locale) {
			return;
		}

		this.locale = locale;
		this.forceUpdate().catch(stderr);
	}

	protected override beforeDestroy(): void {
		super.beforeDestroy();
		this.hydrationStore?.clear();

		Object.forEach(this.ssrState, (_, key: string, state) => {
			delete state![key];
		});

		const
			isThisApp = new RegExp(RegExp.escape(`:${RegExp.escape(this.appProcessId)}:`));

		Object.forEach(instanceCache, (provider, key) => {
			if (isThisApp.test(key)) {
				provider.destroy();
			}
		});
	}

	/**
	 * Handler: the online status has been changed
	 * @param status
	 */
	@watch({path: 'isOnline', immediate: true})
	protected onOnlineChange(status: string): void {
		this.setRootMod('online', status);
	}
}
