/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import symbolGenerator from 'core/symbol';

import iBlock from 'super/i-block/i-block';
import Field from 'super/i-block/modules/field';
import Storage from 'super/i-block/modules/storage';
import Lazy from 'super/i-block/modules/lazy';
import Lfc from 'super/i-block/modules/lfc';

import { Event } from 'super/i-block/modules/event';
import { Hooks } from 'core/component';

const
	$$ = symbolGenerator();

export default class State {
	/**
	 * Current component hook
	 */
	get hook(): Hooks {
		return this.component.hook;
	}

	/**
	 * Component instance
	 */
	protected readonly component: iBlock;

	/**
	 * Component unique name
	 */
	protected get globalName(): CanUndef<string> {
		return this.component.globalName;
	}

	/**
	 * API for component field accessors
	 */
	protected get field(): Field {
		return this.component.field;
	}

	/**
	 * API for a component storage
	 */
	protected get storage(): Storage {
		return this.component.storage;
	}

	/**
	 * API for lazy operations
	 */
	protected get lazy(): Lazy {
		return this.component.lazy;
	}

	/**
	 * API for component life cycle helpers
	 */
	protected get lfc(): Lfc {
		return this.component.lfc;
	}

	/**
	 * Local event emitter
	 */
	protected get localEvent(): Event {
		// @ts-ignore
		return this.component.localEvent;
	}

	/**
	 * Async instance
	 */
	protected get async(): Async {
		// @ts-ignore
		return this.component.$async;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
	}

	/**
	 * Gets values from the specified object and saves it to the component state
	 * @param [obj]
	 */
	setState(obj?: Dictionary): void {
		if (!obj) {
			return;
		}

		for (let keys = Object.keys(obj), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = obj[key],
				p = key.split('.');

			if (p[0] === 'mods') {
				this.component.setMod(p[1], el);

			} else if (!Object.fastCompare(el, this.field.get(key))) {
				this.field.set(key, el);
			}
		}
	}

	/**
	 * Saves a component state to a storage
	 * @param [data] - advanced data
	 */
	async saveStateToStorage(data?: Dictionary): Promise<void> {
		if (!this.globalName) {
			return;
		}

		const
			c = this.component;

		// @ts-ignore
		data = c.syncStorageState(data, 'remote');
		// @ts-ignore
		this.setState(c.syncStorageState(data));

		await this.storage.set(data, '[[STORE]]');
		// @ts-ignore
		c.log('state:save:storage', this, data);
	}

	/**
	 * Initializes a component state from a storage
	 */
	async initStateFromStorage(): Promise<void> {
		if (!this.globalName) {
			return;
		}

		const
			key = $$.pendingLocalStore;

		if (this[key]) {
			return this[key];
		}

		const
			c = this.component,
			storeWatchers = {group: 'storeWatchers'};

		const {async: $a} = this;
		$a.clearAll(storeWatchers);

		return this[key] = $a.promise(async () => {
			const
				data = await this.storage.get('[[STORE]]');

			this.lfc.execCbAtTheRightTime(() => {
				const
					// @ts-ignore
					stateFields = c.syncStorageState(data);

				this.setState(
					stateFields
				);

				const sync = this.lazy.createLazyFn(() => this.saveStateToStorage(), {
					label: $$.syncLocalStore
				});

				if (stateFields) {
					for (let keys = Object.keys(stateFields), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							p = key.split('.');

						if (p[0] === 'mods') {
							$a.on(this.localEvent, `block.mod.*.${p[1]}.*`, sync, storeWatchers);

						} else {
							c.watch(key, (val, oldVal) => {
								if (!Object.fastCompare(val, oldVal)) {
									sync();
								}
							}, storeWatchers);
						}
					}
				}

				// @ts-ignore
				c.log('state:init:storage', this, stateFields);
			});

		}, {
			group: 'loadStore',
			join: true
		});
	}

	/**
	 * Resets a component storage state
	 */
	async resetStorageState(): Promise<boolean> {
		const
			c = this.component,
			// @ts-ignore
			stateFields = c.convertStateToStorageReset();

		this.setState(
			stateFields
		);

		await this.saveStateToStorage();
		// @ts-ignore
		c.log('state:reset:storage', this, stateFields);
		return true;
	}

	/**
	 * Saves a component state to a router
	 * @param [data] - advanced data
	 */
	async saveStateToRouter(data?: Dictionary): Promise<boolean> {
		const
			c = this.component;

		// @ts-ignore
		data = c.syncRouterState(data, 'remote');
		// @ts-ignore
		this.setState(c.syncRouterState(data));

		const
			r = c.$root.router;

		if (!c.isActivated || !r) {
			return false;
		}

		await r.push(null, {
			query: data
		});

		// @ts-ignore
		c.log('state:save:router', this, data);
		return true;
	}

	/**
	 * Initializes a component state from a router
	 */
	initStateFromRouter(): void {
		const
			c = this.component,
			routerWatchers = {group: 'routerWatchers'};

		const {async: $a} = this;
		$a.clearAll(routerWatchers);

		this.lfc.execCbAtTheRightTime(async () => {
			const
				r = c.$root;

			let
				{router} = r;

			if (!router) {
				await $a.promisifyOnce(r, 'initRouter', {
					label: $$.initStateFromRouter
				});

				({router} = r);
			}

			if (!router) {
				return;
			}

			const
				route = r.route || {},
				// @ts-ignore
				stateFields = c.syncRouterState(Object.assign(Object.create(route), route.params, route.query));

			this.setState(
				stateFields
			);

			if (c.syncRouterStoreOnInit) {
				const
					// @ts-ignore
					routerState = c.syncRouterState(stateFields, 'remote');

				if (Object.keys(routerState).length) {
					let
						modState;

					for (let keys = Object.keys(routerState), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							p = route.params,
							q = route.query;

						if ((!p || p[key] == null) && (!q || q[key] == null)) {
							modState = modState || {};
							modState[key] = routerState[key];
						}
					}

					if (modState) {
						router.replace(null, {query: modState});
					}
				}
			}

			const sync = this.lazy.createLazyFn(() => this.saveStateToRouter(), {
				label: $$.syncRouter
			});

			if (stateFields) {
				for (let keys = Object.keys(stateFields), i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						p = key.split('.');

					if (p[0] === 'mods') {
						$a.on(this.localEvent, `block.mod.*.${p[1]}.*`, sync, routerWatchers);

					} else {
						this.component.watch(key, (val, oldVal) => {
							if (!Object.fastCompare(val, oldVal)) {
								sync();
							}
						}, routerWatchers);
					}
				}
			}

			// @ts-ignore
			c.log('state:init:router', this, stateFields);

		}, {
			label: $$.initStateFromRouter
		});
	}

	/**
	 * Resets a component router state
	 */
	async resetRouterState(): Promise<boolean> {
		const
			c = this.component,
			// @ts-ignore
			stateFields = c.convertStateToRouterReset();

		this.setState(
			stateFields
		);

		const
			r = c.$root.router;

		if (!this.component.isActivated || !r) {
			return false;
		}

		await r.push(null);
		// @ts-ignore
		c.log('state:reset:router', this, stateFields);
		return true;
	}
}
