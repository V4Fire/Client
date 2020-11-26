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

import { NetStatus } from 'core/net/interface';
import { setLocale, locale } from 'core/i18n';
import { Session } from 'core/session/interface';

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

	/** @override */
	setRootMod(name: string, value: unknown, component: iBlock = this): boolean {
		const
			root = document.documentElement;

		if (value === undefined || !Object.isTruly(root)) {
			return false;
		}

		const
			cl = root.classList;

		const
			c = (component.globalName ?? component.componentName).dasherize(),
			mod = this.provide.fullComponentName(c, name, value).replace(/_/g, '-');

		name = `${c}_${name.camelize(false)}`;
		value = String(value).dasherize();

		const
			cache = this.rootMods[name];

		if (cache) {
			if (cache.value === value && cache.component === component) {
				return false;
			}

			cl.remove(cache.mod);
		}

		cl.add(mod);
		this.rootMods[name] = {
			mod,
			value: <string>value,
			component
		};

		return true;
	}

	/** @override */
	removeRootMod(name: string, value?: unknown, component: iBlock = this): boolean {
		const
			root = document.documentElement;

		if (!Object.isTruly(root)) {
			return false;
		}

		name = `${(component.globalName ?? component.componentName).dasherize()}_${name.camelize(false)}`;
		value = value !== undefined ? String(value).dasherize() : undefined;

		const
			cache = this.rootMods[name];

		if (cache) {
			if (cache.component !== component) {
				return false;
			}

			if (value === undefined || value === cache.value) {
				root.classList.remove(cache.mod);
				delete this.rootMods[name];
				return true;
			}
		}

		return false;
	}

	/** @override */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	getRootMod(name: string, component: ComponentInterface = this): undefined | string {
		return this.rootMods[name]?.value;
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

	/**
	 * Synchronization of the "isAuth" field
	 * @param [e]
	 */
	@watch('globalEmitter:session.*')
	protected syncAuthWatcher(e?: Session): void {
		this.isAuth = Boolean(e?.auth);
	}

	/**
	 * Synchronization of the "isOnline" field
	 * @param e
	 */
	@watch('globalEmitter:net.status')
	protected syncOnlineWatcher(e: NetStatus): void {
		this.isOnline = e.status;
		this.lastOnlineDate = e.lastOnline;
	}
}
