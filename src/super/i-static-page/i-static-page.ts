/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import remoteState from 'core/component/state';

import { GLOBAL } from 'core/env';
import { defProp } from 'core/const/props';
import { reset, globalEvent, ResetType, ComponentInterface } from 'core/component';
import { setLang, lang } from 'core/i18n';

import { SetEvent } from 'core/session';
import { StatusEvent } from 'core/net';

import iBlock from 'super/i-block/i-block';
import iPage, { component, field, system, watch, Event } from 'super/i-page/i-page';

//#if runtime has bRouter
import bRouter, { CurrentPage } from 'base/b-router/b-router';
//#endif

export * from 'super/i-data/i-data';
export { globalEvent, ResetType, CurrentPage };

export type RemoteState = typeof remoteState;
export type RootMods = Dictionary<{
	mod: string;
	value: string;
	component: ComponentInterface;
}>;

export const
	$$ = symbolGenerator();

@component()
export default abstract class iStaticPage<
	P extends object = Dictionary,
	Q extends object = Dictionary,
	M extends object = Dictionary,
	D extends object = Dictionary
> extends iPage<D> {
	/**
	 * Link to i18n function
	 */
	@system()
	readonly i18n: typeof i18n = ((i18n));

	/** @override */
	@system(() => globalEvent)
	readonly globalEvent!: Event<this>;

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

	/** @override */
	get route(): CanUndef<CurrentPage<P, Q, M>> {
		return this.field.get('routeStore');
	}

	/**
	 * @override
	 * @emits setRoute(value: CanUndef<CurrentPage<P, Q, M>>)
	 */
	set route(value: CanUndef<CurrentPage<P, Q, M>>) {
		this.field.set('routeStore', value);
		this.emit('setRoute', value);
	}

	/** @override */
	get pageTitle(): string {
		return <NonNullable<string>>this.field.get('pageTitleStore');
	}

	/** @override */
	set pageTitle(value: string) {
		if (value == null) {
			return;
		}

		const div = document.createElement('div');
		div.innerHTML = value;

		document.title = div.textContent || '';
	}

	/**
	 * System language
	 */
	get lang(): string {
		return <NonNullable<string>>this.field.get('langStore');
	}

	/**
	 * Sets a new system language
	 */
	set lang(value: string) {
		this.field.set('langStore', value);
		setLang(value);
	}

	/**
	 * Route information object store
	 */
	@field()
	protected routeStore?: CurrentPage<P, Q, M>;

	/**
	 * Root page router instance
	 */
	@system()
	protected routerStore?: bRouter;

	/**
	 * System language store
	 */
	@field()
	protected langStore: string = lang;

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
	setRootMod(name: string, value: unknown, component: iBlock = this): boolean {
		const
			root = document.documentElement;

		if (value === undefined || !root) {
			return false;
		}

		const
			cl = root.classList;

		const
			c = (component.globalName || component.componentName).dasherize(),
			mod = this.provide.fullBlockName(c, name, value).replace(/_/g, '-');

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
	// @ts-ignore
	removeRootMod(name: string, value?: unknown, component: iBlock = this): boolean {
		const
			root = document.documentElement;

		if (!root) {
			return false;
		}

		name = `${(component.globalName || component.componentName).dasherize()}_${name.camelize(false)}`;
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
	getRootMod(name: string, component: ComponentInterface = this): undefined | string {
		return this.removeRootMod[name] && this.removeRootMod[name].value;
	}

	/**
	 * Synchronization for the langStore field
	 * @param lang
	 */
	@watch('langStore')
	@watch('globalEvent:i18n.setLang')
	protected syncLangWatcher(lang: string): void {
		if (this.lang === lang) {
			return;
		}

		this.lang = lang;
		this.$forceUpdate();
	}

	/**
	 * Synchronization for the isAuth field
	 * @param [e]
	 */
	@watch('globalEvent:session.*')
	protected syncAuthWatcher(e?: SetEvent): void {
		this.isAuth = Boolean(e && e.auth);
	}

	/**
	 * Synchronization for the isOnline field
	 * @param e
	 */
	@watch('globalEvent:net.status')
	protected syncOnlineWatcher(e: StatusEvent): void {
		this.isOnline = e.status;
		this.lastOnlineDate = e.lastOnline;
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		Object.defineProperty(this, 'remoteState', {...defProp, value: remoteState});
	}
}
