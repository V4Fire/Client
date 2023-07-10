/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentField } from 'core/component/interface';
import type { SortedFields } from 'core/component/field/interface';

/**
 * A cache for sorted component fields
 */
export const sortedFields = new WeakMap<Dictionary<ComponentField>, SortedFields>();
