/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { createComponentDecorator, normalizeFunctionalParams } from 'core/component/decorators/helpers';

import type { ComponentAccessor } from 'core/component/interface';

import type { PartDecorator } from 'core/component/decorators/interface';

import type { DecoratorComputed } from 'core/component/decorators/computed/interface';

/**
 * Assigns meta-information to a computed field or an accessor within a component
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
	return createComponentDecorator(({meta}, accessorName, desc) => {
		if (desc == null) {
			return;
		}

		params = {...params};

		delete meta.accessors[accessorName];
		delete meta.computedFields[accessorName];

		let type: 'accessors' | 'computedFields' = 'accessors';

		if (
			params.cache === true ||
			params.cache === 'auto' ||
			params.cache === 'forever' ||
			params.cache !== false && (Object.isArray(params.dependencies) || accessorName in meta.computedFields)
		) {
			type = 'computedFields';
		}

		let accessor: ComponentAccessor = meta[type][accessorName] ?? {
			src: meta.componentName,
			cache: false
		};

		const needOverrideComputed = type === 'accessors' ?
			accessorName in meta.computedFields :
			!('cache' in params) && accessorName in meta.accessors;

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
				cache: type === 'computedFields' ? params.cache ?? true : false
			}, meta);
		}

		meta[type][accessorName] = accessor;

		if (params.dependencies != null && params.dependencies.length > 0) {
			meta.watchDependencies.set(accessorName, params.dependencies);
		}
	});
}
