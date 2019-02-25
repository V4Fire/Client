/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import Async, { AsyncOpts } from 'core/async';
import { Hooks, ComponentMeta } from 'core/component';
import { Statuses } from 'super/i-block/modules/interface';

export default class Life {
	/**
	 * Current component hook
	 */
	get hook(): Hooks {
		return this.component.hook;
	}

	/**
	 * iBlock instance
	 */
	protected readonly component: iBlock;

	/**
	 * Async instance
	 */
	protected get componentStatus(): Statuses {
		// @ts-ignore
		return this.component.status;
	}

	/**
	 * Async instance
	 */
	protected get async(): Async {
		// @ts-ignore
		return this.component.$async;
	}

	/**
	 * Component meta object
	 */
	protected get meta(): ComponentMeta {
		// @ts-ignore
		return this.component.meta;
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
				this.setMod(p[1], el);

			} else if (!Object.fastCompare(el, this.field.get(key))) {
				this.field.set(key, el);
			}
		}
	}

	/**
	 * Saves a component state to a local storage
	 * @param [data] - advanced data
	 */
	protected async saveStateToStorage(data?: Dictionary): Promise<void> {
		if (!this.globalName) {
			return;
		}

		data = this.convertStateToStorage(data, 'remote');
		this.setState(this.convertStateToStorage(data));

		await this.saveSettings(data, '[[STORE]]');
		this.log('state:save:storage', this, data);
	}

	/**
	 * Initializes a component state from a local storage
	 */
	protected async initStateFromStorage(): Promise<void> {
		if (!this.globalName) {
			return;
		}

		const
			key = $$.pendingLocalStore;

		if (this[key]) {
			return this[key];
		}

		const
			$a = this.async,
			storeWatchers = {group: 'storeWatchers'};

		$a.clearAll(
			storeWatchers
		);

		return this[key] = $a.promise(async () => {
			const
				data = await this.loadSettings('[[STORE]]');

			this.life.execCbAtTheRightTime(() => {
				const
					stateFields = this.convertStateToStorage(data);

				this.setState(
					stateFields
				);

				const sync = this.createDeferFn(() => this.saveStateToStorage(), {
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
							this.watch(key, (val, oldVal) => {
								if (!Object.fastCompare(val, oldVal)) {
									sync();
								}
							}, storeWatchers);
						}
					}
				}

				this.log('state:init:storage', this, stateFields);
			});

		}, {
			group: 'loadStore',
			join: true
		});
	}

	/**
	 * Resets a component storage state
	 */
	protected async resetStorageState(): Promise<boolean> {
		const
			stateFields = this.convertStateToStorageReset();

		this.setState(
			stateFields
		);

		await this.saveStateToStorage();
		this.log('state:reset:storage', this, stateFields);
		return true;
	}

	/**
	 * Saves a component state to a router
	 * @param [data] - advanced data
	 */
	protected async saveStateToRouter(data?: Dictionary): Promise<boolean> {
		data = this.convertStateToRouter(data, 'remote');
		this.setState(this.convertStateToRouter(data));

		const
			r = this.$root.router;

		if (!this.isActivated || !r) {
			return false;
		}

		await r.push(null, {
			query: data
		});

		this.log('state:save:router', this, data);
		return true;
	}

	/**
	 * Initializes a component state from a router
	 */
	protected initStateFromRouter(): void {
		const
			{async: $a} = this,
			routerWatchers = {group: 'routerWatchers'};

		$a.clearAll(
			routerWatchers
		);

		this.life.execCbAtTheRightTime(async () => {
			const
				r = this.$root;

			let
				{router} = r;

			if (!router) {
				await $a.promisifyOnce(this.$root, 'initRouter', {
					label: $$.initStateFromRouter
				});

				({router} = r);
			}

			if (!router) {
				return;
			}

			const
				route = r.route || {},
				stateFields = this.convertStateToRouter(Object.assign(Object.create(route), route.params, route.query));

			this.setState(
				stateFields
			);

			if (this.syncRouterStoreOnInit) {
				const
					routerState = this.convertStateToRouter(stateFields, 'remote');

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

			const sync = this.createDeferFn(() => this.saveStateToRouter(), {
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
						this.watch(key, (val, oldVal) => {
							if (!Object.fastCompare(val, oldVal)) {
								sync();
							}
						}, routerWatchers);
					}
				}
			}

			this.log('state:init:router', this, stateFields);

		}, {
			label: $$.initStateFromRouter
		});
	}

	/**
	 * Resets a component router state
	 */
	protected async resetRouterState(): Promise<boolean> {
		const
			stateFields = this.convertStateToRouterReset();

		this.setState(
			stateFields
		);

		const
			r = this.$root.router;

		if (!this.isActivated || !r) {
			return false;
		}

		await r.push(null);
		this.log('state:reset:router', this, stateFields);
		return true;
	}
}
