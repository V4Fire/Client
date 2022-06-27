/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as init from 'core/component/init';

import { forkMeta, ComponentMeta } from 'core/component/meta';
import { initProps } from 'core/component/prop';

import { initDynamicComponentLifeCycle } from 'core/component/functional/helpers';

import type { ComponentInterface } from 'core/component/interface';
import type { VirtualContextOptions } from 'core/component/functional/interface';

/**
 * Creates a virtual context for the passed functional component
 *
 * @param component - the component meta object
 * @param parent - the component parent
 * @param [props] - the component props
 * @param [slots] - the component slots
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

		for (let keys = Object.keys(props), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				normalizedKey = key.camelize(false),
				prop = props[key];

			if (normalizedKey in meta.props) {
				$props[normalizedKey] = prop;

			} else {
				if (isComponentEventHandler(key, prop)) {
					let
						event = key.slice('on'.length).camelize(false);

					const
						once = isOnceEvent.test(key);

					if (once) {
						event = event.replace(/Once$/, '');
					}

					handlers.push([event, once, prop]);
				}

				$attrs[key] = prop;
			}
		}
	}

	let
		$options;

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

	const virtualCtx = Object.cast<ComponentInterface['unsafe'] & Dictionary>({
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

	initProps(virtualCtx, {
		from: $props,
		store: virtualCtx,
		saveToStore: true
	});

	init.beforeCreateState(virtualCtx, meta, {
		addMethods: true,
		implementEventAPI: true
	});

	for (let i = 0; i < handlers.length; i++) {
		const
			[event, once, handler] = handlers[i];

		if (once) {
			virtualCtx.$once(event, handler);

		} else {
			virtualCtx.$on(event, handler);
		}
	}

	init.beforeDataCreateState(virtualCtx, {tieFields: true});
	return initDynamicComponentLifeCycle(virtualCtx);
}
