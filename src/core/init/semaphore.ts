/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { disposeLazy } from 'core/lazy';
import { createsAsyncSemaphore } from 'core/event';

import * as clientState from 'core/component/client-state';

import AppClass, {

	app as globalApp,
	destroyApp,

	rootComponents,

	HydrationStore,
	ComponentElement

} from 'core/component';

import flags from 'core/init/flags';

import type { InitAppParams, App } from 'core/init/interface';

/**
 * A factory for creating a semaphore for application initialization
 */
export default function createInitAppSemaphore(): (flag: string) => Promise<ReturnType<typeof createAppInitializer>> {
	return createsAsyncSemaphore(createAppInitializer, ...flags);
}

function createAppInitializer() {
	return async (
		rootComponentName: Nullable<string>,
		params: InitAppParams
	): Promise<App> => {
		const {
			appId,
			targetToMount
		} = params;

		const
			state = Object.reject(params, ['targetToMount', 'setup']),
			rootComponentParams = await getRootComponentParams(rootComponentName);

		params.setup?.(Object.cast(rootComponentParams));

		if (!SSR) {
			Object.entries(state).forEach(([key, value]) => {
				clientState.set(key, value);
			});
		}

		let {inject} = rootComponentParams;

		if (Object.isArray(inject)) {
			inject = Object.fromArray(inject, {value: (key) => key});
		}

		rootComponentParams.inject = {
			...inject,
			app: 'app'
		};

		if (SSR) {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const {renderToString} = require('vue/server-renderer');

			Object.assign(rootComponentParams.inject, {
				hydrationStore: 'hydrationStore'
			});

			const
				hydrationStore = new HydrationStore(),
				app = new AppClass(rootComponentParams);

			let
				oneTimeState: Nullable<typeof state> = state;

			Object.defineProperty(globalApp, 'state', {
				configurable: true,
				enumerable: true,
				get: () => {
					const state = oneTimeState;
					oneTimeState = null;
					return state;
				}
			});

			app.provide('app', {instance: app, state});
			app.provide('hydrationStore', hydrationStore);

			let
				ssrContent: string,
				hydratedData: string;

			try {
				ssrContent = (await renderToString(app)).replace(/<\/?ssr-fragment>/g, '');
				hydratedData = `<noframes id="hydration-store" style="display: none">${hydrationStore.toString()}</noframes>`;

				return {
					content: ssrContent + hydratedData,
					styles: (await Promise.all(hydrationStore.styles.values())).map((i) => i.default).join('')
				};

			} finally {
				ssrContent = '';
				hydratedData = '';

				try {
					destroyApp(appId);
				} catch {}

				try {
					disposeLazy(app);
				} catch {}
			}
		}

		if (targetToMount == null) {
			throw new ReferenceError('The application mount node was not found');
		}

		const app = new AppClass({
			...rootComponentParams,
			el: targetToMount
		});

		app.provide('app', {instance: app, state: clientState.default});

		Object.defineProperty(globalApp, 'context', {
			configurable: true,
			enumerable: true,
			get: () => app
		});

		Object.defineProperty(globalApp, 'component', {
			configurable: true,
			enumerable: true,
			get: () => document.querySelector<ComponentElement>('#root-component')?.component ?? null
		});

		Object.defineProperty(globalApp, 'state', {
			configurable: true,
			enumerable: true,
			get: () => clientState.default
		});

		return targetToMount;

		async function getRootComponentParams(
			rootComponentName: Nullable<string>
		): Promise<NonNullable<typeof rootComponents['component']>> {
			if (rootComponentName == null) {
				throw new Error("No name has been set for the application's root component");
			}

			const
				rootComponentParams = await rootComponents[rootComponentName];

			if (rootComponentParams == null) {
				throw new ReferenceError(`The root component with the specified name "${rootComponentName}" was not found`);
			}

			return Object.mixin(true, {}, rootComponentParams);
		}
	};
}
