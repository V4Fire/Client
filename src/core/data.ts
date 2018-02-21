/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import Async from 'core/async';
import IO, { Socket } from 'core/socket';
import symbolGenerator from 'core/symbol';
import { c, r, u, d, RequestParams } from 'core/request';

const globalEvent = new EventEmitter({
	maxListeners: 1e3,
	wildcard: true
});

export const
	providers = Object.createDict(),
	instanceCache = Object.createDict(),
	reqCache = Object.createDict(),
	connectCache = Object.createDict();

export const
	$$ = symbolGenerator();

/**
 * Adds a data provider to the global cache
 * @decorator
 */
export function provider(target: Function): void {
	providers[target.name] = target;
}

/**
 * Base data provider
 */
@provider
export default class Provider {
	/**
	 * List of socket events
	 */
	events: string[] = ['add', 'upd', 'del', 'refresh'];

	/**
	 * List of additional providers to listen
	 */
	providers: string[] = [];

	/**
	 * If true, then the provider will be listen all events
	 */
	listenAllEvents: boolean = false;

	/**
	 * Socket connection url
	 */
	socketURL?: string;

	/**
	 * Base URL for requests
	 */
	baseURL: string = '';

	/**
	 * Advanced URL for requests
	 */
	advURL: string = '';

	/**
	 * Temporary URL for requests
	 */
	tmpURL: string = '';

	/**
	 * instanceCache time
	 */
	cacheTime: number = (10).seconds();

	/**
	 * Event emitter object
	 */
	event: EventEmitter;

	/**
	 * Map for data events
	 */
	eventMap: Map = new Map();

	/**
	 * Global event emitter object
	 * (for all data providers)
	 */
	globalEvent: EventEmitter = globalEvent;

	/**
	 * Async object
	 */
	async: Async<this>;

	/**
	 * Socket connection
	 */
	connection?: Promise<Socket>;

	/* eslint-disable no-unused-vars */

	/**
	 * Returns an object with authentication params
	 * @param params - request parameters
	 */
	getAuthParams(params: Object | undefined): Object | undefined {}

	/* eslint-enable no-unused-vars */

	/**
	 * @param [params] - additional parameters
	 */
	constructor(params?: Object = {}) {
		const
			nm = this.constructor.name,
			key = `${nm}:${JSON.stringify(params)}`;

		if (instanceCache[key]) {
			return instanceCache[key];
		}

		reqCache[nm] = {};
		this.async = new Async(this);
		this.event = new EventEmitter({maxListeners: 1e3, wildcard: true});
		this.listenAllEvents = Boolean(params.listenAllEvents);

		const
			c = this.connect();

		if (c) {
			c.then(
				() => {
					this.listenSocketEvents();
					this.providers.length && this.bindEvents(...this.providers);
				},

				stderr
			);
		}

		instanceCache[key] = this;
	}

	/**
	 * Connects to a socket server
	 *
	 * @param [params] - additional parameters
	 * @emits ${socketURL}Connect(socket: Socket)
	 * @emits ${socketURL}Reject(err: Error)
	 */
	async connect(params: Object = {}): Socket | undefined {
		await this.async.wait(() => this.socketURL);

		const
			{globalEvent: $e, socketURL: url} = this,
			key = JSON.stringify(params);

		if (!connectCache[key]) {
			connectCache[key] = new Promise((resolve, reject) => {
				const
					socket = new IO(url);

				function onClear(err) {
					reject(err);
					delete connectCache[key];
				}

				this.async.worker(socket, {
					label: $$.connect,
					join: true,
					onClear
				});

				socket.once('connect', () => {
					socket
						.once('authenticated', () => {
							resolve(socket);
							$e.emit(`${url}Connect`, socket);
						})

						.once('unauthorized', (err) => {
							socket.close();
							onClear(err);
							$e.emit(`${url}Reject`, err);
						})

						.emit('authentication', this.getAuthParams(params));
				});
			});
		}

		return this.connection = connectCache[key];
	}

	/**
	 * Executes the specified function with a socket connection
	 *
	 * @param fn
	 * @param [join]
	 * @param [label]
	 * @param [group]
	 * @param [onClear]
	 */
	attachToSocket(
		fn: (socket: Socket) => void,
		{join, label, group, onClear}: {
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			onClear?: Function
		} = {}

	) {
		this.async.on(this.globalEvent, `${this.socketURL}Connect`, {
			fn,
			join,
			label,
			group,
			onClear
		});

		if (this.connection) {
			this.connection.then(fn);
		}
	}

	/**
	 * Binds events to the current provider from the specified
	 * @param provider
	 */
	bindEvents(...provider: string) {
		this.attachToSocket((socket) => {
			$C(provider).forEach((provider) => {
				$C(this.events).forEach((type) => {
					socket.on(type, ({instance, type, data}) => {
						if (instance === provider) {
							this.dropCache();
							this.event.emit(type, data);
						}
					});
				});
			});
		}, {label: $$.bindEvents});
	}

	/**
	 * Returns an event instanceCache key by the specified parameters
	 *
	 * @param event
	 * @param data
	 */
	getEventKey(event: string, data: Object): string {
		return `${event}::${JSON.stringify(data)}`;
	}

	/**
	 * Sets an event to the queue by the specified key
	 *
	 * @param key
	 * @param event - event name
	 * @param data - event data
	 * @emits drain()
	 */
	setEventToQueue(key: string, event: string, data: Object | Function) {
		const
			{event: $e, eventMap: $m} = this;

		$m.set(key, {event, data});
		this.async.setTimeout({
			label: $$.setEventToQueue,
			fn: () => {
				$C($m).remove((el) => ($e.emit(el.event, el.data), true));
				$e.emit('drain');
			}

		}, 0.1.second());
	}

	/**
	 * Attaches event listeners for the specified socket connection
	 */
	listenSocketEvents() {
		const
			{async: $a} = this;

		this.attachToSocket((socket) => {
			$C(this.events).forEach((type) => {
				$a.on(socket, type, {
					label: $$.listenSocketEvents,
					fn: ({instance, type, data}) => {
						const
							f = () => Object.fastClone(data),
							key = this.getEventKey(type, data);

						this.dropCache();
						if (this.listenAllEvents) {
							this.setEventToQueue(key, type, {
								type,
								instance,
								get data() {
									return f();
								}
							});

						} else if (this.constructor.name.camelize(false) === instance) {
							this.setEventToQueue(key, type, f);
						}
					}
				});
			});

			$a.on(socket, 'alive?', {
				label: $$.alive,
				fn: () => socket.emit('alive!')
			});

		}, {label: $$.listenSocketEvents});
	}

	/**
	 * Adds session headers to request parameters
	 *
	 * @param url - request url
	 * @param params
	 */
	addSession(url, params = {}): Object {
		return params;
	}

	/**
	 * Updates the specified request
	 *
	 * @param url - request url
	 * @param factory - request factory
	 * @param [event] - event type
	 */
	updateRequest(url: string, factory: () => Promise<XMLHttpRequest>, event?: string): Promise<XMLHttpRequest> {
		const
			req = factory();

		if (event) {
			req.then((res) => this.setEventToQueue(this.getEventKey(event, res.responseData), event, () => res.responseData));
		}

		return req;
	}

	/**
	 * Sets advanced URL for requests OR returns full URL
	 * @param [value]
	 */
	url(value?: string): Provider | string {
		if (!value) {
			const tmp = `${API}/${this.tmpURL || this.baseURL}/${this.advURL}`;
			this.advURL = '';
			this.tmpURL = '';
			return tmp;
		}

		this.advURL = value;
		return this;
	}

	/**
	 * Sets base temporary URL for requests
	 * @param [value]
	 */
	base(value: string): Provider {
		this.tmpURL = value;
		return this;
	}

	/**
	 * Drops the request cache
	 */
	dropCache() {
		const nm = this.constructor.name;
		$C(reqCache[nm]).forEach((el) => clearTimeout(el.timeout));
		reqCache[nm] = {};
	}

	/**
	 * Gets data
	 *
	 * @param [data]
	 * @param [params]
	 */
	get(data?: any, params?: RequestParams): Promise<XMLHttpRequest> {
		const
			url = this.url(),
			query = `${url}?${Object.toQueryString(data || {})}`,
			instanceCache = reqCache[this.constructor.name][query];

		if (instanceCache) {
			if (!instanceCache.aborted) {
				return instanceCache;
			}

			clearTimeout(instanceCache.timeout);
		}

		const
			clear = () => delete reqCache[query],
			req = this.updateRequest(url, () => r(url, data, this.addSession(url, params)));

		req.then(() => {
			reqCache[query] = req;
			clearTimeout(req.timeout);
			req.timeout = setTimeout(clear, this.cacheTime);
		}, clear);

		return req;
	}

	/**
	 * Sends a POST request
	 *
	 * @param data
	 * @param [params]
	 */
	post(data: any, params?: RequestParams): Promise<XMLHttpRequest> {
		const url = this.url();
		return this.updateRequest(url, () => c(url, data, this.addSession(url, params)));
	}

	/**
	 * Adds data
	 *
	 * @param data
	 * @param [params]
	 */
	add(data: any, params?: RequestParams): Promise<XMLHttpRequest> {
		const url = this.url();
		return this.updateRequest(url, () => c(url, data, this.addSession(url, params)), 'add');
	}

	/**
	 * Updates data
	 *
	 * @param [data]
	 * @param [params]
	 */
	upd(data?: any, params?: RequestParams): Promise<XMLHttpRequest> {
		const url = this.url();
		return this.updateRequest(url, () => u(url, data, this.addSession(url, params)), 'upd');
	}

	/**
	 * Deletes data
	 *
	 * @param [data]
	 * @param [params]
	 */
	del(data?: any, params?: RequestParams): Promise<XMLHttpRequest> {
		const url = this.url();
		return this.updateRequest(url, () => d(url, data, this.addSession(url, params)), 'del');
	}
}
