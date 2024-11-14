/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { createComponentDecorator3, normalizeFunctionalParams } from 'core/component/decorators/helpers';

import type { ComponentAccessor } from 'core/component/interface';

import type { PartDecorator } from 'core/component/decorators/interface';

import type { DecoratorComputed } from 'core/component/decorators/computed/interface';

/**
 * Assigns metainformation to a computed field or an accessor within a component
 *
 * @decorator
 * @param [params] - an object with accessor parameters
 *
 * @example
 * ```typescript
 * import iBlock, { component, computed } from 'components/super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @computed({cache: true})
 *   get hashCode(): number {
 *     return Math.random();
 *   }
 * }
 * ```
 */
export function computed(params?: DecoratorComputed): PartDecorator {
	return createComponentDecorator3(({meta}, accessorName) => {
		params = {...params};

		if (meta.props[accessorName] != null) {
			meta.props[accessorName] = undefined;
			delete meta.component.props[accessorName];
		}

		if (meta.fields[accessorName] != null) {
			meta.fields[accessorName] = undefined;
		}

		if (meta.systemFields[accessorName] != null) {
			meta.systemFields[accessorName] = undefined;
		}

		let cluster: 'accessors' | 'computedFields' = 'accessors';

		if (
			params.cache === true ||
			params.cache === 'auto' ||
			params.cache === 'forever' ||
			params.cache !== false && (Object.isArray(params.dependencies) || meta.computedFields[accessorName] != null)
		) {
			cluster = 'computedFields';
		}

		const store = meta[cluster];

		let accessor: ComponentAccessor = store[accessorName] ?? {
			src: meta.componentName,
			cache: false
		};

		const needOverrideComputed = cluster === 'accessors' ?
			meta.computedFields[accessorName] != null :
			!('cache' in params) && meta.accessors[accessorName] != null;

		if (needOverrideComputed) {
			const computed = meta.computedFields[accessorName];

			accessor = normalizeFunctionalParams({
				...computed,
				...params,
				src: computed?.src ?? accessor.src,
				cache: false
			}, meta);

		} else {
			accessor = normalizeFunctionalParams({
				...accessor,
				...params,
				cache: cluster === 'computedFields' ? params.cache ?? true : false
			}, meta);
		}

		meta[cluster === 'computedFields' ? 'accessors' : 'computedFields'][accessorName] = undefined;

		store[accessorName] = accessor;

		if (params.dependencies != null && params.dependencies.length > 0) {
			meta.watchDependencies.set(accessorName, params.dependencies);
		}
	});
}
