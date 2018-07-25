/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { reset, ResetType, VueInterface } from 'core/component';
import { setLang, lang } from 'core/i18n';

import bRouter, { PageInfo } from 'base/b-router/b-router';
import iPage, { component, field, system, watch } from 'super/i-page/i-page';
export * from 'super/i-data/i-data';

export type RootMods = Dictionary<{
	mod: string;
	value: string;
	component: VueInterface;
}>;

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
	 * Page information object
	 */
	@field()
	pageInfo?: PageInfo<T, M>;

	/**
	 * Authorization status
	 */
	@field((o) => (<any>o).$state.isAuth)
	isAuth!: boolean;

	/**
	 * Online status
	 */
	@field((o) => (<any>o).$state.isOnline)
	isOnline!: boolean;

	/**
	 * Last online date
	 */
	@system((o) => (<any>o).$state.lastOnlineDate)
	lastOnlineDate?: Date;

	/** @override */
	get pageTitle(): string {
		return this.pageTitleStore;
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
	 * Page title store
	 */
	@system((o) => o.link())
	protected pageTitleStore!: string;

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
	 * Sends a message for reset to all components
	 * @param [type] - reset type
	 */
	reset(type?: ResetType): void {
		reset();
	}

	/** @override */
	setRootMod(name: string, value: any, component: VueInterface = this): boolean {
		if (value === undefined) {
			return false;
		}

		const
			root = document.documentElement,
			cl = root.classList;

		const
			c = component.componentName,
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
	removeRootMod(name: string, value?: any, component: VueInterface = this): boolean {
		const
			root = document.documentElement;

		name = `${component.componentName}_${name.camelize(false)}`;
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
	 */
	@watch('langStore')
	protected syncLangWatcher(): void {
		this.$forceUpdate();
	}

	/** @override */
	protected initGlobalEvents(): void {
		super.initGlobalEvents();

		const
			{globalEvent: $e} = this;

		$e.on('net.status', ({status, lastOnline}) => {
			this.isOnline = status;
			this.lastOnlineDate = lastOnline;
		});

		$e.on('session.set', ({auth}) => this.isAuth = Boolean(auth));
		$e.on('session.clear', () => this.isAuth = false);
		$e.on('i18n.setLang', (lang) => this.lang = lang);
	}
}
