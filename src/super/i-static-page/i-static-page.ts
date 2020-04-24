/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import remoteState from 'core/component/state';

import { defProp } from 'core/const/props';
import { reset, globalEvent, ResetType, ComponentInterface } from 'core/component';
import { setLocale, locale } from 'core/i18n';

import { Session } from 'core/session/interface';
import { NetStatus } from 'core/net/interface';

import iBlock from 'super/i-block/i-block';
import ProvidedDataStore from 'super/i-static-page/modules/provider-data-store';
import iPage, { component, field, system, watch, p, Event } from 'super/i-page/i-page';
import { CurrentPage } from 'core/router/interface';

//#if runtime has bRouter
import bRouter from 'base/b-router/b-router';
//#endif

export * from 'super/i-data/i-data';
export { globalEvent, ResetType, CurrentPage };

export type RemoteState = typeof remoteState;
export type RootMods = Dictionary<{
	mod: string;
	value: string;
	component: ComponentInterface | false;
}>;

export const
	$$ = symbolGenerator();

const
	includedThemes = INCLUDED_THEMES;

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
	readonly CurrentPage!: CurrentPage<this['PageParams'], this['PageQuery'], this['PageMeta']>;

	/**
	 * Link to i18n function
	 */
	@system()
	readonly i18n: typeof i18n = ((i18n));

	/** @override */
	@system(() => globalEvent)
	readonly globalEvent!: Event<this>;

	/**
	 * Remote data store
	 */
	@system(() => new ProvidedDataStore())
	readonly providerDataStore!: ProvidedDataStore;

	/**
	 * Authorization status
	 */
	@field({
		after: 'remoteState',
		init: (o) => o.sync.link('remoteState', (state: RemoteState) => state.isAuth)
	})

	isAuth!: boolean;

	/**
	 * Online status
	 */
	@field({
		after: 'remoteState',
		init: (o) => o.sync.link('remoteState', (state: RemoteState) => state.isOnline)
	})

	isOnline!: boolean;

	/**
	 * Last online date
	 */
	@system((o) => o.sync.link('remoteState', (state: RemoteState) => state.lastOnlineDate))
	lastOnlineDate?: Date;

	/** @override */
	@field({
		atom: true,
		init: () => remoteState
	})

	remoteState!: Dictionary;

	/**
	 * Active page component
	 */
	get activePage(): CanUndef<string> {
		return this.route && this.field.get('route.meta.page');
	}

	/** @override */
	get route(): CanUndef<this['CurrentPage']> {
		return this.field.get('routeStore');
	}

	/**
	 * @override
	 * @emits setRoute(value: CanUndef<this['CurrentPage']>)
	 */
	set route(value: CanUndef<this['CurrentPage']>) {
		this.field.set('routeStore', value);
		this.emit('setRoute', value);
	}

	/** @override */
	@p({cache: false})
	get pageTitle(): string {
		return this.field.get<string>('pageTitleStore')!;
	}

	/** @override */
	set pageTitle(value: string) {
		if (value == null) {
			return;
		}

		const
			div = Object.assign(document.createElement('div'), {innerHTML: value}),
			title = div.textContent || '';

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
	 * Themes list, which are available
	 */
	get availableThemes(): CanUndef<string[]> {
		return includedThemes;
	}

	/**
	 * Root theme
	 */
	get theme(): unknown {
		return this.getRootMod('theme', false);
	}

	/**
	 * Sets a theme mod for the root element
	 * @param value
	 */
	set theme(value: unknown) {
		if (!includedThemes?.includes(String(value))) {
			throw new ReferenceError(`Theme with name "${value}" is not defined`);
		}

		this.setRootMod('theme', value, false);
	}

	/**
	 * Route information object store
	 */
	@field()
	protected routeStore?: this['CurrentPage'];

	/**
	 * Root page router instance
	 */
	@system()
	protected routerStore?: bRouter;

	/**
	 * System locale store
	 */
	@field(() => locale.value)
	protected localeStore!: string;

	/**
	 * Cache of root modifiers
	 */
	@system()
	protected rootMods: RootMods = {};

	/**
	 * Sets a new page title
	 *
	 * @param value
	 * @param component
	 */
	setPageTitle(value: string, component: ComponentInterface = this): CanPromise<boolean> {
		this.pageTitle = value;
		return this.pageTitle === value;
	}

	/**
	 * Sends a message for reset to all components
	 * @param [type] - reset type
	 */
	reset(type?: ResetType): void {
		this.nextTick(() => reset(type), {
			label: $$.reset
		});
	}

	/** @override */
	// @ts-ignore
	setRootMod(name: string, value: unknown, component: false | iBlock = this): boolean {
		const
			root = document.documentElement;

		if (value === undefined || !root) {
			return false;
		}

		const
			cl = root.classList;

		let
			mod;

		if (component === false) {
			mod = `root_${name}_${value}`;
			name = `root_${name.camelize(false)}`;

		} else {
			const
				c = (component.globalName || component.componentName).dasherize();

			mod = this.provide.fullComponentName(c, name, value).replace(/_/g, '-');
			name = `${c}_${name.camelize(false)}`;
		}

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
	// @ts-ignore
	removeRootMod(name: string, value?: unknown, component: false | iBlock = this): boolean {
		const
			root = document.documentElement;

		if (!root) {
			return false;
		}

		const
			prefix = component === false ? 'root' : (component.globalName || component.componentName).dasherize();

		name = `${prefix}_${name.camelize(false)}`;
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
	getRootMod(name: string, component: false | ComponentInterface = this): CanUndef<string> {
		const
			prefix = component === false ? 'root' : (component.globalName || component.componentName).dasherize();

		name = `${prefix}_${name.camelize(false)}`;
		return this.rootMods?.[name]?.value;
	}

	/**
	 * Synchronization for the localeStore field
	 * @param locale
	 */
	@watch(['localeStore', 'globalEvent:i18n.setLocale'])
	protected syncLocaleWatcher(locale: string): void {
		if (this.locale === locale) {
			return;
		}

		this.locale = locale;
		this.forceUpdate().catch(stderr);
	}

	/**
	 * Synchronization for the isAuth field
	 * @param [e]
	 */
	@watch('globalEvent:session.*')
	protected syncAuthWatcher(e?: Session): void {
		this.isAuth = Boolean(e && e.auth);
	}

	/**
	 * Synchronization for the isOnline field
	 * @param e
	 */
	@watch('globalEvent:net.status')
	protected syncOnlineWatcher(e: NetStatus): void {
		this.isOnline = e.status;
		this.lastOnlineDate = e.lastOnline;
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		Object.defineProperty(this, 'remoteState', {...defProp, value: remoteState});
	}
}
