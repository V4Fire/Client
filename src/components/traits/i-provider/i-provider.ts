/* eslint-disable @typescript-eslint/no-unused-vars-experimental */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/traits/i-provider/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';

import type { ProviderOptions } from 'core/data';
import type { ModsDecl } from 'core/component';

import type Data from 'components/friends/data';
import iProgress from 'components/traits/i-progress/i-progress';
import type iBlock from 'components/super/i-block/i-block';

import type { DataProvider, RequestParams } from 'components/traits/i-provider/interface';

export * from 'components/traits/i-provider/interface';

export const
	$$ = symbolGenerator();

export default abstract class iProvider implements iProgress {
	/**
	 * The component data provider.
	 * A provider can be specified in several ways: by its name, by its constructor,
	 * or simply by passing in an instance of the provider.
	 *
	 * @example
	 * ```
	 * < b-example :dataProvider = 'myProvider'
	 * < b-example :dataProvider = require('providers/my-provider').default
	 * < b-example :dataProvider = myProvider
	 * ```
	 */
	dataProvider?: DataProvider;

	/**
	 * Additional data source initialization options.
	 * This parameter is used when the provider is specified by name or constructor.
	 *
	 * @example
	 * ```
	 * < b-example :dataProvider = 'myProvider' | :dataProviderOptions = {socket: true}
	 * ```
	 */
	dataProviderOptions?: ProviderOptions;

	/**
	 * External request parameters.
	 * The object keys are the names of the methods of the data provider.
	 * Parameters associated with provider methods will automatically be added to the call as default parameters.
	 *
	 * This option is useful for providing some query options from the parent component.
	 *
	 * @example
	 * ```
	 * < b-select :dataProvider = 'Cities' | :request = {get: {text: searchValue}}
	 *
	 * // Also, you can provide additional parameters to request method
	 * < b-select :dataProvider = 'Cities' | :request = {get: [{text: searchValue}, {cacheStrategy: 'never'}]}
	 * ```
	 */
	request?: RequestParams;

	/**
	 * If true, all requests to the data provider are suspended till you manually resolve them.
	 * This option is used when you want to lazy load components. For instance, you can only load components in
	 * the viewport.
	 *
	 * @example
	 * ```
	 * < b-select :dataProvider = 'Cities' | :suspendRequests = true
	 * ```
	 */
	suspendRequests?: boolean | Function;

	/**
	 * Request parameters for the data provider.
	 * The object keys are the names of the methods of the data provider.
	 * Parameters associated with provider methods will automatically be added to the call as default parameters.
	 *
	 * To create logic when the data provider automatically reloads the data if some properties have been changed,
	 * you need to use `sync.object`.
	 *
	 * @example
	 * ```typescript
	 * import iData, { component, system } from 'components/super/i-data/i-data';
	 *
	 * @component()
	 * class bExample extends iData {
	 *   @system()
	 *   i: number = 0;
	 *
	 *   // {get: {step: 0}, upd: {i: 0}, del: {i: '0'}}
	 *   @system((ctx) => ({
	 *     ...ctx.sync.link('get', [
	 *       ['step', 'i']
	 *     ]),
	 *
	 *     ...ctx.sync.link('upd', [
	 *       ['i']
	 *     ]),
	 *
	 *     ...ctx.sync.link('del', [
	 *       ['i', String]
	 *     ])
	 *   }))
	 *
	 *   protected readonly requestParams!: RequestParams;
	 * }
	 * ```
	 */
	requestParams: RequestParams = {get: {}};

	/**
	 * An instance of the component data provider
	 */
	data?: Data;

	/**
	 * The trait modifiers
	 */
	static readonly mods: ModsDecl = {
		...iProgress.mods
	};

	/** @see [[iProvider.waitPermissionToRequest]] */
	static waitPermissionToRequest: AddSelf<iProvider['waitPermissionToRequest'], iBlock & iProvider> = (component) => {
		if (component.suspendRequests === false) {
			return SyncPromise.resolve(true);
		}

		return component.unsafe.async.promise(() => new Promise((resolve) => {
			component.suspendRequests = () => {
				resolve(true);
				component.suspendRequests = false;
			};

		}), {
			label: $$.waitPermissionToRequest,
			join: true
		});
	};

	/**
	 * Initializes modifier event listeners for the specified component
	 *
	 * @emits `progressStart()`
	 * @emits `progressEnd()`
	 *
	 * @param component
	 */
	static initModEvents<T extends iBlock>(component: T): void {
		iProgress.initModEvents(component);
	}

	/**
	 * Returns a promise that will be resolved when the component can make requests to the data provider
	 */
	waitPermissionToRequest(): Promise<boolean> {
		return Object.throw();
	}
}
