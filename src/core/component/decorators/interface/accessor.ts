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
	 * If set to true, the accessor value will be cached after the first touch.
	 *
	 * The option is set to true by default if it also provided `dependencies` or the bound accessor matches
	 * by the name with another prop or field.
	 *
	 * If the option value is passed as `auto` caching will be delegated to the used component library.
	 *
	 * Also, when an accessor has a logically related prop/field (using the naming convention
	 * "${property} → ${property}Prop | ${property}Store") we don't need to add additional dependencies.
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, field, computed } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   // The value is cached after the first touch and will never be reset
	 *   @computed({cache: true})
	 *   get hashCode(): number {
	 *     return Math.random();
	 *   }
	 *
	 *   @field()
	 *   i: number = 0;
	 *
	 *   // The value is cached after the first touch, but the cache can be reset if the fields used internally change
	 *   @computed({cache: 'auto'})
	 *   get iWrapper(): number {
	 *     return this.i;
	 *   }
	 * }
	 * ```
	 */
	cache?: ComponentAccessorCacheType;

	/**
	 * If set to true, the accessor returns a link to another watchable object.
	 * This option allows you to mount external watchable objects to the component.
	 *
	 * @example
	 * ```typescript
	 * import watch from 'core/object/watch';
	 * import iBlock, { component, computed } from 'components/super/i-block/i-block';
	 *
	 * const {proxy: state} = watch({
	 *   a: 1,
	 *   b: {
	 *     c: 2
	 *   }
	 * });
	 *
	 * setTimeout(() => {
	 *   state.b.c++;
	 * }, 500);
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @computed({watchable: true})
	 *   get state(): typeof state {
	 *     return state;
	 *   }
	 *
	 *   mounted() {
	 *     this.watch('state', {deep: true}, (value, oldValue) => {
	 *       console.log(value, oldValue);
	 *     });
	 *   }
	 * }
	 * ```
	 */
	watchable?: boolean;

	/**
	 * A list of dependencies for the accessor.
	 * The dependencies are necessary to watch for the accessor mutations or to invalidate its cache.
	 *
	 * Also, when an accessor has a logically related prop/field (using the naming convention
	 * "${property} → ${property}Prop | ${property}Store") we don't need to add additional dependencies.
	 *
	 * @example
	 * ```typescript
	 * import iBlock, {component, field, computed} from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @field()
	 *   blaStore: number = 0;
	 *
	 *   @computed({cache: true, dependencies: ['blaStore']})
	 *   get bar(): number {
	 *     return this.blaStore * 2;
	 *   }
	 * }
	 * ```
	 */
	dependencies?: WatchPath[];
}
