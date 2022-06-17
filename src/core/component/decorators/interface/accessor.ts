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
	 * If true, the accessor value will be cached after the first touch.
	 * The option is set to true by default if also provided `dependencies` or the bound accessor matches
	 * by the name with another prop or field. If the option value is passed as `auto`, caching will be delegated to
	 * the used component library.
	 */
	cache?: ComponentAccessorCacheType;

	/**
	 * If true, the accessor returns a link to another watchable object
	 */
	watchable?: boolean;

	/**
	 * A list of dependencies for the accessor.
	 * The dependencies are needed to watch for the accessor mutations or to invalidate its cache.
	 *
	 * Also, when the accessor has a logically connected prop/field
	 * (by using the name convention "${property} -> ${property}Prop | ${property}Store"),
	 * we don't need to add additional dependencies.
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class bExample extends iBlock {
	 *   @field()
	 *   blaStore: number = 0;
	 *
	 *   @computed({cache: true, dependencies: ['blaStore']})
	 *   get bar(): number {
	 *     return this.blaStore * 2;
	 *   }
	 *
	 *   get bla(): number {
	 *     return blaStore * 3;
	 *   }
	 * }
	 * ```
	 */
	dependencies?: WatchPath[];
}
