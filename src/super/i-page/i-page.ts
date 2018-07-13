/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { reset, ResetType, VueInterface } from 'core/component';

import * as net from 'core/net';
import * as session from 'core/session';
import { setLang, lang } from 'core/i18n';

import bRouter, { PageInfo } from 'base/b-router/b-router';
import iData, { component, field, system, watch, hook, Statuses } from 'super/i-data/i-data';
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

	/** @override */
	@field()
	protected componentStatusStore!: Statuses;

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

	/**
	 * Initializes listeners for some remote instances (online, session, etc.)
	 */
	@hook('created')
	protected initRemoteListeners(): void {
		const
			{async: $a} = this;

		$a.on(net.event, 'status', ({status, lastOnline}) => {
			this.isOnline = status;
			this.lastOnlineDate = lastOnline;
		});

		$a.on(session.event, 'set', ({auth}) => this.isAuth = Boolean(auth));
		$a.on(session.event, 'clear', () => this.isAuth = false);
	}
}
