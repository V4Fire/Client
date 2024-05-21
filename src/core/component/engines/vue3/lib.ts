/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable prefer-spread */

import { makeLazy } from 'core/lazy';

import { createApp, createSSRApp, defineAsyncComponent, App, Component } from 'vue';
import type { CreateAppFunction } from 'core/component/engines/interface';

let
	ssrContext = SSR || HYDRATION;

const NewApp = <CreateAppFunction>function App(component: Component & {el?: Element}, rootProps: Nullable<Dictionary>) {
	const app = Object.create((ssrContext ? createSSRApp : createApp)(component, rootProps));

	// Application hydration is done only once during initialization
	if (HYDRATION) {
		ssrContext = false;
	}

	if (component.el != null) {
		setImmediate(() => {
			app.mount(component.el);
		});
	}

	return app;
};

const Vue = makeLazy(
	NewApp,

	{
		use: Function,

		component: Function,
		directive: Function,

		mixin: Function,
		provide: Function,
		version: '',

		mount: Function,
		unmount: Function,

		config: {
			performance: false,

			errorHandler: Function,
			warnHandler: Function,

			compilerOptions: {},
			globalProperties: {},
			optionMergeStrategies: {}
		}
	},

	{
		call: {
			component: (contexts, ...args) => {
				if (args.length === 1) {
					contexts.forEach((ctx) => {
						ctx.component.apply(ctx, Object.cast(args));
					});

					return;
				}

				const ctx = contexts[contexts.length - 1];
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				return ctx?.component.apply(ctx, Object.cast(args));
			},

			directive: (contexts, ...args: any[]) => {
				if (args.length === 1) {
					contexts.forEach((ctx) => {
						ctx.directive.apply(ctx, Object.cast(args));
					});

					return;
				}

				const ctx = contexts[contexts.length - 1];
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				return ctx?.directive.apply(ctx, Object.cast(args));
			},

			mixin: (contexts, ...args) => {
				contexts.forEach((ctx) => {
					ctx.mixin.apply(ctx, Object.cast(args));
				});
			},

			provide: (contexts, ...args) => {
				contexts.forEach((ctx) => {
					ctx.provide.apply(ctx, Object.cast(args));
				});
			}
		}
	}
);

const staticComponent = Vue.component.length > 0 ? Vue.component : null;

Vue.component = Object.cast(
	function component(this: App, name: string, component?: Component): CanUndef<Component> | App {
		const
			ctx = Object.getPrototypeOf(this),
			originalComponent = staticComponent ?? ctx.component;

		if (originalComponent == null) {
			throw new ReferenceError("The function to register components isn't found");
		}

		if (component == null) {
			return originalComponent.call(ctx, name);
		}

		if (Object.isPromise(component)) {
			const promise = component;
			component = defineAsyncComponent(Object.cast(() => promise));
		}

		return originalComponent.call(ctx, name, component);
	}
);

export default Vue;
