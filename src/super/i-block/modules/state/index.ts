/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/state/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import iBlock from 'super/i-block/i-block';
import Friend from 'super/i-block/modules/friend';

export * from 'super/i-block/modules/state/interface';

export const
	$$ = symbolGenerator();

let
	baseSyncRouterState;

/**
 * Class provides some helper methods to initialize a component state
 */
export default class State extends Friend {
	/** @see [[iBlock.hook]] */
	get hook(): this['CTX']['hook'] {
		return this.ctx.hook;
	}

	/**
	 * True if needed synchronization with a router
	 */
	get needRouterSync(): boolean {
		return baseSyncRouterState !== this.instance.syncRouterState;
	}

	/** @see [[iBlock.globalName]] */
	protected get globalName(): CanUndef<string> {
		return this.ctx.globalName;
	}

	/** @see [[iBlock.instance]] */
	protected get instance(): this['CTX']['instance'] {
		// @ts-ignore (access)
		baseSyncRouterState = baseSyncRouterState || iBlock.prototype.syncRouterState;
		return this.ctx.instance;
	}

	/**
	 * Retrieves object values and saves it to a state of the current component
	 * @param data
	 */
	set(data: Nullable<Dictionary>): boolean {
		if (!data) {
			return true;
		}

		for (let keys = Object.keys(data), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = data[key],
				p = key.split('.');

			if (p[0] === 'mods') {
				this.ctx.setMod(p[1], el);

			} else if (!Object.fastCompare(el, this.field.get(key))) {
				this.field.set(key, el);
			}
		}

		return false;
	}

	/**
	 * Saves a state of the current component to a local storage
	 * @param [data] - additional data to save
	 */
	async saveToStorage(data?: Dictionary): Promise<boolean> {
		//#if runtime has core/kv-storage

		if (!this.globalName) {
			return false;
		}

		const
			{ctx} = this;

		data = ctx.syncStorageState(data, 'remote');
		this.set(ctx.syncStorageState(data));

		await this.storage.set(data, '[[STORE]]');
		ctx.log('state:save:storage', this, data);

		return true;

		//#endif
	}

	/**
	 * Initializes a state of the current component from a local storage
	 */
	async initFromStorage(): Promise<boolean> {
		//#if runtime has core/kv-storage

		if (!this.globalName) {
			return false;
		}

		const
			key = $$.pendingLocalStore;

		if (this[key]) {
			return this[key];
		}

		const
			{ctx} = this;

		const
			storeWatchers = {group: 'storeWatchers'},
			$a = this.async.clearAll(storeWatchers);

		return this[key] = $a.promise(async () => {
			const
				data = await this.storage.get('[[STORE]]');

			this.lfc.execCbAtTheRightTime(() => {
				const
					stateFields = ctx.syncStorageState(data);

				this.set(
					stateFields
				);

				const sync = $a.debounce(this.saveToStorage, 0, {
					label: $$.syncLocalStorage
				});

				if (stateFields) {
					for (let keys = Object.keys(stateFields), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							p = key.split('.');

						if (p[0] === 'mods') {
							$a.on(this.localEmitter, `block.mod.*.${p[1]}.*`, sync, storeWatchers);

						} else {
							// tslint:disable-next-line:only-arrow-functions
							ctx.watch(key, function (val: unknown): void {
								if (!Object.fastCompare(val, arguments[1])) {
									sync();
								}
							}, {
								...storeWatchers,
								deep: true
							});
						}
					}
				}

				ctx.log('state:init:storage', this, stateFields);
			});

			return true;

		}, {
			group: 'loadStore',
			join: true
		});

		//#endif
	}

	/**
	 * Resets a storage state of the current component
	 */
	async resetStorage(): Promise<boolean> {
		//#if runtime has core/kv-storage

		if (!this.globalName) {
			return false;
		}

		const
			{ctx} = this;

		const
			stateFields = ctx.convertStateToStorageReset();

		this.set(
			stateFields
		);

		await this.saveToStorage();
		ctx.log('state:reset:storage', this, stateFields);
		return true;

		//#endif
	}

	/**
	 * Saves a state of the current component to a router
	 * @param [data] - additional data to save
	 */
	async saveToRouter(data?: Dictionary): Promise<boolean> {
		//#if runtime has bRouter

		if (!this.needRouterSync) {
			return false;
		}

		const
			{ctx} = this,
			{router} = ctx.r;

		data = ctx.syncRouterState(data, 'remote');
		this.set(ctx.syncRouterState(data));

		if (!ctx.isActivated || !router) {
			return false;
		}

		await router.push(null, {
			query: data
		});

		ctx.log('state:save:router', this, data);
		return true;

		//#endif
	}

	/**
	 * Initializes a state of the current component from a router
	 */
	initFromRouter(): boolean {
		//#if runtime has bRouter

		if (!this.needRouterSync) {
			return false;
		}

		const
			{ctx} = this;

		const
			routerWatchers = {group: 'routerWatchers'},
			$a = this.async.clearAll(routerWatchers);

		this.lfc.execCbAtTheRightTime(async () => {
			const
				{r} = ctx;

			let
				{router} = r;

			if (!router) {
				await (<Promise<unknown>>$a.promisifyOnce(r, 'initRouter', {
					label: $$.initFromRouter
				}));

				({router} = r);
			}

			if (!router) {
				return;
			}

			const
				route = r.route || <NonNullable<typeof r.route>>{},
				stateFields = ctx.syncRouterState(Object.assign(Object.create(route), route.params, route.query));

			this.set(
				stateFields
			);

			if (ctx.syncRouterStoreOnInit) {
				const
					stateForRouter = ctx.syncRouterState(stateFields, 'remote'),
					stateKeys = Object.keys(stateForRouter);

				if (stateKeys.length) {
					let
						query;

					for (let i = 0; i < stateKeys.length; i++) {
						const
							key = stateKeys[i];

						const
							currentParams = route.params,
							currentQuery = route.query;

						const
							val = stateForRouter[key],
							currentVal = currentParams?.[key] || currentQuery?.[key];

						if (currentVal === undefined && val !== undefined) {
							query = query || {};
							query[key] = val;
						}
					}

					if (query) {
						router.replace(null, {query});
					}
				}
			}

			const sync = $a.debounce(this.saveToRouter, 0, {
				label: $$.syncRouter
			});

			if (stateFields) {
				for (let keys = Object.keys(stateFields), i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						p = key.split('.');

					if (p[0] === 'mods') {
						$a.on(this.localEmitter, `block.mod.*.${p[1]}.*`, sync, routerWatchers);

					} else {
						// tslint:disable-next-line:only-arrow-functions
						ctx.watch(key, function (val: unknown): void {
							if (!Object.fastCompare(val, arguments[1])) {
								sync();
							}
						}, {
							...routerWatchers,
							deep: true
						});
					}
				}
			}

			ctx.log('state:init:router', this, stateFields);

		}, {
			label: $$.initFromRouter
		});

		return true;

		//#endif
	}

	/**
	 * Resets a router state of the current component
	 */
	async resetRouter(): Promise<boolean> {
		//#if runtime has bRouter

		if (!this.needRouterSync) {
			return false;
		}

		const
			{ctx} = this,
			{router} = ctx.r;

		const
			stateFields = ctx.convertStateToRouterReset();

		this.set(
			stateFields
		);

		if (!ctx.isActivated || !router) {
			return false;
		}

		await router.push(null);
		ctx.log('state:reset:router', this, stateFields);
		return true;

		//#endif
	}
}
