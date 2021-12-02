/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AbstractCache } from '@src/core/cache';
import type ProviderDataItem from '@src/super/i-static-page/modules/provider-data-store/item';

export type ItemKey = string | number | symbol;

export type ProviderDataStore<T = unknown> = Overwrite<
	AbstractCache<ProviderDataItem<T>>,
	{set<T>(key: string, value: T): ProviderDataItem<T>}
>;
