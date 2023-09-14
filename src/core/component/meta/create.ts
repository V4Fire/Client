/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { getComponentMods } from 'core/component/reflect';
import { getComponentContext } from 'core/component/context';
import { inheritMeta } from 'core/component/meta/inherit';

import type { ComponentMeta, ComponentConstructorInfo } from 'core/component/interface';

/**
 * Creates a component metaobject based on the information from its constructor, and then returns this object
 * @param component - information obtained from the component constructor using the `getInfoFromConstructor` function
 */
export function createMeta(component: ComponentConstructorInfo): ComponentMeta {
	const meta: ComponentMeta = {
		name: component.name,
		componentName: component.componentName,

		parentMeta: component.parentMeta,
		constructor: component.constructor,

		instance: {},
		params: component.params,

		props: {},
		mods: getComponentMods(component),

		fields: {},
		tiedFields: {},
		systemFields: {},
		computedFields: {},

		methods: {},
		accessors: {},
		watchers: {},

		watchDependencies: new Map(),
		watchPropDependencies: new Map(),

		hooks: {
			beforeRuntime: [],
			beforeCreate: [],
			beforeDataCreate: [],
			'after:beforeDataCreate': [],
			'before:created': [],
			created: [],
			beforeMount: [],
			'before:mounted': [],
			mounted: [],
			beforeUpdate: [],
			updated: [],
			activated: [],
			deactivated: [],
			beforeDestroy: [],
			destroyed: [],
			renderTracked: [],
			renderTriggered: [],
			errorCaptured: []
		},

		component: {
			name: component.name,

			mods: {},
			props: {},

			computed: {},
			methods: {},

			render() {
				throw new ReferenceError(`The render function for the component "${component.componentName}" is not specified`);
			}
		}
	};

	const
		cache = new WeakMap();

	meta.component[SSR ? 'ssrRender' : 'render'] = Object.cast((ctx: object, ...args: unknown[]) => {
		const
			unsafe = getComponentContext(ctx);

		if (cache.has(ctx)) {
			return cache.get(ctx)();
		}

		const
			render = meta.methods.render!.fn.call(unsafe, unsafe, ...args);

		if (!Object.isFunction(render)) {
			return render;
		}

		cache.set(ctx, render);
		return render();
	});

	if (component.parentMeta) {
		inheritMeta(meta, component.parentMeta);
	}

	return meta;
}
