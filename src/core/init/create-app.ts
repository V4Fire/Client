/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { disposeLazy } from 'core/lazy';

import AppClass, {

	app as globalApp,
	destroyApp,

	rootComponents,

	State,
	ComponentElement

} from 'core/component';

import type { CreateAppOptions, App } from 'core/init/interface';

/**
 * Creates an instance of the application with the specified root component and environment
 *
 * @param rootComponentName - the name of the created root component
 * @param opts - application creation options
 * @param state - the global application state
 */
export async function createApp(
	rootComponentName: Nullable<string>,
	opts: CreateAppOptions,
	state: State
): Promise<App> {
	const rootComponentParams = await getRootComponentParams(rootComponentName);
	opts.setup?.(Object.cast(rootComponentParams));

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
		const {renderToString} = require('assets/lib/server-renderer');

		const
			app = new AppClass(rootComponentParams);

		Object.defineProperty(globalApp, 'state', {
			configurable: true,
			enumerable: true,
			get: () => {
				delete globalApp.state;
				return state;
			}
		});

		app.provide('app', {context: app, state});

		let
			ssrContent: string,
			hydratedData: string;

		try {
			ssrContent = (await renderToString(app)).replace(/<\/?ssr-fragment>/g, '');
			hydratedData = `<noframes id="hydration-store" style="display: none">${state.hydrationStore.toString()}</noframes>`;

			return {
				state,
				content: ssrContent + hydratedData,
				styles: (await Promise.all(state.hydrationStore.styles.values())).map((i) => i.default).join('')
			};

		} finally {
			try {
				destroyApp(state.appProcessId);
			} catch {}

			try {
				disposeLazy(app);
			} catch {}

			ssrContent = '';
			hydratedData = '';

			setTimeout(() => {
				state.async.clearAll().locked = true;
			}, Math.random() * 50);
		}
	}

	if (opts.targetToMount == null) {
		throw new ReferenceError('The application mount node was not found');
	}

	const app = new AppClass({
		...rootComponentParams,
		el: opts.targetToMount
	});

	app.provide('app', {context: app, state});

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
		get: () => state
	});

	return opts.targetToMount;

	async function getRootComponentParams(
		rootComponentName: Nullable<string>
	): Promise<NonNullable<typeof rootComponents['component']>> {
		if (rootComponentName == null) {
			throw new Error("No name has been set for the application's root component");
		}

		const rootComponentParams = await rootComponents[rootComponentName];

		if (rootComponentParams == null) {
			throw new ReferenceError(`The root component with the specified name "${rootComponentName}" was not found`);
		}

		if (SSR) {
			return {...rootComponentParams};
		}

		return rootComponentParams;
	}
}
