/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as init from 'core/component/init';

import { saveRawComponentContext } from 'core/component/context';
import { forkMeta, ComponentMeta } from 'core/component/meta';
import { initProps } from 'core/component/prop';

import { initDynamicComponentLifeCycle } from 'core/component/functional/helpers';

import type { ComponentInterface } from 'core/component/interface';
import type { VirtualContextOptions } from 'core/component/functional/interface';

/**
 * Creates a virtual context for the passed functional component
 *
 * @param component - the component metaobject
 * @param [opts] - the component options
 * @param [opts.parent] - the component parent
 * @param [opts.props] - the component props
 * @param [opts.slots] - the component slots
 */
export function createVirtualContext(
	component: ComponentMeta,
	{parent, props = {}, slots = {}}: VirtualContextOptions
): ComponentInterface {
	const meta = forkMeta(component);
	meta.params.functional = true;

	const
		$props = {},
		$attrs = {};

	const
		handlers: Array<[string, boolean, Function]> = [];

	if (props != null) {
		const
			isOnceEvent = /.Once(.|$)/,
			isDOMEvent = /.(?:Passive|Capture)(.|$)/;

		const isComponentEventHandler = (event: string, handler: unknown): handler is Function => {
			if (!event.startsWith('on') || isDOMEvent.test(event) || !Object.isFunction(handler)) {
				return false;
			}

			return handler.name !== 'withModifiers' && handler.name !== 'withKeys';
		};

		Object.entries(props).forEach(([name, prop]) => {
			const
				normalizedName = name.camelize(false);

			if (normalizedName in meta.props) {
				$props[normalizedName] = prop;

			} else {
				if (isComponentEventHandler(name, prop)) {
					let
						event = name.slice('on'.length).camelize(false);

					const
						once = isOnceEvent.test(name);

					if (once) {
						event = event.replace(/Once$/, '');
					}

					handlers.push([event, once, prop]);
				}

				$attrs[name] = prop;
			}
		});
	}

	let
		$options: {directives: Dictionary; components: Dictionary};

	if ('$options' in parent) {
		const {
			directives = {},
			components = {}
		} = parent.$options;

		$options = {
			directives: Object.create(directives),
			components: Object.create(components)
		};

	} else {
		$options = {
			directives: {},
			components: {}
		};
	}

	const virtualCtx = Object.cast<ComponentInterface & Dictionary>({
		componentName: meta.componentName,

		meta,
		instance: Object.cast(meta.instance),

		$props,
		$attrs,

		$refs: {},
		$slots: slots ?? {},

		$parent: parent,
		$root: parent.$root,

		$options,
		$renderEngine: parent.$renderEngine,

		$nextTick(cb?: AnyFunction): CanVoid<Promise<void>> {
			if (cb != null) {
				setImmediate(cb);
				return;
			}

			return Promise.resolve();
		},

		$forceUpdate(): void {
			return undefined;
		}
	});

	const unsafe = Object.cast<ComponentInterface['unsafe']>(virtualCtx);

	// When extending the context of the original component (e.g., Vue), to avoid conflicts,
	// we create an object with the original context in the prototype: `V4Context<__proto__: OriginalContext>`.
	// However, for functional components, this approach is redundant and can lead to memory leaks.
	// Instead, we simply assign a reference to the raw context, which points to the original context.
	saveRawComponentContext(virtualCtx, virtualCtx);

	initProps(virtualCtx, {
		from: $props,
		store: virtualCtx,
		saveToStore: true
	});

	init.beforeCreateState(virtualCtx, meta, {
		addMethods: true,
		implementEventAPI: true
	});

	handlers.forEach(([event, once, handler]) => {
		if (once) {
			unsafe.$once(event, handler);

		} else {
			unsafe.$on(event, handler);
		}
	});

	init.beforeDataCreateState(virtualCtx);
	return initDynamicComponentLifeCycle(virtualCtx);
}
