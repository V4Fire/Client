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
import { setLocale, locale } from 'core/i18n';

import remoteState from 'core/component/state';
import { reset, ResetType, ComponentInterface } from 'core/component';

import { Route } from 'base/b-router/b-router';
import type bRouter from 'base/b-router/b-router';

import iBlock from 'super/i-block/i-block';
import iPage, { component, field, system, computed, watch } from 'super/i-page/i-page';

import ProvidedDataStore from 'super/i-static-page/modules/provider-data-store';
import { RootMod } from 'super/i-static-page/interface';

export * from 'super/i-page/i-page';
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
	readonly PageParams!: object;

	/**
	 * Type: page query
	 */
	readonly PageQuery!: object;

	/**
	 * Type: page meta
	 */
	readonly PageMeta!: object;

	/**
	 * Type: current page
	 */
	readonly CurrentPage!: Route<this['PageParams'], this['PageQuery'], this['PageMeta']>;

	/** @override */
	@system()
	readonly i18n: typeof i18n = ((i18n));

	/**
	 * Remote data store
	 */
	@system(() => new ProvidedDataStore())
	readonly providerDataStore!: ProvidedDataStore;

	/**
	 * Authorization status
	 */
	@field((o) => o.sync.link('remoteState.isAuth'))
	isAuth!: boolean;

	/**
	 * Online status
	 */
	@field((o) => o.sync.link('remoteState.isOnline'))
	isOnline!: boolean;

	/**
	 * Last online date
	 */
	@system((o) => o.sync.link('remoteState.lastOnlineDate'))
	lastOnlineDate?: Date;

	/** @override */
	@computed({watchable: true})
	get remoteState(): typeof remoteState {
		return remoteState;
	}

	/**
	 * Name of the active route page
	 */
	@computed({cache: true, dependencies: ['route.meta.name']})
	get activePage(): CanUndef<string> {
		return this.field.get('route.meta.name');
	}

	/** @override */
	get route(): CanUndef<this['CurrentPage']> {
		return this.field.get('routeStore');
	}

	/**
	 * Sets a new route object
	 *
	 * @param value
	 * @emits `setRoute(value: CanUndef<this['CurrentPage']>)`
	 */
	set route(value: CanUndef<this['CurrentPage']>) {
		this.field.set('routeStore', value);
		this.emit('setRoute', value);
	}

	/** @override */
	get pageTitle(): string {
		return this.field.get<string>('pageTitleStore')!;
	}

	/** @override */
	set pageTitle(value: string) {
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
	protected routerStore?: bRouter;

	/** @see [[iStaticPage.locale]]  */
	@field(() => locale.value)
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
	 * @param component
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	setPageTitle(value: string, component: ComponentInterface = this): CanPromise<boolean> {
		this.pageTitle = value;
		return this.pageTitle === value;
	}

	/**
	 * Sends a message to reset data of all components
	 * @param [type] - reset type
	 */
	reset(type?: ResetType): void {
		this.nextTick(() => reset(type), {
			label: $$.reset
		});
	}

	/**
	 * @override
	 * @param name
	 * @param value
	 * @param [component] - instance of the component that wants to set a modifier
	 */
	setRootMod(name: string, value: unknown, component: iBlock = this): boolean {
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
	 * @override
	 * @param name
	 * @param [value]
	 * @param [component] - instance of the component that wants to remove a modifier
	 */
	removeRootMod(name: string, value?: unknown, component: iBlock = this): boolean {
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
	 * @override
	 * @param name
	 * @param [component] - instance of the component that wants to get a modifier
	 */
	getRootMod(name: string, component: iBlock = this): CanUndef<string> {
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
	 * Synchronization of the "localeStore" field
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
