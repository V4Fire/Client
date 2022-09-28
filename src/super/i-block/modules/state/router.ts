/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import type State from 'super/i-block/modules/state/class';
import { set } from 'super/i-block/modules/state/helpers';

const
	$$ = symbolGenerator();

/**
 * Saves the component state to the router state
 * @param [data] - additional data to save
 */
export async function saveToRouter(this: State, data?: Dictionary): Promise<boolean> {
	if (!this.needRouterSync) {
		return false;
	}

	const {
		ctx,
		ctx: {r: {router}}
	} = this;

	data = ctx.syncRouterState(data, 'remote');
	set.call(this, ctx.syncRouterState(data));

	if (!ctx.isActivated || !router) {
		return false;
	}

	await router.push(null, {query: data});
	ctx.log('state:save:router', this, data);

	return true;
}

/**
 * Initializes the component state from the router state
 */
export function initFromRouter(this: State): boolean {
	if (!this.needRouterSync) {
		return false;
	}

	const {
		ctx,
		async: $a
	} = this;

	const routerWatchers = {group: 'routerWatchers'};
	$a.clearAll(routerWatchers);

	void this.lfc.execCbAtTheRightTime(async () => {
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

		set.call(this, stateFields);

		if (ctx.syncRouterStoreOnInit) {
			const
				stateForRouter = ctx.syncRouterState(stateFields, 'remote'),
				stateKeys = Object.keys(stateForRouter);

			if (stateKeys.length > 0) {
				let
					query;

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

		const sync = $a.debounce(saveToRouter.bind(this), 0, {
			label: $$.syncRouter
		});

		if (Object.isDictionary(stateFields)) {
			Object.keys(stateFields).forEach((key) => {
				const
					p = key.split('.');

				if (p[0] === 'mods') {
					$a.on(this.localEmitter, `block.mod.*.${p[1]}.*`, sync, routerWatchers);

				} else {
					ctx.watch(key, (val, ...args) => {
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

		ctx.log('state:init:router', this, stateFields);

	}, {
		label: $$.initFromRouter
	});

	return true;
}

/**
 * Resets the component router state
 */
export async function resetRouter(this: State): Promise<boolean> {
	const {
		ctx,
		ctx: {r: {router}}
	} = this;

	const stateFields = ctx.convertStateToRouterReset();
	set.call(this, stateFields);

	if (!ctx.isActivated || router == null) {
		return false;
	}

	await router.push(null);
	ctx.log('state:reset:router', this, stateFields);

	return true;
}
