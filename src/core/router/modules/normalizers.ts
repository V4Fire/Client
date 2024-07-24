/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { canParseStr, systemRouteParams, transitionOptions } from 'core/router/const';

import type {

	TransitionOptions,
	RouteParamsFilter,

	AnyRoute,
	PurifiedRoute,
	PlainRoute,
	WatchableRoute

} from 'core/router/interface';

/**
 * Normalizes the specified transition options and returns a new object
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
	if (data == null) {
		return;
	}

	let isEmptyData = true;

	for (let keys = Object.keys(data), i = 0; i < keys.length; i++) {
		if (Object.size(data[keys[i]]) > 0) {
			isEmptyData = false;
			break;
		}
	}

	if (isEmptyData) {
		return;
	}

	const normalizedData = Object.mixin<Dictionary>(true, {}, Object.select(data, transitionOptions));

	normalize(normalizedData.params);
	normalize(normalizedData.query);

	return normalizedData;

	function normalize(data: unknown, key?: PropertyKey, parent?: Dictionary | unknown[]) {
		if (data == null) {
			return;
		}

		if (Object.isArray(data)) {
			data.forEach((val, i) => normalize(val, i, data));
			return;
		}

		if (Object.isDictionary(data)) {
			Object.entries(data).forEach(([key, val]) => normalize(val, key, data));
			return;
		}

		if (key != null && parent != null) {
			const strVal = String(data);

			if (canParseStr.test(strVal)) {
				parent[key] = Object.isString(data) ? Object.parse(data) : data;

			} else {
				const numVal = Number(data);
				parent[key] = isNaN(<number>data) || strVal !== String(numVal) ? strVal : numVal;
			}
		}
	}
}

/**
 * Returns a common representation of the specified route
 * @param params
 */
export function purifyRoute<T extends AnyRoute>(params: Nullable<T>): PurifiedRoute<T> {
	if (params == null) {
		return {};
	}

	return convertRouteToPlainObject(params, (_, key) => !key.startsWith('_') && systemRouteParams[key] !== true);
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
 * @param [filter] - a filter predicate
 */
export function convertRouteToPlainObject<T extends AnyRoute, FILTER extends string>(
	route: Nullable<T>,
	filter?: RouteParamsFilter
): PlainRoute<T, FILTER> {
	const res = {};

	if (route == null) {
		return res;
	}

	// eslint-disable-next-line guard-for-in
	for (const key in route) {
		const el = route[key];

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
 * All properties from the prototype are skipped.
 *
 * @param route
 */
export function convertRouteToPlainObjectWithoutProto<T extends AnyRoute>(route: Nullable<T>): PlainRoute<T> {
	const res = {};

	if (route == null) {
		return res;
	}

	Object.keys(route).sort().forEach((key) => {
		const el = route[key];

		if (key.startsWith('_')) {
			return;
		}

		if (!Object.isFunction(el)) {
			res[key] = el;
		}
	});

	return res;
}

/**
 * Returns a plain object based on the specified route without non-comparing parameters
 * @param route
 */
export function getComparableRouteParams<T extends AnyRoute>(route: Nullable<T>): WatchableRoute<T> {
	return convertRouteToPlainObject<T, 'meta'>(route, (el, key) => key !== 'meta' && !key.startsWith('_'));
}
