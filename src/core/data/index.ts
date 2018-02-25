/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count

import $C = require('collection.js');
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import Async, { AsyncCbOpts } from 'core/async';
import IO, { Socket } from 'core/socket';

import symbolGenerator from 'core/symbol';
import { SocketEvent, ProviderParams } from 'core/data/interface';
import request, {

	globalOpts,
	CreateRequestOptions,
	Middlewares,
	CacheStrategy,
	RequestQuery,
	RequestResponse,
	Response,
	BodyType

} from 'core/request';

export * from 'core/data/interface';
export type RequestFactory = (...args: any[]) => RequestResponse;
export {

	globalOpts,
	CreateRequestOptions,
	Middlewares,
	CacheStrategy,
	RequestQuery,
	RequestResponse,
	Response,
	BodyType

};

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
	 * Request middlewares
	 */
	static middlewares: Middlewares<any, Provider> = {};

	/**
	 * Cache strategy
	 */
	cacheStrategy: CacheStrategy = 'queue';

	/**
	 * Offline cache
	 */
	offlineCache: boolean = false;

	/**
	 * Maximum cache time
	 */
	cacheTime: number = (10).seconds();

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
	 * List of socket events
	 */
	readonly events: string[] = ['add', 'upd', 'del', 'refresh'];

	/**
	 * List of additional providers to listen
	 */
	readonly providers: string[] = [];

	/**
	 * If true, then the provider will be listen all events
	 */
	readonly listenAllEvents!: boolean;

	/**
	 * Event emitter object
	 */
	readonly event!: EventEmitter;

	/**
	 * Global event emitter object
	 * (for all data providers)
	 */
	readonly globalEvent: EventEmitter = globalEvent;

	/**
	 * Map for data events
	 */
	protected eventMap: Map<string, {event: string; data: SocketEvent}> = new Map();

	/**
	 * Async object
	 */
	protected async!: Async<this>;

	/**
	 * Socket connection
	 */
	protected connection?: Promise<Socket>;

	/**
	 * @param [params] - additional parameters
	 */
	constructor(params: ProviderParams = {}) {
		const
			nm = this.constructor.name,
			key = `${nm}:${JSON.stringify(params)}`;

		if (instanceCache[key]) {
			return instanceCache[key];
		}

		reqCache[nm] = Object.createDict();
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
	 * Returns an object with authentication params
	 * @param params - request parameters
	 */
	getAuthParams(params?: Dictionary | undefined): Dictionary {
		return {};
	}

	/**
	 * Connects to a socket server
	 *
	 * @param [params] - additional parameters
	 * @emits ${socketURL}Connect(socket: Socket)
	 * @emits ${socketURL}Reject(err: Error)
	 */
	async connect(params: Dictionary = {}): Promise<Socket | void> {
		await this.async.wait(() => this.socketURL);

		const
			{globalEvent: $e, socketURL: url} = this,
			key = JSON.stringify(params);

		if (!connectCache[key]) {
			connectCache[key] = new Promise((resolve, reject) => {
				const
					socket = IO(url);

				function onClear(err: Error): void {
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
	 * @see Async.on
	 * @param fn
	 * @param [params]
	 */
	attachToSocket(fn: (socket: Socket) => void, params?: AsyncCbOpts): void {
		this.async.on(this.globalEvent, `${this.socketURL}Connect`, fn, params);
		this.connection && this.connection.then(fn);
	}

	/**
	 * Binds events to the current provider from the specified
	 * @param providers
	 */
	bindEvents(...providers: string[]): void {
		this.attachToSocket((socket) => {
			$C(providers).forEach((provider) => {
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
	 * Returns full request URL
	 */
	url(): string;

	/**
	 * Sets advanced URL for requests
	 * @param [value]
	 */
	url(value: string): Provider;
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
	dropCache(): void {
		const nm = this.constructor.name;
		$C(reqCache[nm]).forEach((el) => clearTimeout(el.timeout));
		reqCache[nm] = Object.createDict();
	}

	/**
	 * Gets data
	 *
	 * @param [query]
	 * @param [opts]
	 */
	get<T>(query?: RequestQuery, opts?: CreateRequestOptions<T>): RequestResponse {
		const
			url = this.url(),
			{middlewares} = <any>this.constructor;

		return this.updateRequest(
			url,
			request(url, <CreateRequestOptions<T>>{
				cacheStrategy: this.cacheStrategy,
				cacheTime: this.cacheTime,
				offlineCache: this.offlineCache,
				...opts,
				query,
				middlewares: {...middlewares, ...opts && opts.middlewares},
				method: 'GET'
			})
		);
	}

	/**
	 * Sends a POST request
	 *
	 * @param [body]
	 * @param [opts]
	 */
	post<T>(body?: BodyType, opts?: CreateRequestOptions<T>): RequestResponse {
		const
			url = this.url(),
			{middlewares} = <any>this.constructor;

		return this.updateRequest(
			url,
			request(url, <CreateRequestOptions<T>>{
				...opts,
				body,
				middlewares: {...middlewares, ...opts && opts.middlewares},
				method: 'POST'
			})
		);
	}

	/**
	 * Adds data
	 *
	 * @param [body]
	 * @param [opts]
	 */
	add<T>(body?: BodyType, opts?: CreateRequestOptions<T>): RequestResponse {
		const
			url = this.url(),
			{middlewares} = <any>this.constructor;

		return this.updateRequest(
			url,
			'add',
			request(url, <CreateRequestOptions<T>>{
				...opts,
				body,
				middlewares: {...middlewares, ...opts && opts.middlewares},
				method: 'POST'
			})
		);
	}

	/**
	 * Updates data
	 *
	 * @param [body]
	 * @param [opts]
	 */
	upd<T>(body?: BodyType, opts?: CreateRequestOptions<T>): RequestResponse {
		const
			url = this.url(),
			{middlewares} = <any>this.constructor;

		return this.updateRequest(
			url,
			'upd',
			request(url, <CreateRequestOptions<T>>{
				...opts,
				body,
				middlewares: {...middlewares, ...opts && opts.middlewares},
				method: 'PUT'
			})
		);
	}

	/**
	 * Deletes data
	 *
	 * @param [body]
	 * @param [opts]
	 */
	del<T>(body?: BodyType, opts?: CreateRequestOptions<T>): RequestResponse {
		const
			url = this.url(),
			{middlewares} = <any>this.constructor;

		return this.updateRequest(
			url,
			'del',
			request(url, <CreateRequestOptions<T>>{
				...opts,
				body,
				middlewares: {...middlewares, ...opts && opts.middlewares},
				method: 'DELETE'
			})
		);
	}

	/**
	 * Returns an event instanceCache key by the specified parameters
	 *
	 * @param event
	 * @param data
	 */
	protected getEventKey(event: string, data: Dictionary): string {
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
	protected setEventToQueue(key: string, event: string, data: SocketEvent): void {
		const {
			async: $a,
			event: $e,
			eventMap: $m
		} = this;

		$m.set(key, {event, data});
		$a.setTimeout(() => {
			$C($m).remove((el) => ($e.emit(el.event, el.data), true));
			$e.emit('drain');
		}, 0.1.second(), {label: $$.setEventToQueue});
	}

	/**
	 * Attaches event listeners for the specified socket connection
	 */
	protected listenSocketEvents(): void {
		const
			{async: $a, constructor: {name: nm}} = this;

		this.attachToSocket((socket) => {
			$C(this.events).forEach((type) => {
				$a.on(socket, type, ({instance, type, data}) => {
					const
						f = () => Object.fastClone(data),
						key = this.getEventKey(type, data);

					this.dropCache();
					if (this.listenAllEvents) {
						this.setEventToQueue(key, type, {
							type,
							instance,
							get data(): Dictionary {
								return f();
							}
						});

					} else if (nm && (<string>nm).camelize(false) === instance) {
						this.setEventToQueue(key, type, f);
					}
				}, {
					label: $$.listenSocketEvents
				});
			});

			$a.on(socket, 'alive?', () => socket.emit('alive!'), {
				label: $$.alive
			});

		}, {label: $$.listenSocketEvents});
	}

	/**
	 * Updates the specified request
	 *
	 * @param url - request url
	 * @param factory - request factory
	 */
	protected updateRequest(url: string, factory: RequestFactory): RequestResponse;

	/**
	 * @param url - request url
	 * @param event - event type
	 * @param factory - request factory
	 */
	protected updateRequest(url: string, event: string, factory: RequestFactory): RequestResponse;
	protected updateRequest(url: string, event: string | RequestFactory, factory?: RequestFactory): RequestResponse {
		if (Object.isFunction(event)) {
			factory = event;
			event = '';
		}

		const
			req = (<Function>factory)();

		if (event) {
			const
				e = <string>event;

			req.then((res) => {
				this.setEventToQueue(this.getEventKey(e, res.data), e, () => res.data);
			});
		}

		return req;
	}
}
