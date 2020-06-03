/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { transitionOptions, systemRouteParams, canParseStr } from 'base/b-router/const';

import {

	Route,

	AnyRoute,
	PlainRoute,
	PurifiedRoute,
	WatchableRoute,

	TransitionOptions,
	RouteParamsFilter

} from 'base/b-router/interface';

/**
 * Normalizes the specified transitions options and returns a new object
 *
 * @param data
 *
 * @example
 * ```js
 * // {query: {bla: 1}, params: {id: null}}
 * normalizeTransitionOpts({query: {bla: '1'}, params: {id: 'null'}});
 * ```
 */
export function normalizeTransitionOpts(data: Nullable<TransitionOptions>): CanUndef<TransitionOptions> {
	if (!data) {
		return;
	}

	let
		isEmptyData = true;

	for (let keys = Object.keys(data), i = 0; i < keys.length; i++) {
		if (Object.size(data[keys[i]])) {
			isEmptyData = false;
			break;
		}
	}

	if (isEmptyData) {
		return;
	}

	const
		normalizedData = Object.mixin<Dictionary>(true, {}, Object.select(data, transitionOptions));

	const normalizer = (data, key?, parent?) => {
		if (!data) {
			return;
		}

		if (Object.isArray(data)) {
			for (let i = 0; i < data.length; i++) {
				normalizer(data[i], i, data);
			}

			return;
		}

		if (Object.isDictionary(data)) {
			for (let keys = Object.keys(data), i = 0; i < keys.length; i++) {
				const key = keys[i];
				normalizer(data[key], key, data);
			}

			return;
		}

		if (parent) {
			const
				strVal = String(data);

			if (canParseStr.test(strVal)) {
				parent[key] = Object.isString(data) ? Object.parse(data) : data;

			} else {
				const numVal = Number(data);
				parent[key] = isNaN(data) || strVal !== String(numVal) ? strVal : numVal;
			}
		}
	};

	normalizer(normalizedData.params);
	normalizer(normalizedData.query);

	return normalizedData;
}

/**
 * Returns a common representation of the specified route
 * @param params
 */
export function purifyRoute<T extends AnyRoute>(params: Nullable<T>): PurifiedRoute<T> {
	if (params) {
		return convertRouteToPlainObject(params, (el, key) => key[0] !== '_' && !systemRouteParams[key]);
	}

	return {};
}

/**
 * Returns a blank route object from the specified
 * @param route
 */
export function getBlankRouteFrom(route: Nullable<AnyRoute | TransitionOptions>): PurifiedRoute<AnyRoute> {
	return Object.mixin(true, route ? purifyRoute(<AnyRoute>route) : undefined, {
		query: {},
		params: {},
		meta: {}
	});
}

/**
 * Converts the specified route object to a plain object and returns it
 *
 * @param route
 * @param [filter] - filter predicate
 */
export function convertRouteToPlainObject<FILTER extends string, T extends AnyRoute>(
	route: Nullable<T>,
	filter?: RouteParamsFilter
): PlainRoute<T, FILTER> {
	const
		res = {};

	if (!route) {
		return res;
	}

	for (const key in route) {
		const
			el = route[key];

		if (filter && !filter(el, key)) {
			continue;
		}

		if (!Object.isFunction(el)) {
			(<Dictionary>res)[key] = el;
		}
	}

	return res;
}

/**
 * Converts the specified route object to a plain object and returns it.
 * All properties from a prototype are skipped.
 *
 * @param route
 */
export function convertRouteToPlainObjectWithoutProto<T extends AnyRoute>(route: Nullable<T>): PlainRoute<T> {
	const
		res = {};

	if (route) {
		for (let keys = Object.keys(route).sort(), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = route[key];

			if (key[0] === '_') {
				continue;
			}

			if (!Object.isFunction(el)) {
				res[key] = el;
			}
		}
	}

	return res;
}

/**
 * Returns a plain object based on the specified route without non-watchable properties
 * @param route
 */
export function getParamsFromRouteThatNeedWatch<T extends AnyRoute>(route: Nullable<T>): WatchableRoute<T> {
	return convertRouteToPlainObject<'meta', T>(route, (el, key) => key !== 'meta' && key[0] !== '_');
}

/**
 * Fills route parameters from the root object (if it needed)
 *
 * @param route
 * @param root - link to the root object
 */
export function fillRouteParams(route: Route, root: iBlock): void {
	const
		rootAPI = root.unsafe;

	const {
		meta,
		query,
		params
	} = route;

	if (meta.paramsFromQuery !== false) {
		const
			paramsFromRoot = meta.paramsFromRoot !== false,
			rootState = rootAPI.syncRouterState(undefined, 'remoteCheck');

		if (paramsFromRoot) {
			const
				rootField = rootAPI.meta.fields,
				rootSystemFields = rootAPI.meta.systemFields;

			for (let keys = Object.keys(rootState), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					rootVal = rootState[key];

				if (query[key] === undefined) {
					const
						field = rootField[key] || rootSystemFields[key];

					if (field?.meta['router.query']) {
						query[key] = rootVal;

					} else {
						delete query[key];
					}
				}
			}
		}

		for (let o = route.pathParams, i = 0; i < o.length; i++) {
			const
				param = o[i],
				name = param.name,
				queryVal = query[name];

			if (params[name] === undefined) {
				if (queryVal !== undefined && new RegExp(param.pattern).test(String(queryVal))) {
					params[name] = queryVal;
					delete query[name];

				} else if (paramsFromRoot) {
					params[name] = rootState[name];
				}

			} else {
				delete query[name];
			}
		}
	}
}
