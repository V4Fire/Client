/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { WatchPath, ComponentAccessorCacheType } from 'core/component/interface';
import type { DecoratorFunctionalOptions } from 'core/component/decorators/interface/types';

export interface DecoratorComponentAccessor extends DecoratorFunctionalOptions {
	/**
	 * If true, the accessor value will be cached every time it read or changed.
	 * The option is set to true by default if also provided `dependencies` or the bound accessor matches by a name with
	 * another prop or field. If the options value is passed as `auto`, caching will be delegated to the used render
	 * engine.
	 */
	cache?: ComponentAccessorCacheType;

	/**
	 * If true, mutations of the accessor value can be watched
	 */
	watchable?: boolean;

	/**
	 * A list of dependencies for the accessor.
	 * The dependencies are needed to watch for changes of the accessor or to invalidate the cache.
	 *
	 * Also, when the accessor has a logically connected prop/field
	 * (by using a name convention "${property} -> ${property}Prop | ${property}Store"),
	 * we don't need to add additional dependencies.
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @field()
	 *   blaStore: number = 0;
	 *
	 *   @computed({cache: true, dependencies: ['blaStore']})
	 *   get bar(): number {
	 *     return this.blaStore * 2;
	 *   }
	 *
	 *   @computed({cache: true})
	 *   get bla(): number {
	 *     return blaStore * 3;
	 *   }
	 * }
	 * ```
	 */
	dependencies?: WatchPath[];
}
