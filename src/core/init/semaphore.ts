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
	hydrationStore,

	ComponentElement

} from 'core/component';

import flags from 'core/init/flags';
import type { InitAppOptions } from 'core/init/interface';

const semaphore = createsAsyncSemaphore(createAppInitializer, ...flags);

export default semaphore;

if (!SSR) {
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
		const
			state = Object.reject(opts, ['targetToMount']),
			rootComponentParams = await getRootComponentParams(rootComponentName);

		Object.entries(state).forEach(([key, value]) => {
			set(key, value);
		});

		if (SSR) {
			let appId;

			const
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				{renderToString} = require('vue/server-renderer');

			const
				getData = rootComponentParams.data;

			rootComponentParams.data = function data() {
				appId = this.componentId;
				return getData?.call(this) ?? {};
			};

			const rootComponent = new Component(rootComponentParams);
			app.context = rootComponent;

			try {
				const
					ssrContent = (await renderToString(rootComponent)).replace(/<\/?ssr-fragment>/g, ''),
					hydratedData = `<noframes id="hydration-store" style="display: none">${hydrationStore.toString()}</noframes>`;

				// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
				return ssrContent + hydratedData;

			} finally {
				destroyApp(appId);
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
					return rootComponentParams.data?.call(this) ?? {};
				}
			};
		}
	};
}
