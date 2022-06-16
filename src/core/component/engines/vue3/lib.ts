/* eslint-disable prefer-spread */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import makeLazy from 'core/lazy';

import { createApp, Component } from 'vue';
import type { CreateAppFunction } from 'core/component/engines/interface';

const App = <CreateAppFunction>function App(component: Component & {el?: Element}, rootProps: Nullable<Dictionary>) {
	const
		app = Object.create(createApp(component, rootProps));

	if (component.el != null) {
		setImmediate(() => {
			app.mount(component.el);
		});
	}

	return app;
};

const Vue = makeLazy(
	App,

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

				const ctx = contexts.at(-1);
				return ctx?.component.apply(ctx, Object.cast(args));
			},

			directive: (contexts, ...args: any[]) => {
				if (args.length === 1) {
					contexts.forEach((ctx) => {
						ctx.directive.apply(ctx, Object.cast(args));
					});

					return;
				}

				const ctx = contexts.at(-1);
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

export default Vue;
