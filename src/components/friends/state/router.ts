/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import type State from 'components/friends/state/class';
import { set } from 'components/friends/state/helpers';

const
	$$ = symbolGenerator();

/**
 * Initializes the component state from the router state.
 * This method is required for `syncRouterState` to work.
 */
export function initFromRouter(this: State): boolean {
	const that = this;

	if (!this.needRouterSync) {
		return false;
	}

	const {
		ctx,
		async: $a
	} = this;

	const routerWatchers = {group: 'routerWatchers'};
	$a.clearAll(routerWatchers);

	void this.lfc.execCbAtTheRightTime(loadFromRouter, {label: $$.initFromRouter});
	return true;

	async function loadFromRouter() {
		const
			{r} = ctx;

		let
			{router} = r;

		if (router == null) {
			await ($a.promisifyOnce(r, 'initRouter', {
				label: $$.initFromRouter
			}));

			({router} = r);
		}

		if (router == null) {
			return;
		}

		const
			route = Object.mixin({deep: true, withProto: true}, {}, r.route),
			stateFields = ctx.syncRouterState(Object.assign(Object.create(route), route.params, route.query));

		set.call(that, stateFields);

		if (!SSR) {
			if (ctx.syncRouterStoreOnInit) {
				const
					stateForRouter = ctx.syncRouterState(stateFields, 'remote'),
					stateKeys = Object.keys(stateForRouter);

				if (stateKeys.length > 0) {
					let query: CanUndef<Dictionary>;

					stateKeys.forEach((key) => {
						const
							currentParams = route.params,
							currentQuery = route.query;

						const
							val = stateForRouter[key],
							currentVal = Object.get(currentParams, key) ?? Object.get(currentQuery, key);

						if (currentVal === undefined && val !== undefined) {
							query ??= {};
							query[key] = val;
						}
					});

					if (query != null) {
						await router.replace(null, {query});
					}
				}
			}

			const sync = $a.debounce(saveToRouter.bind(that), 0, {
				label: $$.syncRouter
			});

			if (Object.isDictionary(stateFields)) {
				Object.keys(stateFields).forEach((key) => {
					const
						p = key.split('.');

					if (p[0] === 'mods') {
						$a.on(ctx.localEmitter, `block.mod.*.${p[1]}.*`, sync, routerWatchers);

					} else {
						ctx.watch(key, (val: unknown, ...args: unknown[]) => {
							if (!Object.fastCompare(val, args[0])) {
								sync();
							}
						}, {
							...routerWatchers,
							deep: true
						});
					}
				});
			}
		}

		ctx.log('state:init:router', that, stateFields);
	}
}

/**
 * Saves the component state to the router state.
 * The data to save is taken from the component `syncRouterState` method.
 * Also, you can pass additional parameters.
 *
 * @param [data] - additional data to save
 */
export async function saveToRouter(this: State, data?: Dictionary): Promise<boolean> {
	if (!this.needRouterSync) {
		return false;
	}

	const {
		ctx,
		ctx: {r: {router}, routerStateUpdateMethod}
	} = this;

	data = ctx.syncRouterState(data, 'remote');
	set.call(this, ctx.syncRouterState(data));

	if (!ctx.isActivated || router == null) {
		return false;
	}

	await router[routerStateUpdateMethod](null, {query: data});
	ctx.log('state:save:router', this, data);

	return true;
}

/**
 * Resets the component router state.
 * The function takes the result of `convertStateToRouterReset` and maps it to the component.
 */
export function resetRouter(this: State): boolean {
	const {
		ctx,
		ctx: {r: {router}}
	} = this;

	const stateFields = ctx.convertStateToRouterReset();
	set.call(this, stateFields);

	if (!ctx.isActivated || router == null) {
		return false;
	}

	ctx.log('state:reset:router', this, stateFields);

	return true;
}
