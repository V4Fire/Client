/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';

import type { ProviderOptions } from 'core/data';
import type Data from 'components/friends/data';

import iProgress from 'components/traits/i-progress/i-progress';
import iBlock, { component, prop, system, ModsDecl } from 'components/super/i-block/i-block';

import type {

	RequestParams,
	RequestFilter,

	ComponentConverter,
	CheckDBEquality

} from 'components/super/i-data/interface';

export const
	$$ = symbolGenerator();

@component({functional: null})
export default abstract class iDataParams extends iBlock implements iProgress {
	/**
	 * Data provider name
	 */
	@prop({type: String, required: false})
	readonly dataProvider?: string;

	/**
	 * Initial parameters for the data provider instance
	 */
	@prop({type: Object, required: false})
	readonly dataProviderOptions?: ProviderOptions;

	/**
	 * External request parameters.
	 * Keys of the object represent names of data provider methods.
	 * Parameters that associated with provider methods will be automatically appended to
	 * invocation as parameters by default.
	 *
	 * This parameter is useful to provide some request parameters from a parent component.
	 *
	 * @example
	 * ```
	 * < b-select :dataProvider = 'Cities' | :request = {get: {text: searchValue}}
	 *
	 * // Also, you can provide additional parameters to request method
	 * < b-select :dataProvider = 'Cities' | :request = {get: [{text: searchValue}, {cacheStrategy: 'never'}]}
	 * ```
	 */
	@prop({type: [Object, Array], required: false})
	readonly request?: RequestParams;

	/**
	 * Remote data converter/s.
	 * This function (or a list of functions) transforms initial provider data before saving to `db`.
	 */
	@prop({type: [Function, Array], required: false})
	readonly dbConverter?: CanArray<ComponentConverter>;

	/**
	 * Converter(s) from the raw `db` to the component fields
	 */
	@prop({type: [Function, Array], required: false})
	readonly componentConverter?: CanArray<ComponentConverter>;

	/**
	 * A function to filter all "default" requests, i.e., all requests that were produced implicitly,
	 * like an initial component request or requests that are triggered by changing of parameters from
	 * `request` and `requestParams`. If the filter returns negative value, the tied request will be aborted.
	 *
	 * Also, you can set this parameter to true, and it will filter only requests with a payload.
	 */
	@prop({type: [Boolean, Function], required: false})
	readonly defaultRequestFilter?: RequestFilter;

	/**
	 * If true, all requests to the data provider are suspended till you don't manually force it.
	 * This prop is used when you want to organize the lazy loading of components.
	 * For instance, you can load only components in the viewport.
	 */
	@prop(Boolean)
	readonly suspendRequestsProp: boolean = false;

	/**
	 * Enables the suspending of all requests to the data provider till you don't manually force it.
	 * Also, the parameter can contain a promise resolve function.
	 * @see [[iData.suspendRequestsProp]]
	 */
	@system((o) => o.sync.link())
	suspendRequests?: boolean | Function;

	/**
	 * If true, then the component can reload data within the offline mode
	 */
	@prop(Boolean)
	readonly offlineReload: boolean = false;

	/**
	 * If true, then all new initial provider data will be compared with the old data.
	 * Also, the parameter can be passed as a function, that returns true if data are equal.
	 */
	@prop({type: [Boolean, Function]})
	readonly checkDBEquality: CheckDBEquality = true;

	/**
	 * Request parameters for the data provider.
	 * Keys of the object represent names of data provider methods.
	 * Parameters that associated with provider methods will be automatically appended to
	 * invocation as parameters by default.
	 *
	 * To create logic when the data provider automatically reload data, if some properties has been
	 * changed, you need to use 'sync.object'.
	 *
	 * @example
	 * ```ts
	 * class Foo extends iData {
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
	 *     ]),
	 *   })
	 *
	 *   protected readonly requestParams!: RequestParams;
	 * }
	 * ```
	 */
	@system({merge: true})
	readonly requestParams: RequestParams = {get: {}};

	/**
	 * Instance of a component data provider
	 */
	@system()
	data?: Data;

	static override readonly mods: ModsDecl = {
		...iProgress.mods
	};

	/**
	 * Returns a promise that will be resolved when the component can produce requests to the data provider
	 */
	waitPermissionToRequest(): Promise<boolean> {
		if (this.suspendRequests === false) {
			return SyncPromise.resolve(true);
		}

		return this.async.promise(() => new Promise((resolve) => {
			this.suspendRequests = () => {
				resolve(true);
				this.suspendRequests = false;
			};

		}), {
			label: $$.waitPermissionToRequest,
			join: true
		});
	}
}
