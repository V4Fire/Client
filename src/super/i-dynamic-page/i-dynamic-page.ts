/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import Then from 'core/then';

import symbolGenerator from 'core/symbol';
import iData, { component, hook } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

export interface OnFilterChange {
	mixin?: Dictionary;
	modifier?(value: any): any;
}

export const
	$$ = symbolGenerator();

@component()
export default class iDynamicPage<T extends Dictionary = Dictionary> extends iData<T> {
	/** @override */
	readonly needReInit: boolean = true;

	/**
	 * Activates the page
	 * @param [state] - state object
	 */
	@hook('beforeDataCreate')
	@hook('activated')
	activate(state: Dictionary = this): void {
		this.initStateFromRouter(state);
		this.execCbAfterCreated(() => {
			const watcher = this.$watch('$root.pageInfo', () => {
				this.initStateFromRouter();
			}, {deep: true});

			this.async.worker(watcher, {
				label: $$.activate,
				group: 'routerStateWatchers'
			});
		});
	}

	/**
	 * Deactivates the page
	 */
	@hook('deactivated')
	deactivate(): void {
		this.async
			.off({group: 'routerStateWatchers'})
			.off({group: 'routerWatchers'});

		$C(this.convertStateToRouter()).forEach((el, key) => this[key] = undefined);
	}

	/**
	 * Returns an object with default component fields for hash
	 * @param [obj]
	 */
	protected convertStateToRouter(obj?: Dictionary | undefined): Dictionary {
		return {...obj};
	}

	/**
	 * Saves the component state a router
	 * @param obj - state object
	 */
	protected async saveStateToRouter(obj: Dictionary): Promise<boolean> {
		obj = this.convertStateToRouter(obj);

		$C(obj).forEach((el, key) => {
			if (el) {
				this[key] = el;
			}
		});

		const
			r = this.$root.router;

		if (!this.isActivated || !r) {
			return false;
		}

		await r.push(null, {
			query: obj
		});

		return true;
	}

	/**
	 * Resets the component router state
	 */
	protected async resetRouterState(): Promise<boolean> {
		$C(this.convertStateToRouter()).forEach((el, key) => this[key] = undefined);

		const
			r = this.$root.router;

		if (!this.isActivated || !r) {
			return false;
		}

		await r.push(null);
		return true;
	}

	/**
	 * Initialized the component state from the location
	 * @param [state] - state object
	 */
	protected initStateFromRouter(state: Dictionary = this): void {
		const
			{async: $a} = this,
			routerWatchers = {group: 'routerWatchers'};

		$a.clearAll(
			routerWatchers
		);

		const init = () => {
			const
				p = this.$root.pageInfo,
				stateFields = this.convertStateToRouter();

			if (p && p.query) {
				this.setState(Object.select(p.query, Object.keys(stateFields)), state);
			}

			const sync = () => {
				$a.setTimeout(this.saveStateToRouter, 0.2.second(), {
					label: $$.syncRouter
				});
			};

			$C(this.convertStateToRouter()).forEach((el, key) => {
				const
					p = key.split('.');

				if (p[0] === 'mods') {
					$a.on(this.localEvent, `block.mod.*.${p[0]}.*`, sync, routerWatchers);

				} else {
					this.execCbAfterCreated(() => {
						const watcher = this.$watch(key, (val, oldVal) => {
							if (!Object.fastCompare(val, oldVal)) {
								sync();
							}
						});

						$a.worker(watcher, routerWatchers);
					});
				}
			});
		};

		if (this.hook === 'beforeDataCreate') {
			init();

		} else {
			const
				done = this.waitStatus('beforeReady', init);

			if (Then.isThenable(done)) {
				done.catch(stderr);
			}
		}
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();

		const
			i = this.instance;

		this.convertStateToRouter = i.convertStateToRouter.bind(this);
		this.initStateFromRouter = i.initStateFromRouter.bind(this);
	}

	/**
	 * Handler: filter change
	 *
	 * @param args - tuple:
	 *   1) el - event component
	 *   2) value - component value
	 *   3) [defKey] - default state key
	 *
	 * @param [key] - state key
	 * @param [e] - additional event parameters:
	 *   *) [mixin] - filter mixin
	 *   *) [modifier] - value modifier
	 */
	protected async onFilterChange(args: IArguments, key: string = args[2], e: OnFilterChange = {}): Promise<void> {
		let
			hashData = {};

		if (key) {
			const value = args[1];
			hashData = {[key]: e.modifier ? e.modifier(value) : value};
		}

		await this.accumulateTmpObj({...e.mixin, ...hashData}, $$.state, this.saveStateToRouter);
	}
}
