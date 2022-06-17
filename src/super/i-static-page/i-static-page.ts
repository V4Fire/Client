/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-static-page/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import { RestrictedCache } from 'core/cache';
import { setLocale, locale } from 'core/i18n';
import { resetComponents, ComponentResetType, ComponentInterface } from 'core/component';

import type bRouter from 'base/b-router/b-router';
import type { AppliedRoute } from 'core/router';

import type iBlock from 'super/i-block/i-block';
import iPage, { component, field, system, computed, watch } from 'super/i-page/i-page';

import createProviderDataStore, { ProviderDataStore } from 'super/i-static-page/modules/provider-data-store';
import themeManagerFactory, { ThemeManager } from 'super/i-static-page/modules/theme';

import type { RootMod } from 'super/i-static-page/interface';

export * from 'super/i-page/i-page';
export * from 'super/i-static-page/modules/theme';

export { createProviderDataStore };
export * from 'super/i-static-page/modules/provider-data-store';

export * from 'super/i-static-page/interface';

export const
	$$ = symbolGenerator();

/**
 * Superclass for all root components
 */
@component()
export default abstract class iStaticPage extends iPage {
	/**
	 * Type: page parameters
	 */
	readonly PageParams!: this['Router']['PageParams'];

	/**
	 * Type: page query
	 */
	readonly PageQuery!: this['Router']['PageQuery'];

	/**
	 * Type: page meta
	 */
	readonly PageMeta!: this['Router']['PageMeta'];

	/**
	 * Type: router
	 */
	readonly Router!: bRouter;

	/**
	 * Type: current page
	 */
	readonly CurrentPage!: AppliedRoute<this['PageParams'], this['PageQuery'], this['PageMeta']>;

	/**
	 * Module to work with data of data providers globally
	 */
	@system(() => createProviderDataStore(new RestrictedCache(10)))
	readonly providerDataStore!: ProviderDataStore;

	/**
	 * Module to manage app themes from the Design System
	 */
	@system<iStaticPage>(themeManagerFactory)
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
	 * Name of the active route page
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

	override get pageTitle(): string {
		return this.field.get<string>('pageTitleStore')!;
	}

	override set pageTitle(value: string) {
		if (!Object.isString(value)) {
			return;
		}

		const
			div = Object.assign(document.createElement('div'), {innerHTML: value}),
			title = div.textContent ?? '';

		// Fix strange Chrome bug
		// tslint:disable-next-line:no-irregular-whitespace
		document.title = `${title} `;
		document.title = title;

		this.field.set('pageTitleStore', title);
	}

	/**
	 * System locale
	 */
	get locale(): string {
		return this.field.get<string>('localeStore')!;
	}

	/**
	 * Sets a new system locale
	 */
	set locale(value: string) {
		this.field.set('localeStore', value);

		try {
			document.documentElement.setAttribute('lang', value);
		} catch {}

		setLocale(value);
	}

	/**
	 * Route information object store
	 * @see [[iStaticPage.route]]
	 */
	@field({forceUpdate: false})
	protected routeStore?: this['CurrentPage'];

	/**
	 * Link to a router instance
	 */
	@system()
	protected routerStore?: this['Router'];

	/** @see [[iStaticPage.locale]]  */
	@field(() => {
		const
			lang = locale.value;

		if (Object.isTruly(lang)) {
			try {
				const
					el = document.documentElement;

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
	 * Sets a new page title
	 *
	 * @param value
	 * @param [component]
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	setPageTitle(value: string, component: ComponentInterface = this): CanPromise<boolean> {
		this.pageTitle = value;
		return this.pageTitle === value;
	}

	/**
	 * Sends a message to reset data of all components.
	 * The method can take a reset type:
	 *
	 * 1. `'load'` - reload provider' data of all components;
	 * 2. `'load.silence'` - reload provider' data of all components without triggering of component' state;
	 * 3. `'router'` - reload router' data of all components;
	 * 4. `'router.silence'` - reload router' data of all components without triggering of component' state;
	 * 5. `'storage'` - reload storage' data of all components;
	 * 6. `'storage.silence'` - reload storage' data of all components without triggering of component' state;
	 * 7. `'silence'` - reload all components without triggering of component' state.
	 *
	 * @param [type] - reset type
	 */
	reset(type?: ComponentResetType): void {
		this.nextTick(() => resetComponents(type), {
			label: $$.reset
		});
	}

	/**
	 * @param name
	 * @param value
	 * @param [component] - instance of the component that wants to set a modifier
	 */
	override setRootMod(name: string, value: unknown, component: iBlock = this): boolean {
		const
			root = document.documentElement;

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
	 * @param name
	 * @param [value]
	 * @param [component] - instance of the component that wants to remove a modifier
	 */
	override removeRootMod(name: string, value?: unknown, component: iBlock = this): boolean {
		const
			root = document.documentElement;

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
	 * @param name
	 * @param [component] - instance of the component that wants to get a modifier
	 */
	override getRootMod(name: string, component: iBlock = this): CanUndef<string> {
		return this.rootMods[this.getRootModKey(name, component)]?.value;
	}

	/**
	 * Returns a key to save the specified root element modifier
	 *
	 * @param name - modifier name
	 * @param [component]
	 */
	protected getRootModKey(name: string, component: iBlock = this): string {
		return `${(component.globalName ?? component.componentName).dasherize()}_${name.camelize(false)}`;
	}

	/**
	 * Synchronization of the `localeStore` field
	 * @param locale
	 */
	@watch(['localeStore', 'globalEmitter:i18n.setLocale'])
	protected syncLocaleWatcher(locale: string): void {
		if (this.locale === locale) {
			return;
		}

		this.locale = locale;
		this.forceUpdate().catch(stderr);
	}
}
