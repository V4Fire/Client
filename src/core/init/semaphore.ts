/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { createsAsyncSemaphore } from 'core/event';
import { disposeLazy } from 'core/lazy';

import remoteState, { set } from 'core/component/client-state';

import AppClass, {

	app as globalApp,
	destroyApp,

	rootComponents,

	HydrationStore,
	ComponentElement

} from 'core/component';

import flags from 'core/init/flags';

import type { InitAppOptions, App } from 'core/init/interface';

/**
 * A factory for creating a semaphore over application initialization
 */
export default function createInitAppSemaphore(): (flag: string) => Promise<ReturnType<typeof createAppInitializer>> {
	return createsAsyncSemaphore(createAppInitializer, ...flags);
}

function createAppInitializer() {
	return async (
		rootComponentName: Nullable<string>,
		opts: InitAppOptions
	): Promise<App> => {
		const
			appProcessId = opts.appProcessId ?? Object.fastHash(Math.random()),
			state = Object.reject(opts, ['targetToMount', 'setup']),
			rootComponentParams = await getRootComponentParams(rootComponentName);

		opts.setup?.(Object.cast(rootComponentParams));

		Object.entries(state).forEach(([key, value]) => {
			set(key, value);
		});

		let
			{inject} = rootComponentParams;

		if (Object.isArray(inject)) {
			inject = Object.fromArray(inject, {value: (key) => key});
		}

		rootComponentParams.inject = {
			...inject,
			app: 'app',
			appProcessId: 'appProcessId'
		};

		if (SSR) {
			const
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				{renderToString} = require('vue/server-renderer');

			Object.assign(rootComponentParams.inject, {
				hydrationStore: 'hydrationStore',
				ssrState: 'ssrState'
			});

			const
				hydrationStore = new HydrationStore(),
				app = new AppClass(rootComponentParams);

			app.provide('app', app);
			app.provide('appProcessId', appProcessId);
			app.provide('hydrationStore', hydrationStore);
			app.provide('ssrState', Object.fastClone(remoteState));

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
					destroyApp(appProcessId);
				} catch {}

				try {
					disposeLazy(app);
				} catch {}
			}
		}

		const
			{targetToMount} = opts;

		if (targetToMount == null) {
			throw new ReferenceError('Application mount node was not found');
		}

		const app = new AppClass({
			...rootComponentParams,
			el: targetToMount
		});

		app.provide('app', app);
		app.provide('appProcessId', appProcessId);

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

		return targetToMount;

		async function getRootComponentParams(
			rootComponentName: Nullable<string>
		): Promise<NonNullable<typeof rootComponents['component']>> {
			if (rootComponentName == null) {
				throw new Error('No name has been set for the root component of the application');
			}

			const
				rootComponentParams = await rootComponents[rootComponentName];

			if (rootComponentParams == null) {
				throw new ReferenceError(`The root component with the specified name "${rootComponentName}" was not found`);
			}

			return Object.fastClone(rootComponentParams);
		}
	};
}
