/* eslint-disable max-lines */

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
import SyncPromise from 'core/promise/sync';

import { deprecate, deprecated } from 'core/functools/deprecation';

import RequestError from 'core/request/error';
import { providers } from 'core/data/const';

//#if runtime has core/data

import type Provider from 'core/data';
import type {

	RequestQuery,
	RequestBody,
	RequestResponseObject,
	ModelMethod,
	ProviderOptions

} from 'core/data';

//#endif

import type Async from 'core/async';
import type { AsyncOptions } from 'core/async';

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

import type {

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
	readonly dbConverter?: CanArray<ComponentConverter<any>>;

	/**
	 * Converter/s from the raw `db` to the component fields
	 */
	@prop({type: [Function, Array], required: false})
	readonly componentConverter?: CanArray<ComponentConverter<any>>;

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
	 * @deprecated
	 * @see [[iData.defaultRequestFilter]]
	 */
	@prop({type: [Boolean, Function], required: false})
	readonly requestFilter?: RequestFilter;

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
		init: (o, d) => wrapEventEmitter(<Async>d.async, () => o.dp?.emitter, true)
	})

	protected readonly dataEmitter!: ReadonlyEventEmitterWrapper<this>;

	/**
	 * @deprecated
	 * @see [[iData.dataEmitter]]
	 */
	@deprecated({renamedTo: 'dataEmitter'})
	get dataEvent(): ReadonlyEventEmitterWrapper<this> {
		return this.dataEmitter;
	}

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
	protected readonly requestParams: RequestParams = {get: {}};

	/**
	 * Component data store
	 * @see [[iData.db]]
	 */
	@field()
	// @ts-ignore (extend)
	protected dbStore?: CanUndef<this['DB']>;

	/**
	 * Instance of a component data provider
	 */
	@system()
	protected dp?: Provider;

	/**
	 * Unsuspend requests to the data provider
	 */
	unsuspendRequests(): void {
		if (Object.isFunction(this.suspendRequests)) {
			this.suspendRequests();
		}
	}

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

			if (this.isNotRegular && !this.isSSR) {
				const res = super.initLoad(() => {
					if (data !== undefined) {
						this.db = this.convertDataToDB<this['DB']>(data);
					}

					return this.db;
				}, opts);

				if (Object.isPromise(res)) {
					this.$initializer = res;
				}

				return res;
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
					const res = $a
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

							// Prefetch
							void this.moduleLoader.load(...this.dependencies);
							void this.state.initFromStorage();

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

					this.$initializer = res;
					return res;
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
	 * Link to `iBlock.initLoad`
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
	 * Drops the data provider cache
	 */
	dropDataCache(): void {
		this.dp?.dropCache();
	}

	/**
	 * @deprecated
	 * @see [[iData.dropDataCache]]
	 */
	@deprecated({renamedTo: 'dropProviderCache'})
	dropRequestCache(): void {
		this.dropDataCache();
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
	 *
	 * @example
	 * ```js
	 * this.url('list').get()
	 * ```
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
	 * Sets the base part of URL for any request.
	 * This method returns a new component object with additional context.
	 *
	 * @param [value]
	 *
	 * @example
	 * ```js
	 * this.base('list').get()
	 * ```
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
	 * Adds new data to the provider.
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
	 * This method is similar for PUT or PATCH requests.
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
	 * Saves data to the root data store.
	 * All components with specified global names or data providers by default store data from initial providers'
	 * requests with the root component.
	 *
	 * You can check each provider data by using `r.providerDataStore`.
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
	 * Converts raw provider data to the component `db` format and returns it
	 * @param data
	 */
	protected convertDataToDB<O>(data: unknown): O;
	protected convertDataToDB(data: unknown): this['DB'];
	protected convertDataToDB<O>(data: unknown): O | this['DB'] {
		let
			val = data;

		if (this.dbConverter != null) {
			const
				converters = Array.concat([], this.dbConverter);

			if (converters.length > 0) {
				val = Object.isArray(val) || Object.isDictionary(val) ? val.valueOf() : val;

				for (let i = 0; i < converters.length; i++) {
					val = converters[i].call(this, val);
				}
			}
		}

		const
			{db, checkDBEquality} = this;

		const canKeepOldData = Object.isFunction(checkDBEquality) ?
			Object.isTruly(checkDBEquality.call(this, val, db)) :
			checkDBEquality && Object.fastCompare(val, db);

		if (canKeepOldData) {
			return <O | this['DB']>db;
		}

		return <O | this['DB']>val;
	}

	/**
	 * Converts data from `db` to the component field format and returns it
	 * @param data
	 */
	protected convertDBToComponent<O = unknown>(data: unknown): O | this['DB'] {
		let
			val = data;

		if (this.componentConverter) {
			const
				converters = Array.concat([], this.componentConverter);

			if (converters.length > 0) {
				val = Object.isArray(val) || Object.isDictionary(val) ? val.valueOf() : val;

				for (let i = 0; i < converters.length; i++) {
					val = converters[i].call(this, val);
				}
			}
		}

		return <O | this['DB']>val;
	}

	/**
	 * Initializes component data from the data provider.
	 * This method is used to map `db` to component properties.
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
			{dataEmitter: $e} = this,
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
				m = key.split(':', 1)[0],
				group = {group: `requestSync:${m}`};

			$a
				.clearAll(group);

			if (m === 'get') {
				this.componentStatus = 'loading';
				$a.setImmediate(this.initLoad.bind(this), group);

			} else {
				$a.setImmediate(() => this[m](...this.getDefaultRequestParams(key) ?? []), group);
			}
		}
	}

	/**
	 * Synchronization of `dataProvider` properties
	 * @param [initLoad] - if false, there is no need to call `initLoad`
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

			this.dataEmitter.off();
			this.dp = undefined;
		}

		if (provider != null) {
			const
				ProviderConstructor = <CanUndef<typeof Provider>>providers[provider];

			if (ProviderConstructor == null) {
				if (provider === 'Provider') {
					return;
				}

				throw new ReferenceError(`The provider "${provider}" is not defined`);
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
	 * Returns default request parameters for the specified data provider method
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
			const mixedData = Object.mixin({
				onlyNew: true,
				filter: (el) => {
					if (isGet) {
						return el != null;
					}

					return el !== undefined;
				}
			}, undefined, res[0], customData);

			res[0] = mixedData;

		} else {
			res[0] = res[0] != null ? res[0] : customData;
		}

		res[1] = Object.mixin({deep: true}, undefined, res[1], customOpts);

		const
			requestFilter = this.requestFilter ?? this.defaultRequestFilter,
			isEmpty = Object.size(res[0]) === 0;

		const info = {
			isEmpty,
			method,
			params: res[1]
		};

		let
			needSkip = false;

		if (this.requestFilter != null) {
			deprecate({
				name: 'requestFilter',
				type: 'property',
				alternative: {name: 'defaultRequestFilter'}
			});

			if (Object.isFunction(requestFilter)) {
				needSkip = !Object.isTruly(requestFilter.call(this, res[0], info));

			} else if (requestFilter === false) {
				needSkip = isEmpty;
			}

		} else if (Object.isFunction(requestFilter)) {
			needSkip = !Object.isTruly(requestFilter.call(this, res[0], info));

		} else if (requestFilter === true) {
			needSkip = isEmpty;
		}

		if (needSkip) {
			return;
		}

		return res;
	}

	/**
	 * Returns a promise that will be resolved when the component can produce requests to the data provider
	 */
	protected waitPermissionToRequest(): Promise<boolean> {
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

		const req = this.waitPermissionToRequest()
			.then(() => {
				if (this.dp == null) {
					throw new ReferenceError('The data provider to request is not defined');
				}

				const rawRequest = (<Function>this.dp[method])(body, reqParams);
				return this.async.request<RequestResponseObject<D>>(rawRequest, asyncParams);
			});

		if (this.mods.progress !== 'true') {
			const
				is = (v) => v !== false;

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
	 * Handler: `dataProvider.error`
	 *
	 * @param err
	 * @param retry - retry function
	 * @emits `requestError(err: Error |` [[RequestError]], retry:` [[RetryRequestFn]]`)`
	 */
	protected onRequestError(err: Error | RequestError, retry: RetryRequestFn): void {
		this.emitError('requestError', err, retry);
	}

	/**
	 * Handler: `dataProvider.add`
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
	 * Handler: `dataProvider.upd`
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
	 * Handler: `dataProvider.del`
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
	 * Handler: `dataProvider.refresh`
	 * @param data
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected onRefreshData(data: this['DB']): Promise<void> {
		return this.reload();
	}

	//#endif
}
