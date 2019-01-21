/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count

import statusCodes from 'core/status-codes';
import symbolGenerator from 'core/symbol';

import Async, { AsyncOpts, AsyncCbOpts } from 'core/async';
import iMessage, { component, prop, field, system, watch, wait, RemoteEvent } from 'super/i-message/i-message';
import { providers } from 'core/data/const';

//#if runtime has core/data

import Provider, {

	Socket,
	RequestQuery,
	RequestBody,
	RequestResponseObject,
	RequestError,
	Response,
	ModelMethods,
	ProviderParams,
	CreateRequestOptions as BaseCreateRequestOptions

} from 'core/data';

export {

	ModelMethods,
	RequestQuery,
	RequestBody,
	RequestResponseObject,
	RequestError

} from 'core/data';

//#endif

export * from 'super/i-message/i-message';
export interface RequestFilterOpts<T = unknown> {
	isEmpty: boolean;
	method: ModelMethods;
	params: CreateRequestOptions<T>;
}

export type RequestFilter<T = unknown> =
	((data: RequestQuery | RequestBody, opts: RequestFilterOpts<T>) => boolean) |
	boolean;

export type DefaultRequest<T = unknown> = [RequestQuery | RequestBody, CreateRequestOptions<T>];
export type Request<T = unknown> = RequestQuery | RequestBody | DefaultRequest<T>;
export type RequestParams<T = unknown> = StrictDictionary<Request<T>>;

export interface SocketEvent<T extends object = Async> extends RemoteEvent<T> {
	connection: Promise<Socket | void>;
}

export interface CreateRequestOptions<T = unknown> extends BaseCreateRequestOptions<T>, AsyncOpts {
	showProgress?: boolean;
	hideProgress?: boolean;
}

export interface ComponentConverter<T = unknown> {
	(value: unknown): T;
}

export const
	$$ = symbolGenerator();

@component()
export default class iData<T extends Dictionary = Dictionary> extends iMessage {
	/**
	 * Data provider name
	 */
	@prop({type: String, watch: 'reload', required: false})
	readonly dataProvider?: string;

	/**
	 * Parameters for a data provider instance
	 */
	@prop(Object)
	readonly dataProviderParams: ProviderParams = {};

	/**
	 * Initial request parameters
	 */
	@prop({type: [Object, Array], required: false})
	readonly request?: RequestParams;

	/**
	 * Initial request filter or if false,
	 * then won't be request for an empty request
	 */
	@prop({type: [Function, Boolean], watch: 'reload'})
	readonly requestFilter: RequestFilter = true;

	/**
	 * Remote data converter
	 */
	@prop({type: Function, watch: 'reload', required: false})
	readonly dbConverter?: ComponentConverter<any>;

	/**
	 * Converter from .db to the component format
	 */
	@prop({type: Function, watch: 'initRemoteData', required: false})
	readonly componentConverter?: ComponentConverter<any>;

	/**
	 * If true, then the component will be reinitialized after an activated hook in offline mode
	 */
	@prop(Boolean)
	readonly needOfflineReInit: boolean = false;

	/**
	 * Component data
	 */
	get db(): CanUndef<T> {
		return this.getField('dbStore');
	}

	/**
	 * Sets new component data
	 */
	set db(value: CanUndef<T>) {
		if (value === this.db) {
			return;
		}

		const
			{async: $a} = this;

		$a.terminateWorker({
			label: $$.db
		});

		this.setField('dbStore', value);
		this.initRemoteData();

		this.watch('dbStore', this.initRemoteData, {
			deep: true,
			label: $$.db
		});
	}

	/**
	 * Event emitter object for working with a data provider
	 */
	get dataEvent(): RemoteEvent<this> {
		const
			{async: $a, dp: $d} = this;

		return {
			on: (event, fn, params, ...args) => {
				if (!$d) {
					return;
				}

				return $a.on($d.event, event, fn, params, ...args);
			},

			once: (event, fn, params, ...args) => {
				if (!$d) {
					return;
				}

				return $a.once($d.event, event, fn, params, ...args);
			},

			promisifyOnce: (event, params, ...args) => {
				if (!$d) {
					return;
				}

				return $a.promisifyOnce($d.event, event, params, ...args);
			},

			off: (...args) => {
				if (!$d) {
					return;
				}

				$a.off(...args);
			}
		};
	}

	/**
	 * Request parameters
	 */
	@field({merge: true})
	protected readonly requestParams: RequestParams = {get: {}};

	/**
	 * Component data store
	 */
	@field()
	protected dbStore?: CanUndef<T>;

	/**
	 * Provider instance
	 */
	@system()
	protected dp?: Provider;

	/** @override */
	@wait({label: $$.initLoad, defer: true})
	async initLoad(data?: unknown, silent?: boolean): Promise<void> {
		const
			important = this.componentStatus === 'unloaded';

		if (!silent) {
			this.componentStatus = 'loading';
		}

		if (data || this.dp && this.dp.baseURL) {
			const
				p = this.getDefaultRequestParams<T>('get');

			const label = {
				join: true,
				label: $$.initLoad
			};

			if (p) {
				Object.assign(p[1], {...label, important, join: false});

				try {
					const db = this.convertDataToDB<T>(data || await this.get(<RequestQuery>p[0], p[1]));
					this.execCbAtTheRightTime(() => this.db = db, label);

				} catch (err) {
					stderr(err);
				}

			} else if (this.db) {
				this.execCbAtTheRightTime(() => this.db = undefined, label);
			}
		}

		return super.initLoad(() => this.db, silent);
	}

	/**
	 * Alias for iBlock.initLoad
	 *
	 * @see iBlock.initLoad
	 * @param data
	 * @param silent
	 */
	initBaseLoad(data?: unknown | ((this: this) => unknown), silent?: boolean): CanPromise<void> {
		return super.initLoad(data, silent);
	}

	/** override */
	async reload(): Promise<void> {
		if (!this.$root.isOnline && !this.needOfflineReInit) {
			return;
		}

		await super.reload();
	}

	/**
	 * Returns full request URL
	 */
	url(): CanUndef<string>;

	/**
	 * Sets advanced URL for requests
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
	 * Sets base temporary URL for requests
	 * @param value
	 */
	base(value: string): this {
		if (this.dp) {
			this.dp.base(value);
		}

		return this;
	}

	/**
	 * Returns an event emitter object for working with a socket connection
	 * @param [params] - advanced parameters
	 */
	connect(params?: Dictionary): SocketEvent<this> {
		const
			{async: $a, dp: $d} = this,
			connection = (async () => $d && $d.connect(params))();

		return {
			connection,
			on: (event, fnOrParams, ...args) => {
				if (!$d) {
					return;
				}

				return (async () => $a.on(<Socket>(await connection), event, fnOrParams, ...args))();
			},

			once: (event, fnOrParams, ...args) => {
				if (!$d) {
					return;
				}

				return (async () => $a.once(<Socket>(await connection), event, fnOrParams, ...args))();
			},

			promisifyOnce: (event, params, ...args) => {
				if (!$d) {
					return;
				}

				return (async () => $a.promisifyOnce(<Socket>(await connection), event, params, ...args))();
			},

			off: (...args) => {
				if (!$d) {
					return;
				}

				return $a.off(...args);
			}
		};
	}

	/**
	 * Peeks data
	 *
	 * @param [data]
	 * @param [params]
	 */
	peek(data?: RequestQuery, params?: CreateRequestOptions<T>): Promise<CanUndef<T>> {
		const
			args = arguments.length > 0 ? [data, params] : this.getDefaultRequestParams('peek');

		if (args) {
			return this.createRequest('peek', ...args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Gets data
	 *
	 * @param [data]
	 * @param [params]
	 */
	get(data?: RequestQuery, params?: CreateRequestOptions<T>): Promise<CanUndef<T>> {
		const
			args = arguments.length > 0 ? [data, params] : this.getDefaultRequestParams('get');

		if (args) {
			return this.createRequest('get', ...args);
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
			return this.createRequest('post', ...args);
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
			return this.createRequest('add', ...args);
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
			return this.createRequest('upd', ...args);
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
			return this.createRequest('del', ...args);
		}

		return Promise.resolve(undefined);
	}

	/**
	 * Drops a request cache
	 */
	dropCache(): void {
		if (!this.dp) {
			return;
		}

		this.dp.dropCache();
	}

	/**
	 * Executes the specified function with a socket connection
	 *
	 * @see {Provider.attachToSocket}
	 * @param fn
	 * @param [params]
	 */
	protected attachToSocket(fn: (socket: Socket) => void, params?: AsyncCbOpts<Provider>): void {
		if (!this.dp) {
			return;
		}

		this.dp.attachToSocket(fn, params);
	}

	/**
	 * Converts the specified remote data to the component format and returns it
	 * @param data
	 */
	protected convertDataToDB<O>(data: unknown): O;
	protected convertDataToDB(data: unknown): T;
	protected convertDataToDB<O>(data: unknown): O | T {
		return this.dbConverter ? this.dbConverter(
			Object.isArray(data) || Object.isObject(data) ? data.valueOf() : data
		) : data;
	}

	/**
	 * Converts the specified data to the internal component format and returns it
	 * @param data
	 */
	protected convertDBToComponent<O = unknown>(data: unknown): O | T {
		return this.componentConverter ? this.componentConverter(
			Object.isArray(data) || Object.isObject(data) ? data.valueOf() : data
		) : data;
	}

	/**
	 * Initializes remote data
	 */
	protected initRemoteData(): CanUndef<unknown> {
		return undefined;
	}

	/**
	 * Initializes data event listeners
	 */
	@wait('ready')
	protected async initDataListeners(): Promise<void> {
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
	 * Synchronization for the requestParams field
	 *
	 * @param [value]
	 * @param [oldValue]
	 */
	@watch({field: 'request', deep: true})
	@watch({field: 'requestParams', deep: true})
	protected async syncRequestParamsWatcher<T = unknown>(
		value?: RequestParams<T>,
		oldValue?: RequestParams<T>
	): Promise<void> {
		if (!value) {
			return;
		}

		const
			tasks = <Promise<void>[]>[];

		for (let o = Object.keys(value), i = 0; i < o.length; i++) {
			const
				key = o[i],
				val = value[key],
				oldVal = oldValue && oldValue[key];

			if (val && oldVal && val.toSource() === oldVal.toSource()) {
				continue;
			}

			const
				m = key.split(':')[0];

			if (m === 'get') {
				tasks.push(this.initLoad());

			} else {
				tasks.push(this[m](...this.getDefaultRequestParams(key)));
			}
		}

		await Promise.all(tasks);
	}

	/**
	 * Synchronization for the dataProvider property
	 * @param value
	 */
	@watch({field: 'dataProvider', immediate: true})
	protected async syncDataProviderWatcher(value?: string): Promise<void> {
		if (value) {
			const
				ProviderConstructor = <typeof Provider>providers[value];

			if (!ProviderConstructor) {
				throw new Error(`Provider "${value}" is not defined`);
			}

			this.dp = new ProviderConstructor(this.dataProviderParams);
			await this.initDataListeners();

		} else {
			this.dp = undefined;
			this.dataEvent.off({group: 'dataProviderSync'});
		}
	}

	/**
	 * Synchronization for the p property
	 *
	 * @param value
	 * @param [oldValue]
	 */
	@watch('p')
	protected syncAdvParamsWatcher(value: Dictionary, oldValue: Dictionary): void {
		if (!Object.fastCompare(value, oldValue)) {
			this.initRemoteData();
		}
	}

	/**
	 * Synchronization for the dataProviderParams property
	 *
	 * @param value
	 * @param [oldValue]
	 */
	@watch('p')
	protected async syncDataProviderParamsWatcher(value: Dictionary, oldValue: Dictionary): Promise<void> {
		const
			providerNm = this.dataProvider;

		if (providerNm) {
			const
				ProviderConstructor = <typeof Provider>providers[providerNm];

			if (!ProviderConstructor) {
				throw new Error(`Provider "${providerNm}" is not defined`);
			}

			this.dp = new ProviderConstructor(value);
			await this.initDataListeners();
		}
	}

	/**
	 * Returns default request parameters for the specified method or false
	 * @param method
	 */
	protected getDefaultRequestParams<T = unknown>(method: string): DefaultRequest<T> | false {
		const [customData, customOpts] = (<unknown[]>[]).concat(
			this.request && this.request[method] || []
		);

		const
			p = this.requestParams && this.requestParams[method],
			isGet = /^get(:|$)/.test(method);

		let
			res;

		if (Object.isArray(p)) {
			p[1] = p[1] || {};
			res = p;

		} else {
			res = [p, {}];
		}

		if (Object.isObject(res[0]) && Object.isObject(customData)) {
			res[0] = Object.mixin({
				traits: true,
				filter: (el) => isGet ? el != null : el !== undefined
			}, undefined, res[0], customData);

		} else {
			res[0] = res[0] != null ? res[0] : customData;
		}

		res[1] = Object.mixin({deep: true}, undefined, res[1], customOpts);

		const
			f = this.requestFilter,
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
	 * Returns default texts for server errors
	 * @param err
	 */
	protected getDefaultErrorText(err: Error | RequestError): string {
		const
			defMsg = t`Unknown server error`;

		if (!(err instanceof RequestError)) {
			return defMsg;
		}

		if (err.type === 'abort') {
			return defMsg;
		}

		let msg;
		switch (err.type) {
			case 'timeout':
				msg = t`The server doesn't respond, try again later`;
				break;

			case 'invalidStatus':
				switch ((<NonNullable<Response>>err.details.response).status) {
					case statusCodes.FORBIDDEN:
						msg = t`You don't have permission for this operation`;
						break;

					case statusCodes.NOT_FOUND:
						msg = t`The requested resource wasn't found`;
						break;

					default:
						msg = defMsg;
				}

				break;

			default:
				msg = defMsg;
		}

		return msg;
	}

	/**
	 * Create a new request to the data provider
	 *
	 * @param method - request method
	 * @param [data]
	 * @param [params]
	 */
	protected createRequest<T = unknown>(
		method: ModelMethods,
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
			asyncParams = <AsyncOpts>(Object.select(p, asyncFields));

		const
			req = this.async.request<RequestResponseObject<T>>((<Function>this.dp[method])(data, reqParams), asyncParams),
			is = (v) => v !== false;

		if (this.mods.progress !== 'true') {
			if (is(p.showProgress)) {
				this.setMod('progress', true);
			}

			const then = () => {
				if (is(p.hideProgress)) {
					this.execCbAtTheRightTime(() => this.setMod('progress', false));
				}
			};

			req.then(then, (err) => {
				this.onRequestError(err, () => this.createRequest<T>(method, data, params));
				then();
				throw err;
			});
		}

		return req.then((res) => res.data || undefined);
	}

	/**
	 * Handler: dataProvider.error
	 *
	 * @emits error(err: Error)
	 * @param err
	 * @param retry - retry function
	 */
	protected onRequestError<T = unknown>(err: Error | RequestError, retry: () => Promise<CanUndef<T>>): void {
		this.emit('error', err, retry);
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
			this.db = undefined;

		} else {
			this.reload().catch(stderr);
		}
	}

	/**
	 * Handler: dataProvider.refresh
	 * @param data
	 */
	protected async onRefreshData(data: T): Promise<void> {
		await this.reload();
	}
}
