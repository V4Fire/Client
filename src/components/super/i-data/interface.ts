/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { UnsafeIBlock } from 'components/super/i-block/i-block';
import type iData from 'components/super/i-data/i-data';

export * from 'components/friends/data-provider';
export * from 'components/traits/i-data-provider/i-data-provider';

export interface RetryRequestFn<T = unknown> {
	(): Promise<CanUndef<T>>;
}

export interface ComponentConverter<T = unknown, CTX extends iData = iData> {
	(value: unknown, ctx: CTX): T;
}

export interface CheckDBEqualityFn<T = unknown> {
	(value: CanUndef<T>, oldValue: CanUndef<T>): boolean;
}

export type CheckDBEquality<T = unknown> =
	boolean |
	CheckDBEqualityFn<T>;

export interface UnsafeIData<CTX extends iData = iData> extends UnsafeIBlock<CTX> {
	// @ts-ignore (access)
	dbStore: CTX['dbStore'];

	// @ts-ignore (access)
	saveDataToRootStore: CTX['saveDataToRootStore'];

	// @ts-ignore (access)
	convertDataToDB: CTX['convertDataToDB'];

	// @ts-ignore (access)
	convertDBToComponent: CTX['convertDBToComponent'];

	// @ts-ignore (access)
	initRemoteData: CTX['initRemoteData'];

	// @ts-ignore (access)
	syncRequestParamsWatcher: CTX['syncRequestParamsWatcher'];

	// @ts-ignore (access)
	syncDataProviderWatcher: CTX['syncDataProviderWatcher'];
}
