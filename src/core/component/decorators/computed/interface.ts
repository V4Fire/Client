/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { WatchPath, ComponentAccessorCacheType } from 'core/component/interface';
import type { DecoratorFunctionalOptions } from 'core/component/decorators/interface';

export interface DecoratorComputed extends DecoratorFunctionalOptions {
	/**
	 * If set to true, the accessor value will be cached after the first touch.
	 *
	 * Note that to support the propagation of the getter's effect to the template,
	 * caching never works until the component has been rendered for the first time.
	 * If you want to ensure that the cached value is never invalidated, you should set the parameter to `'forever'`.
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
	 *   @computed({cache: 'forever'})
	 *   get hashCode(): number {
	 *     return Math.random();
	 *   }
	 *
	 *   @field()
	 *   i: number = 0;
	 *
	 *   // The value is cached after the first touch, but the cache can be reset if the fields used internally change.
	 *   // The caching logic in this mode is handled by the library being used, such as Vue.
	 *   @computed({cache: 'auto'})
	 *   get iWrapper(): number {
	 *     return this.i;
	 *   }
	 *
	 *   // The value is cached after the first touch, but the cache can be reset if the fields used internally change.
	 *   // The caching logic in this case is carried out using the V4Fire library.
	 *   @computed({dependencies: ['i']})
	 *   get iWrapper2(): number {
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
