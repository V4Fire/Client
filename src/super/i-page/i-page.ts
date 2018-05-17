/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as net from 'core/net';
import * as session from 'core/session';

import iData, { component, field, system, watch, hook } from 'super/i-data/i-data';
import { VueInterface } from 'core/component';
import { setLang, lang } from 'core/i18n';
import { TransitionPageInfo } from 'base/b-router/b-router';
export * from 'super/i-data/i-data';

export type RootMods = Dictionary<{
	mod: string;
	value: string;
	component: VueInterface;
}>;

@component()
export default class iPage<
	T extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary,
	D extends Dictionary = Dictionary
> extends iData<D> {
	/**
	 * Link to i18n function
	 */
	@system()
	readonly i18n: typeof i18n = i18n;

	/**
	 * Page information object
	 */
	@field()
	pageInfo?: TransitionPageInfo<T, M>;

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
	 * System language
	 */
	get lang(): string {
		return this.langStore;
	}

	/**
	 * Sets a new system language
	 */
	set lang(value: string) {
		setLang(this.langStore = value);
	}

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
			mod = this.getFullBlockName(c, name, value);

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

	/**
	 * Initializes listeners for some remote instances (online, session, etc.)
	 */
	@hook('created')
	protected initRemoteListeners(): void {
		const {async: $a} = this;
		$a.on(net.event, 'status', (value) => this.isOnline = value);
		$a.on(session.event, 'set', ({auth}) => this.isAuth = Boolean(auth));
		$a.on(session.event, 'clear', () => this.isAuth = false);
	}
}
