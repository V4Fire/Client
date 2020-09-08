/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-data/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import { deprecated } from 'core/functools';

import RequestError from 'core/request/error';
import { providers } from 'core/data/const';

//#if runtime has core/data

import Provider, {

	RequestQuery,
	RequestBody,
	RequestResponseObject,
	ModelMethod,
	ProviderOptions

} from 'core/data';

//#endif

import Async, { AsyncOptions } from 'core/async';
import iProgress from 'traits/i-progress/i-progress';

import iBlock, {

	component,
	wrapEventEmitter,

	prop,
	field,
	system,
	watch,
	wait,

	ReadonlyEventEmitterWrapper,

	InitLoadCb,
	InitLoadOptions,

	ModsDecl,
	UnsafeGetter

} from 'super/i-block/i-block';

import { providerMethods } from 'super/i-data/const';

import {

	UnsafeIData,

	RequestParams,
	DefaultRequest,
	RequestFilter,
	CreateRequestOptions,

	RetryRequestFn,
	ComponentConverter,
	CheckDBEquality

} from 'super/i-data/interface';

export { RequestError };

//#if runtime has core/data

export {

	Socket,
	RequestQuery,
	RequestBody,
	RequestResponseObject,
	Response,
	ModelMethod,
	ProviderOptions,
	ExtraProvider,
	ExtraProviders

} from 'core/data';

//#endif

export * from 'super/i-block/i-block';
export * from 'super/i-data/const';
export * from 'super/i-data/interface';

export const
	$$ = symbolGenerator();

/**
 * Superclass for all components that need to download data from data providers
 */
@component({functional: null})
export default abstract class iData extends iBlock implements iProgress {
	/**
	 * Type: raw provider data
	 */
	readonly DB!: object;

	//#if runtime has iData

	/**
	 * Data provider name
	 */
	@prop({type: String, required: false})
	readonly dataProvider?: string;

	/**
	 * Initial parameters for a data provider instance
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
	 * If false, then the initial data request won't be executed if the request data is empty.
	 * Also, the parameter can be passed as a function, that returns true if the request can be executed.
	 */
	@prop({type: [Boolean, Function]})
	readonly requestFilter: RequestFilter = true;

	/**
	 * Remote data converter/s.
	 * This function transforms initial provider data before saving to .db.
	 */
	@prop({type: [Function, Array], required: false})
	readonly dbConverter?: CanArray<ComponentConverter<any>>;

	/**
	 * If true, then all new initial provider data will be compared with old data.
	 * Also, the parameter can be passed as a function, that returns true if data are equal.
	 */
	@prop({type: [Boolean, Function]})
	readonly checkDBEquality: CheckDBEquality = true;

	/**
	 * Converter/s from .db to the component format
	 */
	@prop({type: [Function, Array], required: false})
	readonly componentConverter?: CanArray<ComponentConverter<any>>;

	/**
	 * If true, then the component can reload data within an offline mode
	 */
	@prop(Boolean)
	readonly offlineReload: boolean = false;

	/** @override */
	get unsafe(): UnsafeGetter<UnsafeIData<this>> {
		return <any>this;
	}

	/**
	 * Initial component data.
	 * When a component takes data from own data provider it stores the value within this property.
	 */
	get db(): CanUndef<this['DB']> {
		return this.field.get('dbStore');
	}

	/**
	 * Sets new component data
	 *
	 * @emits `dbCanChange(value: CanUndef<this['DB']>)`
	 * @emits `dbChange(value: CanUndef<this['DB']>)`
	 */
	set db(value: CanUndef<this['DB']>) {
		this.emit('dbCanChange', value);

		if (value === this.db) {
			return;
		}

		const
			{async: $a} = this;

		$a.terminateWorker({
			label: $$.db
		});

		this.field.set('dbStore', value);

		if (this.initRemoteData() !== undefined) {
			this.watch('dbStore', this.initRemoteData.bind(this), {
				deep: true,
				label: $$.db
			});
		}

		this.emit('dbChange', value);
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iProgress.mods
	};

	/**
	 * Event emitter of a component data provider
	 */
	@system<iData>({
		atom: true,
		after: 'async',
		unique: true,
		init: (o, d) => wrapEventEmitter(<Async>d.async, () => o.dp?.event, true)
	})

	protected readonly dataProviderEmitter!: ReadonlyEventEmitterWrapper<this>;

	/**
	 * @deprecated
	 * @see [[iData.dataProviderEmitter]]
	 */
	@deprecated({renamedTo: 'dataProviderEmitter'})
	get dataEvent(): ReadonlyEventEmitterWrapper<this> {
		return this.dataProviderEmitter;
	}

	/**
	 * Request parameters for a data provider.
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
	protected readonly requestParams: RequestParams = {get: {}};

	/**
	 * Component data store
	 * @see [[iData.db]]
	 */
	@field()
	// @ts-ignore (extend)
	protected dbStore?: CanUndef<this['DB']>;

	/**
	 * Instance of a component data provider by .dataProvider value
	 */
	@system()
	protected dp?: Provider;

	/** @override */
	initLoad(data?: unknown, opts: InitLoadOptions = {}): CanPromise<void> {
		if (!this.isActivated) {
			return;
		}

		const
			{async: $a} = this;

		const label = <AsyncOptions>{
			label: $$.initLoad,
			join: 'replace'
		};

		const
			callSuper = () => super.initLoad(() => this.db, opts);

		try {
			if (opts.emitStartEvent !== false) {
				this.emit('initLoadStart', opts);
			}

			opts = {
				emitStartEvent: false,
				...opts
			};

			$a
				.clearAll({group: 'requestSync:get'});

			if (this.isFunctional) {
				return super.initLoad(() => {
					if (data !== undefined) {
						this.db = this.convertDataToDB<this['DB']>(data);
					}

					return this.db;
				}, opts);
			}

			if (this.dataProvider != null && this.dp == null) {
				this.syncDataProviderWatcher(false);
			}

			if (!opts.silent) {
				this.componentStatus = 'loading';
			}

			if (data !== undefined) {
				const db = this.convertDataToDB<this['DB']>(data);
				void this.lfc.execCbAtTheRightTime(() => this.db = db, label);

			} else if (this.dp?.baseURL != null) {
				const
					needRequest = Object.isArray(this.getDefaultRequestParams('get'));

				if (needRequest) {
					return $a
						.nextTick(label)

						.then(() => {
							const
								defParams = this.getDefaultRequestParams<this['DB']>('get');

							if (defParams == null) {
								return;
							}

							Object.assign(defParams[1], {
								...label,
								important: this.componentStatus === 'unloaded'
							});

							return this.get(<RequestQuery>defParams[0], defParams[1]);
						})

						.then(
							(data) => {
								void this.lfc.execCbAtTheRightTime(() => this.db = this.convertDataToDB<this['DB']>(data), label);
								return callSuper();
							},

							(err) => {
								stderr(err);
								return callSuper();
							}
						);
				}

				if (this.db !== undefined) {
					void this.lfc.execCbAtTheRightTime(() => this.db = undefined, label);
				}
			}

			return callSuper();

		} catch (err) {
			stderr(err);
			return callSuper();
		}
	}

	/**
	 * Link to iBlock.initLoad
	 *
	 * @see [[iBlock.initLoad]]
	 * @param [data]
	 * @param [opts]
	 */
	initBaseLoad(data?: unknown | InitLoadCb, opts?: InitLoadOptions): CanPromise<void> {
		return super.initLoad(data, opts);
	}

	/** @override */
	reload(opts?: InitLoadOptions): Promise<void> {
		if (!this.r.isOnline && !this.offlineReload) {
			return Promise.resolve();
		}

		return super.reload(opts);
	}

	/**
	 * Drops the request cache
	 */
	dropRequestCache(): void {
		this.dp?.dropCache();
	}

	/**
	 * Returns the full URL of any request
	 */
	url(): CanUndef<string>;

	/**
	 * Sets an extra URL part for any request (it is concatenated with the base part of URL).
	 * This method returns a new component object with additional context.
	 *
	 * @param [value]
	 */
	url(value: string): this;
	url(value?: string): CanUndef<string> | this {
		if (value == null) {
			return this.dp?.url();
		}

		if (this.dp) {
			const ctx = Object.create(this);
			ctx.dp = this.dp.url(value);

			for (let i = 0; i < providerMethods.length; i++) {
				const
					method = providerMethods[i];

				Object.defineProperty(ctx, method, {
					writable: true,
					configurable: true,
					value: this.instance[method]
				});
			}

			return ctx;
		}

		return this;
	}

	/**
	 * Returns the base part of URL of any request
	 */
	base(): CanUndef<string>;

	/**
	 * Sets a base part of URL for any request.
	 * This method returns a new component object with additional context.
	 *
	 * @param [value]
	 */
	base(value: string): this;
	base(value?: string): CanUndef<string> | this {
		if (value == null) {
			return this.dp?.base();
		}

		if (this.dp) {
			const ctx = Object.create(this);
			ctx.dp = this.dp.base(value);

			for (let i = 0; i < providerMethods.length; i++) {
				const
					method = providerMethods[i];

				Object.defineProperty(ctx, method, {
					writable: true,
					configurable: true,
					value: this.instance[method]
				});
			}

			return ctx;
		}

		return this;
	}

	/**
	 * Requests the provider for data by a query.
	 * This method is similar for a GET request.
	 *
	 * @see [[Provider.get]]
	 * @param [query] - request query
	 * @param [opts] - additional request options
	 */
	get<D = unknown>(query?: RequestQuery, opts?: CreateRequestOptions<D>): Promise<CanUndef<D>> {
		const
			args = arguments.length > 0 ? [query, opts] : this.getDefaultRequestParams('get');

		if (Object.isArray(args)) {
			return this.createRequest('get', ...<any>args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Checks accessibility of the provider by a query.
	 * This method is similar for a HEAD request.
	 *
	 * @see [[Provider.peek]]
	 * @param [query] - request query
	 * @param [opts] - additional request options
	 */
	peek<D = unknown>(query?: RequestQuery, opts?: CreateRequestOptions<D>): Promise<CanUndef<D>> {
		const
			args = arguments.length > 0 ? [query, opts] : this.getDefaultRequestParams('peek');

		if (Object.isArray(args)) {
			return this.createRequest('peek', ...<any>args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Sends custom data to the provider without any logically effect.
	 * This method is similar for a POST request.
	 *
	 * @see [[Provider.post]]
	 * @param [body] - request body
	 * @param [opts] - additional request options
	 */
	post<D = unknown>(body?: RequestBody, opts?: CreateRequestOptions<D>): Promise<CanUndef<D>> {
		const
			args = arguments.length > 0 ? [body, opts] : this.getDefaultRequestParams('post');

		if (Object.isArray(args)) {
			return this.createRequest('post', ...<any>args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Add new data to the provider.
	 * This method is similar for a POST request.
	 *
	 * @see [[Provider.add]]
	 * @param [body] - request body
	 * @param [opts] - additional request options
	 */
	add<D = unknown>(body?: RequestBody, opts?: CreateRequestOptions<D>): Promise<CanUndef<D>> {
		const
			args = arguments.length > 0 ? [body, opts] : this.getDefaultRequestParams('add');

		if (Object.isArray(args)) {
			return this.createRequest('add', ...<any>args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Updates data of the provider by a query.
	 * This method is similar for a PUT request.
	 *
	 * @see [[Provider.upd]]
	 * @param [body] - request body
	 * @param [opts] - additional request options
	 */
	upd<D = unknown>(body?: RequestBody, opts?: CreateRequestOptions<D>): Promise<CanUndef<D>> {
		const
			args = arguments.length > 0 ? [body, opts] : this.getDefaultRequestParams('upd');

		if (Object.isArray(args)) {
			return this.createRequest('upd', ...<any>args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Deletes data of the provider by a query.
	 * This method is similar for a DELETE request.
	 *
	 * @see [[Provider.del]]
	 * @param [body] - request body
	 * @param [opts] - additional request options
	 */
	del<D = unknown>(body?: RequestBody, opts?: CreateRequestOptions<D>): Promise<CanUndef<D>> {
		const
			args = arguments.length > 0 ? [body, opts] : this.getDefaultRequestParams('del');

		if (Object.isArray(args)) {
			return this.createRequest('del', ...<any>args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Saves data to the root data store
	 *
	 * @param data
	 * @param [key] - key to save data
	 */
	protected saveDataToRootStore(data: unknown, key?: string): void {
		key = key ?? this.globalName ?? this.dataProvider;

		if (key == null) {
			return;
		}

		this.r.providerDataStore.set(key, data);
	}

	/**
	 * Converts data to the component format and returns it
	 * @param data
	 */
	protected convertDataToDB<O>(data: unknown): O;
	protected convertDataToDB(data: unknown): this['DB'];
	protected convertDataToDB<O>(data: unknown): O | this['DB'] {
		let
			v = data;

		if (this.dbConverter) {
			v = Array.concat([], this.dbConverter)
				.reduce((res, fn) => fn.call(this, res), Object.isArray(v) || Object.isPlainObject(v) ? v.valueOf() : v);
		}

		const
			{db, checkDBEquality} = this;

		if (
			Object.isFunction(checkDBEquality) ?
				Object.isTruly(checkDBEquality.call(this, v, db)) :
				checkDBEquality && Object.fastCompare(v, db)
		) {
			return <O | this['DB']>db;
		}

		return <O | this['DB']>v;
	}

	/**
	 * Converts data to the internal component format and returns it
	 * @param data
	 */
	protected convertDBToComponent<O = unknown>(data: unknown): O | this['DB'] {
		let
			v = data;

		if (this.componentConverter) {
			v = Array.concat([], this.componentConverter)
				.reduce((res, fn) => fn.call(this, res), Object.isArray(v) || Object.isPlainObject(v) ? v.valueOf() : v);
		}

		return <O | this['DB']>v;
	}

	/**
	 * Initializes component data from a data provider.
	 * This method is used to map .db to component properties.
	 * If the method is used, it must return some value that not equals to undefined.
	 */
	@watch('componentConverter')
	protected initRemoteData(): CanUndef<unknown> {
		return undefined;
	}

	/** @override */
	protected initGlobalEvents(resetListener?: boolean): void {
		super.initGlobalEvents(resetListener != null ? resetListener : Boolean(this.dataProvider));
	}

	/**
	 * Initializes data event listeners
	 */
	@wait('ready')
	protected initDataListeners(): void {
		const
			{dataProviderEmitter: $e} = this,
			group = {group: 'dataProviderSync'};

		$e.off(
			group
		);

		$e.on('add', (data) => {
			if (this.getDefaultRequestParams('get')) {
				return this.onAddData(Object.isFunction(data) ? data() : data);
			}
		}, group);

		$e.on('upd', (data) => {
			if (this.getDefaultRequestParams('get')) {
				return this.onUpdData(Object.isFunction(data) ? data() : data);
			}
		}, group);

		$e.on('del', (data) => {
			if (this.getDefaultRequestParams('get')) {
				return this.onDelData(Object.isFunction(data) ? data() : data);
			}
		}, group);

		$e.on('refresh', (data) => this.onRefreshData(Object.isFunction(data) ? data() : data), group);
	}

	/**
	 * Synchronization of request fields
	 *
	 * @param [value]
	 * @param [oldValue]
	 */
	protected syncRequestParamsWatcher<T = unknown>(
		value?: RequestParams<T>,
		oldValue?: RequestParams<T>
	): void {
		if (!value) {
			return;
		}

		const
			{async: $a} = this;

		for (let o = Object.keys(value), i = 0; i < o.length; i++) {
			const
				key = o[i],
				val = value[key],
				oldVal = oldValue?.[key];

			if (val != null && oldVal != null && Object.fastCompare(val, oldVal)) {
				continue;
			}

			const
				m = key.split(':')[0],
				group = {group: `requestSync:${m}`};

			$a
				.clearAll(group);

			if (m === 'get') {
				this.componentStatus = 'loading';
				$a.setImmediate(this.initLoad.bind(this), group);

			} else {
				$a.setImmediate(() => this[m](...this.getDefaultRequestParams(key)), group);
			}
		}
	}

	/**
	 * Synchronization of dataProvider properties
	 * @param [initLoad] - if false, there is no need to call .initLoad
	 */
	@watch([
		{field: 'dataProvider', provideArgs: false},
		{field: 'dataProviderOptions', provideArgs: false}
	])

	protected syncDataProviderWatcher(initLoad: boolean = true): void {
		const
			provider = this.dataProvider;

		if (this.dp) {
			this.async
				.clearAll({group: /requestSync/})
				.clearAll({label: $$.initLoad});

			this.dataProviderEmitter.off();
			this.dp = undefined;
		}

		if (provider != null) {
			const
				ProviderConstructor = <CanUndef<typeof Provider>>providers[provider];

			if (ProviderConstructor == null) {
				if (provider === 'Provider') {
					return;
				}

				throw new Error(`Provider "${provider}" is not defined`);
			}

			const watchParams = {
				deep: true,
				group: 'requestSync'
			};

			this.watch('request', watchParams, this.syncRequestParamsWatcher.bind(this));
			this.watch('requestParams', watchParams, this.syncRequestParamsWatcher.bind(this));

			this.dp = new ProviderConstructor(this.dataProviderOptions);
			this.initDataListeners();

			if (initLoad) {
				void this.initLoad();
			}
		}
	}

	/**
	 * Returns default request parameters for the specified method
	 * @param method
	 */
	protected getDefaultRequestParams<T = unknown>(method: string): CanUndef<DefaultRequest<T>> {
		const
			{field} = this;

		const
			[customData, customOpts] = Array.concat([], field.get(`request.${method}`));

		const
			p = field.get(`requestParams.${method}`),
			isGet = /^get(:|$)/.test(method);

		let
			res;

		if (Object.isArray(p)) {
			p[1] = p[1] ?? {};
			res = p;

		} else {
			res = [p, {}];
		}

		if (Object.isPlainObject(res[0]) && Object.isPlainObject(customData)) {
			res[0] = Object.mixin({
				traits: true,
				filter: (el) => isGet ? el != null : el !== undefined
			}, undefined, res[0], customData);

		} else {
			res[0] = res[0] != null ? res[0] : customData;
		}

		res[1] = Object.mixin({deep: true}, undefined, res[1], customOpts);

		const
			f = field.get<RequestFilter>('requestFilter'),
			isEmpty = Object.size(res[0]) === 0;

		const info = {
			isEmpty,
			method,
			params: res[1]
		};

		if (
			Object.isTruly(f) ?
				Object.isFunction(f) && !Object.isTruly(f.call(this, res[0], info)) :
				isEmpty
		) {
			return;
		}

		return res;
	}

	/**
	 * Creates a new request to the data provider
	 *
	 * @param method - request method
	 * @param [body] - request body
	 * @param [opts] - additional options
	 */
	protected createRequest<D = unknown>(
		method: ModelMethod,
		body?: RequestBody,
		opts: CreateRequestOptions<D> = {}
	): Promise<CanUndef<D>> {
		if (!this.dp) {
			return Promise.resolve(undefined);
		}

		const
			asyncFields = ['join', 'label', 'group'],
			reqParams = Object.reject(opts, asyncFields),
			asyncParams = Object.select(opts, asyncFields);

		const
			req = this.async.request<RequestResponseObject<D>>((<Function>this.dp[method])(body, reqParams), asyncParams),
			is = (v) => v !== false;

		if (this.mods.progress !== 'true') {
			if (is(opts.showProgress)) {
				void this.setMod('progress', true);
			}

			const then = () => {
				if (is(opts.hideProgress)) {
					void this.lfc.execCbAtTheRightTime(() => this.setMod('progress', false));
				}
			};

			req.then(then, (err) => {
				this.onRequestError(err, () => this.createRequest<D>(method, body, opts));
				then();
			});
		}

		return req.then((res) => {
			const v = res.data ?? undefined;
			this.saveDataToRootStore(v);
			return v;
		});
	}

	/**
	 * Handler: dataProvider.error
	 *
	 * @param err
	 * @param retry - retry function
	 * @emits `requestError(err: Error | RequestError, retry: RetryRequestFn)`
	 */
	protected onRequestError(err: Error | RequestError, retry: RetryRequestFn): void {
		this.emitError('requestError', err, retry);
	}

	/**
	 * Handler: dataProvider.add
	 * @param data
	 */
	protected onAddData(data: unknown): void {
		if (data != null) {
			this.db = this.convertDataToDB(data);

		} else {
			this.reload().catch(stderr);
		}
	}

	/**
	 * Handler: dataProvider.upd
	 * @param data
	 */
	protected onUpdData(data: unknown): void {
		if (data != null) {
			this.db = this.convertDataToDB(data);

		} else {
			this.reload().catch(stderr);
		}
	}

	/**
	 * Handler: dataProvider.del
	 * @param data
	 */
	protected onDelData(data: unknown): void {
		if (data != null) {
			this.db = this.convertDataToDB(data);

		} else {
			this.reload().catch(stderr);
		}
	}

	/**
	 * Handler: dataProvider.refresh
	 * @param data
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected onRefreshData(data: this['DB']): Promise<void> {
		return this.reload();
	}

	//#endif
}
