/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/ref/README.md]]
 * @packageDocumentation
 */

import { ComponentEngine, VNode } from 'core/component/engines';
import { REF_ID } from 'core/component/directives/ref/const';

import type { ComponentElement } from 'core/component/interface';
import type { DirectiveOptions } from 'core/component/directives/ref/interface';

export * from 'core/component/directives/ref/const';
export * from 'core/component/directives/ref/interface';

ComponentEngine.directive('ref', {
	mounted: updateRef,
	updated: updateRef
});

function updateRef(el: Element, {arg: ref, instance}: DirectiveOptions, vnode: VNode): void {
	const
		ctx = vnode.virtualContext?.unsafe;

	if (ref == null || instance == null || ctx == null) {
		return;
	}

	const
		refs = ctx.$refs,
		getRefVal = () => instance.$refs[`${ref}:${ctx.componentId}`];

	if (vnode.virtualComponent != null) {
		const
			refVal = getRefVal();

		if (Object.isArray(refVal)) {
			refVal[REF_ID] ??= Math.random();

			let
				virtualRefs = <CanUndef<unknown[]>>refs[ref];

			if (virtualRefs == null || virtualRefs[REF_ID] !== refVal[REF_ID]) {
				Object.defineProperty(refs, ref, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: []
				});

				virtualRefs = <unknown[]>refs[ref];
				virtualRefs[REF_ID] = refVal[REF_ID];
			}

			const
				refIndex = refVal.indexOf(el);

			Object.defineProperty(virtualRefs, refIndex, {
				configurable: true,
				enumerable: true,
				get: () => {
					const refVal = (<ComponentElement[]>getRefVal())[refIndex];
					return refVal.component ?? refVal;
				}
			});

		} else {
			Object.defineProperty(refs, ref, {
				configurable: true,
				enumerable: true,
				get: () => {
					const refVal = <ComponentElement>getRefVal();
					return refVal.component ?? refVal;
				}
			});
		}

	} else {
		Object.defineProperty(refs, ref, {
			configurable: true,
			enumerable: true,
			get: getRefVal
		});
	}

	ctx.$emit(`[[REF:${ref}]]`, refs[ref]);
}
