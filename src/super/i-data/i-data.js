'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iMessage from 'super/i-message/i-message';
import { abstract, field, watch, wait, params } from 'super/i-block/i-block';
import { component } from 'core/component';
import Provider, { providers } from 'core/data';
import type { $$requestParams } from 'core/request';

const
	$C = require('collection.js'),
	status = require('http-status');

export const
	$$ = new Store();

@component()
export default class iData extends iMessage {
	/**
	 * Data provider name
	 */
	@watch('initLoad')
	dataProvider: ?string;

	/**
	 * Parameters for a data provider instance
	 */
	dataProviderParams: Object = {};

	/**
	 * Data initialization advanced path
	 */
	@watch('initLoad')
	initAdvPath: ?string;

	/**
	 * Initial request filter or if false,
	 * then won't be request for an empty request
	 */
	requestFilter: Function | boolean = true;

	/**
	 * Remote data converter
	 */
	@watch('initLoad')
	dbConverter: ?Function;

	/**
	 * Converter from .db to the block format
	 */
	@watch('initRemoteData')
	blockConverter: ?Function;

	/**
	 * Request parameters
	 */
	@watch('initLoad', {deep: true})
	@field()
	requestParams: Object = {get: {}};

	/**
	 * Block data
	 */
	@watch('initRemoteData')
	@field()
	db: ?Object = null;

	/**
	 * Provider instance
	 * @private
	 */
	@abstract
	_dataProvider: ?Provider;

	/**
	 * Additional options synchronization
	 *
	 * @param value
	 * @param [oldValue]
	 */
	$$p(value: Object, oldValue: ?Object) {
		if (!Object.fastCompare(value, oldValue)) {
			this.initRemoteData();
		}
	}

	/**
	 * Data provider synchronization
	 */
	@params({immediate: true})
	async $$dataProvider(value: ?string) {
		if (value) {
			this._dataProvider = new providers[value](this.dataProviderParams);
			await this.initDataListeners();

		} else {
			this._dataProvider = null;
			this.dataEvent.off({group: 'dataProviderSync'});
		}
	}

	/**
	 * Data provider parameters synchronization
	 * @param [value]
	 */
	async $$dataProviderParams(value: ?Object) {
		if (this.dataProvider) {
			this._dataProvider = new providers[this.dataProvider](value);
			await this.initDataListeners();
		}
	}

	/**
	 * Event emitter object for working with a data provider
	 */
	get dataEvent(): {on: Function, once: Function, off: Function} {
		const
			{async: $a, _dataProvider: $d} = this;

		return {
			on: (event, fnOrParams, ...args) => {
				if (!$d) {
					return;
				}

				return $a.on($d.event, event, fnOrParams, ...args);
			},

			once: (event, fnOrParams, ...args) => {
				if (!$d) {
					return;
				}

				return $a.once($d.event, event, fnOrParams, ...args);
			},

			off: (...args) => {
				if (!$d) {
					return;
				}

				return $a.off(...args);
			}
		};
	}

	/** @override */
	@wait('loading', {label: $$.initLoad, defer: true})
	async initLoad() {
		this.block.status = this.block.statuses.loading;

		if (this._dataProvider && this._dataProvider.baseURL) {
			const
				p = this.getParams('get');

			if (p) {
				Object.assign(p[1], {label: $$.initLoad, join: 'replace'});

				if (this.initAdvPath) {
					this.url(this.initAdvPath);
				}

				try {
					const db = (await this.get(...p)).responseData;
					await new Promise((resolve) => {
						this.async.requestIdleCallback({
							join: true,
							label: $$.initLoad,
							fn: () => {
								this.db = this.getObservableData(this.dbConverter ? this.dbConverter(db) : db);
								resolve();
							}
						});
					});

				} catch (_) {}

			} else {
				this.db = null;
			}
		}

		return super.initLoad();
	}

	/**
	 * Returns a field name by the specified value
	 * @param value
	 */
	getFieldName(value: string): string {
		return this.stage === 'edit' ? `new-${value}`.camelize(false) : value;
	}

	/**
	 * Returns an object to observe by the specified
	 * @param base
	 */
	getObservableData(base: Object): Object {
		return base;
	}

	/**
	 * Initializes data event listeners
	 */
	@wait('ready')
	async initDataListeners() {
		const
			{dataEvent: $e} = this;

		$e.off({
			group: 'dataProviderSync'
		});

		$e.on('add', {
			group: 'dataProviderSync',
			fn: (data) => {
				if (this.getParams('get')) {
					this.onAddData(Object.isFunction(data) ? data() : data);
				}
			}
		});

		$e.on('upd', {
			group: 'dataProviderSync',
			fn: (data) => {
				if (this.getParams('get')) {
					this.onUpdData(Object.isFunction(data) ? data() : data);
				}
			}
		});

		$e.on('del', {
			group: 'dataProviderSync',
			fn: (data) => {
				if (this.getParams('get')) {
					this.onDelData(Object.isFunction(data) ? data() : data);
				}
			}
		});

		$e.on('refresh', {
			group: 'dataProviderSync',
			fn: (data) => this.onRefreshData(Object.isFunction(data) ? data() : data)
		});
	}

	/**
	 * Initializes remote data
	 */
	initRemoteData(): ?any {}

	/**
	 * Sets advanced URL for requests OR returns full URL
	 * @param [value]
	 */
	url(value?: string): this | string {
		if (!value) {
			return this._dataProvider.url(value);
		}

		this._dataProvider.url(value);
		return this;
	}

	/**
	 * Sets base temporary URL for requests
	 * @param [value]
	 */
	base(value?: string): this {
		this._dataProvider.base(value);
		return this;
	}

	/**
	 * Returns an event emitter object for working with a socket connection
	 * @param [params] - advanced parameters
	 */
	connect(params?: Object): {connection: Promise, on: Function, once: Function, off: Function} {
		const
			{async: $a, _dataProvider: $d} = this,
			connection = $d.connect(params);

		return {
			connection,
			on: async (event, fnOrParams, ...args) => {
				if (!$d) {
					return;
				}

				return $a.on(await connection, event, fnOrParams, ...args);
			},

			once: async (event, fnOrParams, ...args) => {
				if (!$d) {
					return;
				}

				return $a.once(await connection, event, fnOrParams, ...args);
			},

			off: (...args) => {
				if (!$d) {
					return;
				}

				return $a.off(...args);
			}
		};
	}

	/* eslint-disable no-unused-vars */

	/**
	 * Executes the specified function with a socket connection
	 *
	 * @see {Provider.attachToSocket}
	 * @param fn
	 * @param [params]
	 */
	attachToSocket(
		fn: (socket: Socket) => void,
		params?: {
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			onClear?: Function
		}

	) {
		this._dataProvider.attachToSocket(...arguments);
	}

	/* eslint-enable no-unused-vars */

	/**
	 * Create a new request to the data provider
	 *
	 * @param method - request method
	 * @param [data]
	 * @param [params]
	 */
	createRequest(
		method: string,
		data?: any,
		params?: $$requestParams & {
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			showProgress: boolean,
			stopProgress: boolean
		} = {}

	): ?Promise<XMLHttpRequest> {
		if (!this._dataProvider) {
			return (async () => undefined)();
		}

		const req = this.async.request(
			() =>
				this._dataProvider[method](data, Object.reject(params, ['join', 'label', 'group'])),

			{
				join: params.join,
				label: params.label,
				group: params.group
			}
		);

		if (this.mods.progress !== 'true') {
			if (params.showProgress !== false) {
				this.setMod('progress', true);
			}

			const then = () => {
				if (params.stopProgress !== false) {
					this.setMod('progress', false);
				}
			};

			req.then(then, (err) => {
				then();
				throw err;
			});
		}

		return req;
	}

	/**
	 * Drops the request cache
	 */
	dropCache() {
		this._dataProvider.dropCache();
	}

	/* eslint-disable no-unused-vars */

	/**
	 * Gets data
	 *
	 * @param [data]
	 * @param [params]
	 */
	get(
		data?: any,
		params?: $$requestParams & {
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			showProgress: boolean,
			stopProgress: boolean
		} = {}

	): ?Promise<XMLHttpRequest> {
		return this.createRequest('get', ...arguments);
	}

	/**
	 * Post data
	 *
	 * @param data
	 * @param [params]
	 */
	post(
		data?: any,
		params?: $$requestParams & {
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			showProgress: boolean,
			stopProgress: boolean
		} = {}

	): ?Promise<XMLHttpRequest> {
		return this.createRequest('post', ...arguments);
	}

	/**
	 * Adds data
	 *
	 * @param data
	 * @param [params]
	 */
	add(
		data?: any,
		params?: $$requestParams & {
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			showProgress: boolean,
			stopProgress: boolean
		} = {}

	): ?Promise<XMLHttpRequest> {
		return this.createRequest('add', ...arguments);
	}

	/**
	 * Updates data
	 *
	 * @param [data]
	 * @param [params]
	 */
	upd(
		data?: any,
		params?: $$requestParams & {
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			showProgress: boolean,
			stopProgress: boolean
		} = {}

	): ?Promise<XMLHttpRequest> {
		return this.createRequest('upd', ...arguments);
	}

	/**
	 * Deletes data
	 *
	 * @param [data]
	 * @param [params]
	 */
	del(
		data?: any,
		params?: $$requestParams & {
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			showProgress: boolean,
			stopProgress: boolean
		} = {}

	): ?Promise<XMLHttpRequest> {
		return this.createRequest('del', ...arguments);
	}

	/* eslint-enable no-unused-vars */

	/**
	 * Returns request parameters for the specified method or false
	 * (for /^get(:|$)/ empty requests if .requestFilter -> true )
	 *
	 * @param method
	 */
	getParams(method: string): Array | boolean {
		const
			p = this.requestParams && this.requestParams[method];

		let res;
		if (Object.isArray(p)) {
			p[1] = p[1] || {};
			res = p;

		} else {
			res = [p, {}];
		}

		if (/^get(:|$)/.test(method)) {
			res[0] = $C(res[0]).filter((el) => el != null).map();
		}

		const
			f = this.requestFilter,
			isEmpty = !$C(res[0]).length();

		if (method === 'get' && (f ? Object.isFunction(f) && !f.call(this, res[0], isEmpty) : isEmpty)) {
			return false;
		}

		return res;
	}

	/**
	 * Returns default texts for server errors
	 * @param err
	 */
	getDefaultErrorText(err: RequestError | Object): string {
		const
			defMsg = t`Unknown server error`;

		if (!err.code || err.type === 'abort') {
			return defMsg;
		}

		let msg;
		const getErrorMessage = () => {
			msg = $C(err).get('args.0.responseData.message');
			msg = msg ? this.t(msg) : defMsg;
		};

		switch (err.type) {
			case 'timeout':
				msg = t`The server doesn't respond, try again later`;
				break;

			case 'invalidStatus':
				switch (err.code) {
					case status.FORBIDDEN:
						msg = t`You don't have permission for this operation`;
						break;

					case status.NOT_FOUND:
						msg = t`The requested resource wasn't found`;
						break;

					default:
						getErrorMessage();
				}

				break;

			default:
				getErrorMessage();
		}

		return msg;
	}

	/**
	 * Handler: _dataProvider.add
	 * @param data
	 */
	onAddData(data: Object) {
		this.db = this.getObservableData(data);
	}

	/**
	 * Handler: _dataProvider.upd
	 * @param data
	 */
	onUpdData(data: Object) {
		this.db = this.getObservableData(data);
	}

	/* eslint-disable no-unused-vars */

	/**
	 * Handler: _dataProvider.del
	 * @param data
	 */
	onDelData(data: Object) {
		this.db = undefined;
	}

	/**
	 * Handler: _dataProvider.refresh
	 * @param data
	 */
	async onRefreshData(data: Object) {
		await this.initLoad();
	}

	/* eslint-enable no-unused-vars */
}
