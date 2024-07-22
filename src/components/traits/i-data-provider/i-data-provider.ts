/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/traits/i-data-provider/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import SyncPromise from 'core/promise/sync';
import type { ModsDecl } from 'core/component';

import type DataProvider from 'components/friends/data-provider';
import type { DataProviderProp, DataProviderOptions } from 'components/friends/data-provider';

import iProgress from 'components/traits/i-progress/i-progress';
import type iBlock from 'components/super/i-block/i-block';

import type { RequestParams } from 'components/traits/i-data-provider/interface';

export * from 'components/traits/i-data-provider/interface';

const
	$$ = symbolGenerator();

export default abstract class iDataProvider implements iProgress {
	/**
	 * The component data provider.
	 * A provider can be specified in several ways: by its name, by its constructor,
	 * or simply by passing in an instance of the provider.
	 *
	 * @prop
	 * @example
	 * ```
	 * < b-example :dataProvider = 'myProvider'
	 * < b-example :dataProvider = require('providers/my-provider').default
	 * < b-example :dataProvider = myProvider
	 * ```
	 */
	abstract readonly dataProviderProp?: DataProviderProp;

	/**
	 * An instance of the component data provider
	 */
	abstract dataProvider?: DataProvider;

	/**
	 * Additional data source initialization options.
	 * This parameter is used when the provider is specified by name or constructor.
	 *
	 * @prop
	 * @example
	 * ```
	 * < b-example :dataProvider = 'myProvider' | :dataProviderOptions = {socket: true}
	 * ```
	 */
	abstract readonly dataProviderOptions?: DataProviderOptions;

	/**
	 * External request parameters.
	 * The object keys are the names of the methods of the data provider.
	 * Parameters associated with provider methods will automatically be added to the call as default parameters.
	 *
	 * This option is useful for providing some query options from the parent component.
	 *
	 * @prop
	 * @example
	 * ```
	 * < b-select :dataProvider = 'Cities' | :request = {get: {text: searchValue}}
	 *
	 * // Also, you can provide additional parameters to request method
	 * < b-select :dataProvider = 'Cities' | :request = {get: [{text: searchValue}, {cacheStrategy: 'never'}]}
	 * ```
	 */
	abstract readonly request?: RequestParams;

	/**
	 * If true, all requests to the data provider are suspended till you manually resolve them.
	 * This option is used when you want to lazy load components. For instance, you can only load components in
	 * the viewport.
	 *
	 * @prop
	 * @example
	 * ```
	 * < b-select :dataProvider = 'Cities' | :suspendedRequests = true
	 * ```
	 */
	abstract readonly suspendedRequestsProp?: boolean;

	/**
	 * If true, all requests to the data provider are suspended till you manually resolve them.
	 * This parameter must be linked to `suspendedRequestsProp`.
	 */
	abstract suspendedRequests?: boolean;

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
	abstract requestParams: RequestParams;

	/**
	 * The trait modifiers
	 */
	static readonly mods: ModsDecl = {
		...iProgress.mods
	};

	/** {@link iDataProvider.prototype.unsuspendRequests} */
	static unsuspendRequests: AddSelf<iDataProvider['unsuspendRequests'], iBlock & iDataProvider> = (_component) => {
		// Loopback
	};

	/** {@link iDataProvider.prototype.waitPermissionToRequest} */
	static waitPermissionToRequest: AddSelf<iDataProvider['waitPermissionToRequest'], iBlock & iDataProvider> = (component) => {
		if (component.suspendedRequests === false) {
			return SyncPromise.resolve(true);
		}

		return component.unsafe.async.promise(() => new Promise((resolve) => {
			component.unsuspendRequests = () => {
				resolve(true);
				component.suspendedRequests = false;
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
	 * Unsuspends all requests to the data provider.
	 * You can use `suspendedRequestsProp` and `unsuspendRequests` to lazy load components.
	 * For example, you can only load components in the viewport.
	 *
	 * ```
	 * < b-example &
	 *   :dataProvider = 'myData' |
	 *   :suspendedRequests = true |
	 *   v-in-view = {
	 *     threshold: 0.5,
	 *     onEnter: (el) => el.node.component.unsuspendRequests()
	 *   }
	 * .
	 * ```
	 */
	unsuspendRequests(): void {
		return Object.throw();
	}

	/**
	 * Returns a promise that will be resolved when the component can make requests to the data provider
	 */
	waitPermissionToRequest(): Promise<boolean> {
		return Object.throw();
	}
}
