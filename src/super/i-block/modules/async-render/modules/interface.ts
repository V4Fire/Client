/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { TaskFilter } from 'super/i-block/modules/async-render/interface';

export interface IterOptions {
	start?: number;
	perChunk?: number;
	filter?: TaskFilter;
}

export interface IterDescriptor {
	isAsync: boolean;

	readI: number;
	readTotal: number;
	readEls: unknown[];

	iterable: CanPromise<AnyIterable>;
	iterator: IterableIterator<unknown> | AsyncIterableIterator<unknown>;
}
