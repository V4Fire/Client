/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

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
	ProviderOptions,
	ExtraProviders

} from 'core/data';

export {

	Socket,
	RequestError,
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

import iBlock, {

	component,
	prop,
	field,
	system,
	watch,
	wait,
	eventFactory,

	RemoteEvent,
	ModsDecl,
	InitLoadParams

} from 'super/i-block/i-block';

import {

	RequestParams,
	RequestFilter,
	DefaultRequest,
	CreateRequestOptions,
	RetryRequestFn,
	ComponentConverter,
	CheckDBEquality

} from 'super/i-data/modules/interface';

export * from 'super/i-block/i-block';
export * from 'super/i-data/modules/interface';

export const
	$$ = symbolGenerator();

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
	 * If false, then the initial get request wont be executed if the request data is empty.
	 * Also can be passed as a function, that will return true if the request can be executed.
	 */
	@prop({type: [Boolean, Function]})
	readonly requestFilter: RequestFilter = true;

	/**
	 * Remote data converter
	 */
	@prop({type: [Function, Array], required: false})
	readonly dbConverter?: CanArray<ComponentConverter<any>>;

	/**
	 * If true, then all new db data will be compared with old data.
	 * Also can be passed as a function, that will return true if data is equal.
	 * If the data will be equal, then re-render won't be executed.
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
	 * Component data
	 */
	get db(): CanUndef<this['DB']> {
		return this.field.get('dbStore');
	}

	/**
	 * Sets new component data
	 * @emits dbChange(value: CanUndef<this['DB']>)
	 */
	set db(value: CanUndef<this['DB']>) {
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
	 * Data provider event emitter
	 */
	@system({
		atom: true,
		after: 'async',
		unique: true,
		// @ts-ignore
		init: (o, d) => eventFactory(<Async>d.async, () => o.dp && o.dp.event, true)
	})

	protected readonly dataEvent!: RemoteEvent<this>;

	/**
	 * Request parameters
	 */
	@field({merge: true})
	protected readonly requestParams: RequestParams = {get: {}};

	/**
	 * Component data store
	 */
	@field()
	protected dbStore?: CanUndef<this['DB']>;

	/**
	 * Provider instance
	 */
	@system()
	protected dp?: Provider;

	/**
	 * Returns a list of additional data providers for the get request
	 */
	extraProviders(): CanUndef<ExtraProviders> {
		return undefined;
	}

	/** @override */
	initLoad(data?: unknown, params: InitLoadParams = {}): CanPromise<void> {
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
			}, params);
		}

		if (this.dataProvider && !this.dp) {
			this.syncDataProviderWatcher();
		}

		if (!params.silent) {
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
						return super.initLoad(() => this.db, params);

					}, (err) => {
						stderr(err);
						return super.initLoad(() => this.db, params);
					});

			} else if (this.db) {
				this.lfc.execCbAtTheRightTime(() => this.db = undefined, label);
			}
		}

		return super.initLoad(() => this.db, params);
	}

	/**
	 * Alias for iBlock.initLoad
	 *
	 * @see iBlock.initLoad
	 * @param data
	 * @param [params] - additional parameters:
	 *   *) [silent] - silent mode
	 *   *) [recursive] - recursive loading of all remote providers
	 */
	initBaseLoad(data?: unknown | ((this: this) => unknown), params: InitLoadParams = {}): CanPromise<void> {
		return super.initLoad(data, params);
	}

	/** @override */
	reload(params?: InitLoadParams): Promise<void> {
		if (!this.$root.isOnline && !this.offlineReload) {
			return Promise.resolve();
		}

		return super.reload(params);
	}

	/**
	 * Returns the full request URL
	 */
	url(): CanUndef<string>;

	/**
	 * Sets an advanced URL for requests
	 * @param [value]
	 */
	url(value: string): this;
	url(value?: string): CanUndef<this | string> {
		const
			{dp: $d} = this;

		if (!$d) {
			return value != null ? this : undefined;
		}

		if (value == null) {
			return $d.url();
		}

		$d.url(value);
		return this;
	}

	/**
	 * Sets a base temporary URL for requests
	 * @param value
	 */
	base(value: string): this {
		if (this.dp) {
			this.dp.base(value);
		}

		return this;
	}

	/**
	 * Drops the request cache
	 */
	dropRequestCache(): void {
		if (!this.dp) {
			return;
		}

		this.dp.dropCache();
	}

	/**
	 * Peeks data
	 *
	 * @param [data]
	 * @param [params]
	 */
	peek(data?: RequestQuery, params?: CreateRequestOptions<this['DB']>): Promise<CanUndef<this['DB']>> {
		const
			args = arguments.length > 0 ? [data, params] : this.getDefaultRequestParams('peek');

		if (args) {
			return this.createRequest('peek', ...<any>args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Gets data
	 *
	 * @param [data]
	 * @param [params]
	 */
	get(data?: RequestQuery, params?: CreateRequestOptions<this['DB']>): Promise<CanUndef<this['DB']>> {
		const
			args = arguments.length > 0 ? [data, params] : this.getDefaultRequestParams('get');

		if (args) {
			return this.createRequest('get', ...<any>args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Post data
	 *
	 * @param data
	 * @param [params]
	 */
	post<T = unknown>(data?: RequestBody, params?: CreateRequestOptions<T>): Promise<CanUndef<T>> {
		const
			args = arguments.length > 0 ? [data, params] : this.getDefaultRequestParams('post');

		if (args) {
			return this.createRequest('post', ...<any>args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Adds data
	 *
	 * @param data
	 * @param [params]
	 */
	add<T = unknown>(data?: RequestBody, params?: CreateRequestOptions<T>): Promise<CanUndef<T>> {
		const
			args = arguments.length > 0 ? [data, params] : this.getDefaultRequestParams('add');

		if (args) {
			return this.createRequest('add', ...<any>args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Updates data
	 *
	 * @param [data]
	 * @param [params]
	 */
	upd<T = unknown>(data?: RequestBody, params?: CreateRequestOptions<T>): Promise<CanUndef<T>> {
		const
			args = arguments.length > 0 ? [data, params] : this.getDefaultRequestParams('upd');

		if (args) {
			return this.createRequest('upd', ...<any>args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Deletes data
	 *
	 * @param [data]
	 * @param [params]
	 */
	del<T = unknown>(data?: RequestBody, params?: CreateRequestOptions<T>): Promise<CanUndef<T>> {
		const
			args = arguments.length > 0 ? [data, params] : this.getDefaultRequestParams('del');

		if (args) {
			return this.createRequest('del', ...<any>args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Saves the specified data to the root data store
	 *
	 * @param data
	 * @param [key]
	 */
	protected saveDataToRootStore(data: unknown, key?: string): void {
		key = key || this.globalName || this.dataProvider;

		if (!key) {
			return;
		}

		this.r.providerDataStore.set(key, data);
	}

	/**
	 * Converts the specified remote data to the component format and returns it
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
	 * Converts the specified data to the internal component format and returns it
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
	 * Initializes remote data
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
			{dataEvent: $e} = this,
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
	@watch([
		{field: 'request', deep: true},
		{field: 'requestParams', deep: true}
	])

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

			this.dataEvent.off();
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

			this.dp = new ProviderConstructor({
				extraProviders: this.extraProviders,
				...this.dataProviderOptions
			});

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
	 * Create a new request to the data provider
	 *
	 * @param method - request method
	 * @param [data]
	 * @param [params]
	 */
	protected createRequest<T = unknown>(
		method: ModelMethod,
		data?: RequestBody,
		params?: CreateRequestOptions<T>
	): Promise<CanUndef<T>> {
		if (!this.dp) {
			return Promise.resolve(undefined);
		}

		const
			p = <CreateRequestOptions<T>>(params || {}),
			asyncFields = ['join', 'label', 'group'],
			reqParams = <CreateRequestOptions<T>>(Object.reject(p, asyncFields)),
			asyncParams = <AsyncOptions>(Object.select(p, asyncFields));

		const
			req = this.async.request<RequestResponseObject<T>>((<Function>this.dp[method])(data, reqParams), asyncParams),
			is = (v) => v !== false;

		if (this.mods.progress !== 'true') {
			if (is(p.showProgress)) {
				this.setMod('progress', true);
			}

			const then = () => {
				if (is(p.hideProgress)) {
					this.lfc.execCbAtTheRightTime(() => this.setMod('progress', false));
				}
			};

			req.then(then, (err) => {
				this.onRequestError(err, () => this.createRequest<T>(method, data, params));
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
	 * @emits requestError(err: Error | RequestError, retry: RetryRequestFn)
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
