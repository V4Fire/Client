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

import { getComponentContext } from 'core/component/context';
import { getDirectiveContext } from 'core/component/directives/helpers';

import { REF_ID } from 'core/component/directives/ref/const';

import type { ComponentElement } from 'core/component/interface';
import type { DirectiveOptions } from 'core/component/directives/ref/interface';

export * from 'core/component/directives/ref/const';
export * from 'core/component/directives/ref/interface';

//#if runtime has dummyComponents
import('core/component/directives/ref/test/b-directives-ref-dummy');
//#endif

ComponentEngine.directive('ref', {
	mounted: updateRef,
	updated: updateRef
});

function updateRef(el: Element | ComponentElement, opts: DirectiveOptions, vnode: VNode): void {
	const {value, instance} = opts;

	let ctx = getDirectiveContext(opts, vnode);
	ctx = Object.cast(ctx?.meta.params.functional === true ? ctx : instance);

	if (
		value == null ||
		Object.isFunction(value) ||
		instance == null ||
		ctx == null
	) {
		return;
	}

	if (!Object.isExtensible(ctx.$refs)) {
		Object.defineProperty(ctx, '$refs', {
			enumerable: true,
			configurable: true,
			writable: true,
			value: {...ctx.$refs}
		});
	}

	const
		refName = String(value),
		refs = ctx.$refs;

	if (vnode.virtualComponent != null) {
		const refVal = getRefVal();

		if (Object.isArray(refVal)) {
			refVal[REF_ID] ??= Math.random();

			let virtualRefs = <CanUndef<unknown[]>>refs[refName];

			if (virtualRefs == null || virtualRefs[REF_ID] !== refVal[REF_ID]) {
				Object.defineProperty(refs, refName, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: []
				});

				virtualRefs = <unknown[]>refs[refName];
				virtualRefs[REF_ID] = refVal[REF_ID];
			}

			const refIndex = refVal.indexOf(el);
			defineRef(virtualRefs, refIndex, () => resolveRefVal(refIndex));

		} else {
			defineRef(refs, refName, resolveRefVal);
		}

	} else {
		defineRef(refs, refName, resolveRefVal);
	}

	ctx.$nextTick(() => ctx!.$emit(`[[REF:${refName}]]`, refs[refName]));

	function defineRef(refs: object, refName: PropertyKey, getter: () => unknown) {
		Object.defineProperty(refs, refName, {
			configurable: true,
			enumerable: true,
			get: getter
		});
	}

	function resolveRefVal(key?: PropertyKey) {
		const refVal = getRefVal();

		let ref: unknown;

		if (Object.isArray(refVal)) {
			if (key != null) {
				ref = refVal[key];

			} else {
				return refVal.map(resolve);
			}

		} else {
			ref = refVal;
		}

		return resolve(ref);

		function resolve(ref: unknown) {
			if (ref == null) {
				return ref;
			}

			if (vnode.virtualComponent != null) {
				return (<ComponentElement>ref).component ?? ref;
			}

			return !(ref instanceof Node) ? getComponentContext(Object.cast(ref)) : ref;
		}
	}

	function getRefVal() {
		const
			resolvedRefName = ctx!.$resolveRef(refName),
			refVal = instance!.$refs[resolvedRefName];

		if (refVal != null) {
			return refVal;
		}

		if (Object.isArray(vnode.ref)) {
			return vnode.ref.map(({i: {refs}}) => refs[resolvedRefName]);
		}

		return vnode.ref?.i.refs[resolvedRefName];
	}
}
