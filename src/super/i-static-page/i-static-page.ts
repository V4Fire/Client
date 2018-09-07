/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { reset, ResetType, VueInterface } from 'core/component';
import { setLang, lang } from 'core/i18n';

import { SetEvent } from 'core/session';
import { StatusEvent } from 'core/net';

import iBlock from 'super/i-block/i-block';
import bRouter, { PageInfo } from 'base/b-router/b-router';
import iPage, { component, field, system, watch } from 'super/i-page/i-page';

export * from 'super/i-data/i-data';
export { ResetType, PageInfo };

export type RootMods = Dictionary<{
	mod: string;
	value: string;
	component: VueInterface;
}>;

export const
	$$ = symbolGenerator();

@component()
export default class iStaticPage<
	T extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary,
	D extends Dictionary = Dictionary
> extends iPage<D> {
	/**
	 * Link to i18n function
	 */
	@system()
	readonly i18n: typeof i18n = i18n;

	/**
	 * Authorization status
	 */
	@field((o) => o.remoteState.isAuth)
	isAuth!: boolean;

	/**
	 * Online status
	 */
	@field((o) => o.remoteState.isOnline)
	isOnline!: boolean;

	/**
	 * Last online date
	 */
	@system((o) => o.remoteState.lastOnlineDate)
	lastOnlineDate?: Date;

	/**
	 * Page information object store
	 */
	get pageInfo(): PageInfo<T, M> | undefined {
		return this.getField('pageInfoStore');
	}

	/**
	 * Sets a new page information object store
	 */
	set pageInfo(value: PageInfo<T, M> | undefined) {
		this.setField('pageInfoStore', value);
	}

	/** @override */
	get pageTitle(): string {
		return this.getField('pageTitleStore');
	}

	/** @override */
	set pageTitle(value: string) {
		document.title = value;
	}

	/**
	 * System language
	 */
	get lang(): string {
		return this.getField('langStore');
	}

	/**
	 * Sets a new system language
	 */
	set lang(value: string) {
		this.setField('langStore', value);
		setLang(value);
	}

	/**
	 * Page information object store
	 */
	@field()
	protected pageInfoStore?: PageInfo<T, M>;

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
	setPageTitle(value: string, component: VueInterface = this): CanPromise<boolean> {
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
	setRootMod(name: string, value: any, component: iBlock = this): boolean {
		if (value === undefined) {
			return false;
		}

		const
			root = document.documentElement,
			cl = root.classList;

		const
			c = (component.globalName || component.componentName).dasherize(),
			mod = this.getFullBlockName(c, name, value).replace(/_/g, '-');

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
			value,
			component
		};

		return true;
	}

	/** @override */
	// @ts-ignore
	removeRootMod(name: string, value?: any, component: iBlock = this): boolean {
		const
			root = document.documentElement;

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
	getRootMod(name: string, component: VueInterface = this): undefined | string {
		return this.removeRootMod[name] && this.removeRootMod[name].value;
	}

	/**
	 * Synchronization for the langStore field
	 * @param lang
	 */
	@watch('langStore')
	@watch('i18n.setLang')
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
	@watch('net.status')
	protected syncOnlineWatcher(e: StatusEvent): void {
		this.isOnline = e.status;
		this.lastOnlineDate = e.lastOnline;
	}
}
