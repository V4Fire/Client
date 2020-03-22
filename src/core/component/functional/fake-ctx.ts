/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch from 'core/object/watch';
import * as init from 'core/component/construct';

import { forkMeta, callMethodFromComponent } from 'core/component/meta';
import { runHook } from 'core/component/hook';

import { CreateElement } from 'core/component/engines';
import { RenderContext } from 'core/component/render';

import { $$, componentOpts, destroyHooks, destroyCheckHooks } from 'core/component/functional/const';
import { ComponentInterface, FunctionalCtx } from 'core/component/interface';
import { CreateFakeCtxOptions } from 'core/component/functional/interface';

export * from 'core/component/functional/interface';

/**
 * Creates a fake context for a functional component that is based on the specified parameters
 *
 * @param createElement - function to create VNode element
 * @param renderCtx - render context from VNode
 * @param baseCtx - component context that provided core functional
 * @param [opts] - additional options
 */
export function createFakeCtx<T extends object = FunctionalCtx>(
	createElement: CreateElement,
	renderCtx: RenderContext,
	baseCtx: FunctionalCtx,
	opts: CreateFakeCtxOptions
): T {
	// Create a new context object that is based on baseCtx

	const
		fakeCtx = Object.create(baseCtx),
		meta = forkMeta(fakeCtx.meta),
		p = <ComponentInterface>Any(renderCtx.parent);

	const
		{component} = meta,
		{children, data: dataOpts} = renderCtx;

	let
		$options;

	if (p?.$options) {
		const {
			filters = {},
			directives = {},
			components = {}
		} = p.$options;

		$options = {
			filters: Object.create(filters),
			directives: Object.create(directives),
			components: Object.create(components)
		};

	} else {
		$options = {filters: {}, directives: {}, components: {}};
	}

	if (component) {
		Object.assign($options, Object.reject(component, componentOpts));
		Object.assign($options.filters, component.filters);
		Object.assign($options.directives, component.directives);
		Object.assign($options.components, component.components);
	}

	if (renderCtx.$options) {
		const o = renderCtx.$options;
		Object.assign($options, Object.reject(o, componentOpts));
		Object.assign($options.filters, o.filters);
		Object.assign($options.directives, o.directives);
		Object.assign($options.components, o.components);
	}

	// Add base methods and properties
	Object.assign(fakeCtx, renderCtx.props, {
		children: children || [],

		_self: fakeCtx,
		_renderProxy: fakeCtx,
		_staticTrees: [],

		$createElement: createElement.bind(fakeCtx),

		$parent: p,
		$root: renderCtx.$root || p && p.$root,
		$options,

		$props: renderCtx.props || {},
		$attrs: dataOpts && dataOpts.attrs || {},
		$listeners: renderCtx.listeners || dataOpts && dataOpts.on || {},

		$refs: {},
		$destroyedHooks: {},

		$slots: {
			default: children && children.length ? children : undefined,
			...renderCtx.slots && renderCtx.slots()
		},

		$scopedSlots: {
			...Object.isFunction(renderCtx.scopedSlots) ? renderCtx.scopedSlots() : renderCtx.scopedSlots
		},

		$destroy(): void {
			if (this.componentStatus === 'destroyed') {
				return;
			}

			this.$async.clearAll().locked = true;

			// We need to clear all handlers that we bound to a parent component of the current

			const
				parent = this.$normalParent;

			if (parent) {
				const
					{hooks} = parent.meta,
					{$destroyedHooks} = this;

				for (let o = destroyCheckHooks, i = 0; i < o.length; i++) {
					const
						hook = o[i];

					if ($destroyedHooks[hook]) {
						continue;
					}

					const
						filteredHooks = <unknown[]>[];

					let
						hasChanges = false;

					for (let list = hooks[hook], j = 0; j < list.length; j++) {
						const
							el = list[j];

						if (el.fn[$$.self] !== this) {
							filteredHooks.push(el);

						} else {
							hasChanges = true;
						}
					}

					if (hasChanges) {
						hooks[hook] = filteredHooks;
					}

					$destroyedHooks[hook] = true;
				}
			}

			for (let o = destroyHooks, i = 0; i < o.length; i++) {
				const
					key = o[i];

				runHook(key, this).then(() => {
					callMethodFromComponent(this, key);
				}, stderr);
			}
		},

		$nextTick(cb?: () => void): Promise<void> | void {
			const
				{$async: $a} = this;

			if (cb) {
				$a.setImmediate(cb);
				return;
			}

			return $a.nextTick();
		},

		$forceUpdate(): void {
			if (!Object.isFunction(p.$forceUpdate)) {
				return;
			}

			this.$async.setImmediate(() => p.$forceUpdate(), {
				label: $$.forceUpdate
			});
		}
	});

	if (!fakeCtx.$root) {
		fakeCtx.$root = fakeCtx;
	}

	init.beforeCreateState(fakeCtx, meta);
	init.beforeDataCreateState(fakeCtx);

	for (let o = [fakeCtx.$systemFields, fakeCtx.$fields], i = 0; i < o.length; i++) {
		watch(o[i], {deep: true, collapse: true, immediate: true}, (v, o, i) => {
			fakeCtx.$modifiedFields[String(i.path[0])] = true;
		});
	}

	return fakeCtx;
}
