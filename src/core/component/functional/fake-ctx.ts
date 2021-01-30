/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as init from 'core/component/construct';

import { forkMeta } from 'core/component/meta';
import { initProps } from 'core/component/prop';

import { RenderContext } from 'core/component/render';
import { CreateElement } from 'core/component/engines';

import { $$, componentOpts } from 'core/component/functional/const';
import { destroyComponent } from 'core/component/functional/helpers';

import { FunctionalCtx } from 'core/component/interface';
import { CreateFakeCtxOptions } from 'core/component/functional/interface';

export * from 'core/component/functional/interface';

/**
 * Creates the fake context for a functional component is based on the specified parameters
 *
 * @param createElement - function to create VNode element
 * @param renderCtx - render context from VNode
 * @param baseCtx - component context that provided core functional
 * @param [opts] - additional options
 */
export function createFakeCtx<T extends object = FunctionalCtx>(
	createElement: CreateElement,
	renderCtx: Partial<RenderContext>,
	baseCtx: FunctionalCtx,
	opts: CreateFakeCtxOptions
): T {
	const
		fakeCtx = Object.create(baseCtx),
		meta = forkMeta(fakeCtx.meta);

	const
		{component} = meta,
		{parent, children, data: dataOpts} = renderCtx;

	let
		$options;

	if (parent?.$options) {
		const {
			filters = {},
			directives = {},
			components = {}
		} = parent.$options;

		$options = {
			filters: Object.create(filters),
			directives: Object.create(directives),
			components: Object.create(components)
		};

	} else {
		$options = {
			filters: {},
			directives: {},
			components: {}
		};
	}

	if (Object.isDictionary(component)) {
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

	fakeCtx._self = fakeCtx;
	fakeCtx._renderProxy = fakeCtx;
	fakeCtx._staticTrees = [];

	fakeCtx.unsafe = fakeCtx;
	fakeCtx.children = Object.isArray(children) ? children : [];

	fakeCtx.$parent = parent;
	fakeCtx.$root = renderCtx.$root ?? parent?.$root;

	fakeCtx.$options = $options;
	fakeCtx.$props = renderCtx.props ?? {};
	fakeCtx.$attrs = dataOpts?.attrs ?? {};
	fakeCtx.$listeners = renderCtx.listeners ?? dataOpts?.on ?? {};
	fakeCtx.$refs = {};

	fakeCtx.$slots = {
		default: Object.size(children) > 0 ? children : undefined,
		...renderCtx.slots?.()
	};

	fakeCtx.$scopedSlots = {
		...Object.isFunction(renderCtx.scopedSlots) ? renderCtx.scopedSlots() : renderCtx.scopedSlots
	};

	fakeCtx.$createElement = createElement.bind(fakeCtx);
	fakeCtx.$destroy = () => destroyComponent(fakeCtx);

	fakeCtx.$nextTick = (cb?: Function) => {
		const
			{$async: $a} = fakeCtx;

		if (cb) {
			$a.setImmediate(cb);
			return;
		}

		return $a.nextTick();
	};

	fakeCtx.$forceUpdate = () => {
		// eslint-disable-next-line @typescript-eslint/unbound-method
		if (!Object.isFunction(parent?.$forceUpdate)) {
			return;
		}

		fakeCtx.$async.setImmediate(() => parent!.$forceUpdate(), {
			label: $$.forceUpdate
		});
	};

	if (fakeCtx.$root == null) {
		fakeCtx.$root = fakeCtx;
	}

	initProps(fakeCtx, {
		from: renderCtx.props,
		store: fakeCtx,
		saveToStore: opts.initProps
	});

	init.beforeCreateState(fakeCtx, meta, {
		addMethods: true,
		implementEventAPI: true
	});

	init.beforeDataCreateState(fakeCtx, {tieFields: true});

	return fakeCtx;
}
