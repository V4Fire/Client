/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { createsAsyncSemaphore, resolveAfterDOMLoaded } from 'core/event';

import { set } from 'core/component/state';
import Component, {

	app,
	destroyApp,

	rootComponents,
	HydrationStore,

	ComponentElement

} from 'core/component';

import flags from 'core/init/flags';
import type { InitAppOptions } from 'core/init/interface';

const semaphore = createsAsyncSemaphore(createAppInitializer, ...flags);

export default semaphore;

if (SSR) {
	process.on('unhandledRejection', stderr);

} else {
	resolveAfterDOMLoaded()
		.then(async () => {
			const
				targetToMount = document.querySelector<HTMLElement>('[data-root-component]'),
				rootComponentName = targetToMount?.getAttribute('data-root-component');

			const initApp = (await import('core/init')).default;
			return initApp(rootComponentName, {targetToMount});
		})

		.catch(stderr);
}

function createAppInitializer() {
	return async (rootComponentName: Nullable<string>, opts: InitAppOptions = {}) => {
		let
			appId: CanUndef<string>;

		const
			state = Object.reject(opts, ['targetToMount']),
			rootComponentParams = await getRootComponentParams(rootComponentName);

		Object.entries(state).forEach(([key, value]) => {
			set(key, value);
		});

		if (SSR) {
			const
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				{renderToString} = require('vue/server-renderer');

			let
				{inject} = rootComponentParams;

			if (Object.isArray(inject)) {
				inject = Object.fromArray(inject, {value: (key) => key});
			}

			rootComponentParams.inject = {
				...inject,
				hydrationStore: 'hydrationStore'
			};

			const
				hydrationStore = new HydrationStore(),
				rootComponent = new Component(rootComponentParams);

			rootComponent.provide('hydrationStore', hydrationStore);
			app.context = rootComponent;

			try {
				const
					ssrContent = (await renderToString(rootComponent)).replace(/<\/?ssr-fragment>/g, ''),
					hydratedData = `<noframes id="hydration-store" style="display: none">${hydrationStore.toString()}</noframes>`;

				// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
				return ssrContent + hydratedData;

			} finally {
				if (appId != null) {
					destroyApp(appId);
				}
			}
		}

		const
			{targetToMount} = opts;

		if (targetToMount == null) {
			throw new ReferenceError('Application mount node not found');
		}

		app.context = new Component({
			...rootComponentParams,
			el: targetToMount
		});

		Object.defineProperty(app, 'component', {
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

			return {
				...rootComponentParams,

				data() {
					appId = this.componentId;
					return rootComponentParams.data?.call(this) ?? {};
				}
			};
		}
	};
}
