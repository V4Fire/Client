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

import iProgress from 'traits/i-progress/i-progress';
import Async, { AsyncOptions } from 'core/async';

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

	ModsDecl

} from 'super/i-block/i-block';

import {

	RequestParams,
	RequestFilter,
	DefaultRequest,
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
	 * Initial request parameters
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
	 * Remote data converter.
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
	 * Converter from .db to the component format
	 */
	@prop({type: [Function, Array], required: false})
	readonly componentConverter?: CanArray<ComponentConverter<any>>;

	/**
	 * If true, then the component can reload data within an offline mode
	 */
	@prop(Boolean)
	readonly offlineReload: boolean = false;

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
			this.watch('dbStore', this.initRemoteData, {
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
	@system({
		atom: true,
		after: 'async',
		unique: true,
		// @ts-ignore
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
	 * Parameters that associated to provider methods will be automatically appended to
	 * invocation as parameters by default.
	 *
	 * To create logic when the data provider automatically reload data, if some of properties has been
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

		$a
			.clearAll({group: 'requestSync:get'});

		if (this.isFunctional) {
			return super.initLoad(() => {
				if (data) {
					this.db = this.convertDataToDB<this['DB']>(data);
				}

				return this.db;
			}, opts);
		}

		if (this.dataProvider && !this.dp) {
			this.syncDataProviderWatcher();
		}

		if (!opts.silent) {
			this.componentStatus = 'loading';
		}

		if (data || this.dp && this.dp.baseURL) {
			if (data) {
				const db = this.convertDataToDB<this['DB']>(data);
				this.lfc.execCbAtTheRightTime(() => this.db = db, label);

			} else if (this.getDefaultRequestParams('get')) {
				return $a
					.nextTick(label)
					.then(() => {
						const
							p = this.getDefaultRequestParams<this['DB']>('get');

						Object.assign(p[1], {
							...label,
							important: this.componentStatus === 'unloaded'
						});

						return this.get(<RequestQuery>p[0], p[1]);
					})

					.then((data) => {
						this.lfc.execCbAtTheRightTime(() => this.db = this.convertDataToDB<this['DB']>(data), label);
						return super.initLoad(() => this.db, opts);

					}, (err) => {
						stderr(err);
						return super.initLoad(() => this.db, opts);
					});

			} else if (this.db) {
				this.lfc.execCbAtTheRightTime(() => this.db = undefined, label);
			}
		}

		return super.initLoad(() => this.db, opts);
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

		if (args) {
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
	peek<D = unknown>(query?: RequestQuery, opts?: CreateRequestOptions<this['DB']>): Promise<CanUndef<this['DB']>> {
		const
			args = arguments.length > 0 ? [query, opts] : this.getDefaultRequestParams('peek');

		if (args) {
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

		if (args) {
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

		if (args) {
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

		if (args) {
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

		if (args) {
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
		key = key || this.globalName || this.dataProvider;

		if (!key) {
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
			v = (<Function[]>[]).concat(this.dbConverter)
				.reduce((res, fn) => fn.call(this, res), Object.isArray(v) || Object.isPlainObject(v) ? v.valueOf() : v);
		}

		const
			{db, checkDBEquality} = this;

		if (
			Object.isFunction(checkDBEquality) ?
				checkDBEquality.call(this, v, db) :
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
			v = (<Function[]>[]).concat(this.componentConverter)
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
	 * Synchronization for request fields
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
				oldVal = oldValue && oldValue[key];

			if (val && oldVal && Object.fastCompare(val, oldVal)) {
				continue;
			}

			const
				m = key.split(':')[0],
				group = {group: `requestSync:${m}`};

			$a
				.clearAll(group);

			if (m === 'get') {
				this.componentStatus = 'loading';
				$a.setImmediate(this.initLoad, group);

			} else {
				$a.setImmediate(() => this[m](...this.getDefaultRequestParams(key)), group);
			}
		}
	}

	/**
	 * Synchronization for dataProvider properties
	 */
	@watch(['dataProvider', 'dataProviderOptions'])
	protected syncDataProviderWatcher(): void {
		const
			provider = this.dataProvider;

		if (this.dp) {
			this.async
				.clearAll({group: /requestSync/})
				.clearAll({label: $$.initLoad});

			this.dataProviderEmitter.off();
			this.dp = undefined;
		}

		if (provider) {
			const
				ProviderConstructor = <typeof Provider>providers[provider];

			if (!ProviderConstructor) {
				if (provider === 'Provider') {
					return;
				}

				throw new Error(`Provider "${provider}" is not defined`);
			}

			const watchParams = {
				deep: true,
				group: 'requestSync'
			};

			this.watch('request', watchParams, this.syncRequestParamsWatcher);
			this.watch('requestParams', watchParams, this.syncRequestParamsWatcher);

			this.dp = new ProviderConstructor(this.dataProviderOptions);
			this.initDataListeners();
		}
	}

	/**
	 * Returns default request parameters for the specified method or false
	 * @param method
	 */
	protected getDefaultRequestParams<T = unknown>(method: string): DefaultRequest<T> | false {
		const
			{field} = this;

		const [customData, customOpts] = (<unknown[]>[]).concat(
			field.get(`request.${method}`) || []
		);

		const
			p = field.get(`requestParams.${method}`),
			isGet = /^get(:|$)/.test(method);

		let
			res;

		if (Object.isArray(p)) {
			p[1] = p[1] || {};
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
			f = field.get('requestFilter'),
			isEmpty = !Object.size(res[0]);

		const info = {
			isEmpty,
			method,
			params: res[1]
		};

		if (f ? Object.isFunction(f) && !f.call(this, res[0], info) : isEmpty) {
			return false;
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
				this.setMod('progress', true);
			}

			const then = () => {
				if (is(opts.hideProgress)) {
					this.lfc.execCbAtTheRightTime(() => this.setMod('progress', false));
				}
			};

			req.then(then, (err) => {
				this.onRequestError(err, () => this.createRequest<D>(method, body, opts));
				then();
			});
		}

		return req.then((res) => {
			const v = res.data || undefined;
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
	protected onRequestError<T = unknown>(err: Error | RequestError, retry: RetryRequestFn): void {
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
	protected onRefreshData(data: this['DB']): Promise<void> {
		return this.reload();
	}

	//#endif
}
