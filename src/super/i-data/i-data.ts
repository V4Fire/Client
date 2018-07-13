/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count

import $C = require('collection.js');

import Then from 'core/then';
import StatusCodes from 'core/statusCodes';
import symbolGenerator from 'core/symbol';

import { Socket } from 'core/socket';
import Async, { AsyncOpts, AsyncCbOpts } from 'core/async';

import iMessage, { component, prop, field, system, watch, wait, RemoteEvent } from 'super/i-message/i-message';
import Provider, {

	providers,
	RequestQuery,
	RequestBody,
	RequestResponseObject,
	RequestError,
	ModelMethods,
	CreateRequestOptions as BaseCreateRequestOptions

} from 'core/data';

export * from 'super/i-message/i-message';
export { ModelMethods, RequestQuery, RequestBody, RequestResponseObject, RequestError } from 'core/data';

export interface RequestFilterOpts {
	isEmpty: boolean;
	method: ModelMethods;
	params: CreateRequestOptions;
}

export type RequestFilter = ((data: RequestQuery | RequestBody, opts: RequestFilterOpts) => boolean) | boolean;
export type Request = RequestQuery | RequestBody | [RequestQuery | RequestBody, CreateRequestOptions];
export type RequestParams = Dictionary<Request>;

export interface SocketEvent<T extends object = Async> extends RemoteEvent<T> {
	connection: Promise<Socket | void>;
}

export interface CreateRequestOptions<T = any> extends BaseCreateRequestOptions<T>, AsyncOpts {
	showProgress?: boolean;
	hideProgress?: boolean;
}

export interface ComponentConverter<T = any> {
	(value: any): T;
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
	readonly dataProviderParams: Dictionary = {};

	/**
	 * Data initialization advanced path
	 */
	@prop({type: String, watch: 'reload', required: false})
	readonly initAdvPath?: string;

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
	readonly dbConverter?: Function;

	/**
	 * Converter from .db to the component format
	 */
	@prop({type: Function, watch: 'initRemoteData', required: false})
	readonly componentConverter?: ComponentConverter;

	/**
	 * Component data
	 */
	get db(): T | undefined {
		return this.getField('dbStore');
	}

	/**
	 * Sets new component data
	 */
	set db(value: T | undefined) {
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
	protected dbStore?: T | undefined;

	/**
	 * Provider instance
	 */
	@system()
	protected dp?: Provider;

	/**
	 * Reloads component data
	 */
	async reload(): Promise<void> {
		return this.initLoad(true);
	}

	/** @override */
	@wait({label: $$.initLoad, defer: true})
	async initLoad(silent?: boolean): Promise<void> {
		if (!silent) {
			this.componentStatus = 'loading';
		}

		if (this.dp && this.dp.baseURL) {
			const
				p = this.getDefaultRequestParams('get');

			const label = {
				join: true,
				label: $$.initLoad
			};

			if (p) {
				Object.assign(p[1], {label: $$.initLoad, join: 'replace'});

				if (this.initAdvPath) {
					this.url(this.initAdvPath);
				}

				try {
					const
						db = this.convertDataToDB(await this.get(<RequestQuery>p[0], p[1]));

					if (!Object.fastCompare(this.db, db)) {
						this.execCbAtTheRightTime(() => this.db = <any>db, label);
					}

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
	 * Returns full request URL
	 */
	url(): string | undefined;

	/**
	 * Sets advanced URL for requests
	 * @param [value]
	 */
	url(value: string): this;
	url(value?: string): this | string | undefined {
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
			on: async (event, fnOrParams, ...args) => {
				if (!$d) {
					return;
				}

				return $a.on(<Socket>(await connection), event, fnOrParams, ...args);
			},

			once: async (event, fnOrParams, ...args) => {
				if (!$d) {
					return;
				}

				return $a.once(<Socket>(await connection), event, fnOrParams, ...args);
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
	 * Gets data
	 *
	 * @param [data]
	 * @param [params]
	 */
	get(data?: RequestQuery, params?: CreateRequestOptions<T>): Promise<T | undefined> {
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
	post<T>(data?: RequestBody, params?: CreateRequestOptions<T>): Promise<T | undefined> {
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
	add<T>(data?: RequestBody, params?: CreateRequestOptions<T>): Promise<T | undefined> {
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
	upd<T>(data?: RequestBody, params?: CreateRequestOptions<T>): Promise<T | undefined> {
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
	del<T>(data?: RequestBody, params?: CreateRequestOptions<T>): Promise<T | undefined> {
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
	protected convertDataToDB<O>(data: any): O | T {
		return this.dbConverter ? this.dbConverter(data && data.valueOf()) : data;
	}

	/**
	 * Converts the specified data to the internal component format and returns it
	 * @param data
	 */
	protected convertDBToComponent<O>(data: any): O | T {
		return this.componentConverter ? this.componentConverter(data && data.valueOf()) : data;
	}

	/**
	 * Initializes remote data
	 */
	protected initRemoteData(): any | undefined {
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
	@watch({field: 'requestParams', deep: true})
	protected async syncRequestParamsWatcher(value?: Dictionary, oldValue?: Dictionary): Promise<void> {
		$C(value).forEach((el, key) => {
			if (el && oldValue && oldValue[key] && el.toSource() === oldValue.toSource()) {
				return;
			}

			const
				m = key.split(':')[0];

			this[m === 'get' ? 'initLoad' : m](...this.getDefaultRequestParams(key));
		});
	}

	/**
	 * Synchronization for the dataProvider property
	 * @param value
	 */
	@watch({field: 'dataProvider', immediate: true})
	protected async syncDataProviderWatcher(value: string | undefined): Promise<void> {
		if (value) {
			this.dp = new providers[value](this.dataProviderParams);
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
		if (this.dataProvider) {
			this.dp = new providers[this.dataProvider](value);
			await this.initDataListeners();
		}
	}

	/**
	 * Returns default request parameters for the specified method or false
	 * @param method
	 */
	protected getDefaultRequestParams(method: string): [RequestQuery | RequestBody, CreateRequestOptions] | false {
		const [customData, customOpts] = (<any[]>[]).concat(
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

		res[0] = Object.mixin({
			traits: true,
			filter: (el) => isGet ? el != null : el !== undefined
		}, undefined, res[0], customData);

		res[1] = Object.mixin({deep: true}, undefined, res[1], customOpts);

		const
			f = this.requestFilter,
			isEmpty = !$C(res[0]).length();

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
				switch (err.details.response.status) {
					case StatusCodes.FORBIDDEN:
						msg = t`You don't have permission for this operation`;
						break;

					case StatusCodes.NOT_FOUND:
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
	protected createRequest<T>(
		method: ModelMethods,
		data?: RequestBody,
		params?: CreateRequestOptions<T>
	): Promise<T | undefined> {
		if (!this.dp) {
			return <any>Then.resolve();
		}

		const
			p = <CreateRequestOptions<T>>(params || {}),
			asyncFields = ['join', 'label', 'group'],
			reqParams = <CreateRequestOptions<T>>(Object.reject(p, asyncFields)),
			asyncParams = <AsyncOpts>(Object.select(p, asyncFields));

		const
			req = this.async.request<RequestResponseObject>((<Function>this.dp[method])(data, reqParams), asyncParams),
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
				this.onRequestError(err);
				then();
				throw err;
			});
		}

		return req.then((res) => res.data);
	}

	/**
	 * Handler: dataProvider.error
	 *
	 * @emits error(err: Error)
	 * @param err
	 */
	protected onRequestError(err: Error | RequestError): void {
		this.emit('error', err);
	}

	/**
	 * Handler: dataProvider.add
	 * @param data
	 */
	protected onAddData(data: any): void {
		if (data != null) {
			this.db = this.convertDataToDB(data);
		}
	}

	/**
	 * Handler: dataProvider.upd
	 * @param data
	 */
	protected onUpdData(data: any): void {
		if (data != null) {
			this.db = this.convertDataToDB(data);
		}
	}

	/**
	 * Handler: dataProvider.del
	 * @param data
	 */
	protected onDelData(data: any): void {
		this.db = undefined;
	}

	/**
	 * Handler: dataProvider.refresh
	 * @param data
	 */
	protected async onRefreshData(data: T): Promise<void> {
		await this.reload();
	}
}
