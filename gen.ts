/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type { StructureWrappers } from 'core/object/watch/wrap/interface';
const { isArray } = Object;
const c = isArray(d);
export const structureWrappers = createDict_prelude({
    weakMap: {
        is: isWeakMap_prelude.bind(Object)
    },
    weakSet: {
        is: isWeakSet_prelude.bind(Object)
    },
    map: {
        is: isMap_prelude.bind(Object)
    }
});
