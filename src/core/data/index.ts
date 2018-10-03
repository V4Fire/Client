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

import symbolGenerator from 'core/symbol';
import Async, { AsyncCbOpts } from 'core/async';
import IO, { Socket } from 'core/socket';

import { concatUrls } from 'core/url';
import { ModelMethods, SocketEvent, ProviderParams } from 'core/data/interface';
import request, {

	globalOpts,
	CreateRequestOptions,
	Middlewares,
	CacheStrategy,
	RequestQuery,
	RequestMethods,
	RequestResponse,
	RequestResponseObject,
	Response,
	RequestBody,
	ResolverResult,
	Decoders,
	Encoders

} from 'core/request';

export * from 'core/data/interface';
export type RequestFactory = (...args: any[]) => RequestResponse;

export { RequestMethods, RequestError } from 'core/request';
export {

	globalOpts,
	CreateRequestOptions,
	Middlewares,
	CacheStrategy,
	RequestQuery,
	RequestResponse,
	RequestResponseObject,
	Response,
	RequestBody

};

export type EncodersTable = Record<ModelMethods | 'def', Encoders> | {};
export type DecodersTable = Record<ModelMethods | 'def', Decoders> | {};

const globalEvent = new EventEmitter({
	maxListeners: 1e3,
	wildcard: true
});

export const
	providers: Dictionary<typeof Provider> = Object.createDict(),
	instanceCache: Dictionary<Provider> = Object.createDict(),
	requestCache: Dictionary<Dictionary<RequestResponseObject>> = Object.createDict(),
	connectCache: Dictionary<Promise<Socket>> = Object.createDict();

export const
	$$ = symbolGenerator();

/**
 * Adds a data provider to the global cache
 *
 * @decorator
 * @param namespace
 */
export function provider(namespace: string): (target: Function) => void;
export function provider(target: Function): void;
export function provider(nmsOrFn: Function | string): Function | void {
	if (Object.isString(nmsOrFn)) {
		return (target) => {
			providers[`${nmsOrFn}.${target.name}`] = target;
		};
	}

	providers[nmsOrFn.name] = <any>nmsOrFn;
}

/**
 * Base data provider
 */
@provider
export default class Provider {
	/**
	 * Request Function
	 */
	static readonly request: typeof request = request;

	/**
	 * Request middlewares
	 */
	static readonly middlewares: Middlewares = {};

	/**
	 * Data encoders
	 */
	static readonly encoders: EncodersTable = {};

	/**
	 * Data decoders
	 */
	static readonly decoders: DecodersTable = {};

	/**
	 * HTTP method for .get()
	 */
	getMethod: RequestMethods = 'GET';

	/**
	 * HTTP method for .peek()
	 */
	peekMethod: RequestMethods = 'HEAD';

	/**
	 * HTTP method for .add()
	 */
	addMethod: RequestMethods = 'POST';

	/**
	 * HTTP method for .upd()
	 */
	updMethod: RequestMethods = 'PUT';

	/**
	 * HTTP method for .del()
	 */
	delMethod: RequestMethods = 'DELETE';

	/**
	 * Base URL for requests
	 */
	baseURL: string = '';

	/**
	 * Base URL for .get()
	 */
	baseGetURL: string = '';

	/**
	 * Base URL for .peek()
	 */
	basePeekURL: string = '';

	/**
	 * Base URL for .add()
	 */
	baseAddURL: string = '';

	/**
	 * Base URL for .upd()
	 */
	baseUpdURL: string = '';

	/**
	 * Base URL for .del()
	 */
	baseDelURL: string = '';

	/**
	 * Advanced URL for requests
	 */
	advURL: string = '';

	/**
	 * Temporary URL for requests
	 */
	tmpURL: string = '';

	/**
	 * Socket connection url
	 */
	socketURL?: string;

	/**
	 * Temporary model event name for requests
	 */
	tmpEventName: ModelMethods | undefined;

	/**
	 * Temporary request method
	 */
	tmpMethod: RequestMethods | undefined;

	/**
	 * Cache id
	 */
	readonly cacheId: string;

	/**
	 * External request mode
	 */
	readonly externalRequest: boolean = false;

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
	 * Alias for the request function
	 */
	get request(): typeof request {
		return (<typeof Provider>this.constructor).request;
	}

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
			key = this.cacheId = `${nm}:${JSON.stringify(params)}`;

		if (instanceCache[key]) {
			return instanceCache[key];
		}

		requestCache[nm] = Object.createDict();
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
	 * @param params - additional parameters
	 */
	getAuthParams(params?: Dictionary | undefined): Dictionary {
		return {};
	}

	/**
	 * Request resolve function
	 *
	 * @param url - request url
	 * @param opts - request params
	 */
	resolver(url: string, opts: CreateRequestOptions): ResolverResult {
		return undefined;
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

				if (!socket) {
					return;
				}

				function onClear(err: any): void {
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
	attachToSocket(fn: (socket: Socket) => void, params?: AsyncCbOpts<this>): void {
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
	 * Returns a custom event name for the operation
	 */
	name(): ModelMethods | undefined;

	/**
	 * Sets a custom event name for the operation
	 * @param [value]
	 */
	name(value: ModelMethods): Provider;
	name(value?: ModelMethods): Provider | ModelMethods | undefined {
		if (value == null) {
			const val = this.tmpEventName;
			this.tmpEventName = undefined;
			return val;
		}

		this.tmpEventName = value;
		return this;
	}

	/**
	 * Returns a custom request method for the operation
	 */
	method(): RequestMethods | undefined;

	/**
	 * Sets a custom request method for the operation
	 * @param [value]
	 */
	method(value: RequestMethods): Provider;
	method(value?: RequestMethods): Provider | RequestMethods | undefined {
		if (value == null) {
			const val = this.tmpMethod;
			this.tmpMethod = undefined;
			return val;
		}

		this.tmpMethod = value;
		return this;
	}

	/**
	 * Returns full request URL
	 */
	url(): string;

	/**
	 * Sets an advanced URL for requests
	 * @param [value]
	 */
	url(value: string): Provider;
	url(value?: string): Provider | string {
		if (value == null) {
			const tmp = concatUrls(this.tmpURL || this.baseURL, this.advURL);
			this.advURL = '';
			this.tmpURL = '';
			return tmp;
		}

		this.advURL = value;
		return this;
	}

	/**
	 * Sets a base temporary URL for requests
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
		$C(requestCache[nm]).forEach((el) => el.dropCache());
		requestCache[nm] = Object.createDict();
	}

	/**
	 * Gets data
	 *
	 * @param [query]
	 * @param [opts]
	 */
	get<T>(query?: RequestQuery, opts?: CreateRequestOptions<T>): RequestResponse {
		if (this.baseGetURL && !this.advURL) {
			this.base(this.baseGetURL);
		}

		const
			url = this.url(),
			eventName = this.name(),
			method = this.method() || this.getMethod;

		const req = this.request(url, this.resolver, this.mergeToOpts('get', {
			externalRequest: this.externalRequest,
			...opts,
			query,
			method
		}));

		if (eventName) {
			return this.updateRequest(url, eventName, req);
		}

		return this.updateRequest(url, req);
	}

	/**
	 * Peeks data
	 *
	 * @param [query]
	 * @param [opts]
	 */
	peek<T>(query?: RequestQuery, opts?: CreateRequestOptions<T>): RequestResponse {
		if (this.basePeekURL && !this.advURL) {
			this.base(this.basePeekURL);
		}

		const
			url = this.url(),
			eventName = this.name(),
			method = this.method() || this.peekMethod;

		const req = this.request(url, this.resolver, this.mergeToOpts('peek', {
			...opts,
			query,
			method
		}));

		if (eventName) {
			return this.updateRequest(url, eventName, req);
		}

		return this.updateRequest(url, req);
	}

	/**
	 * Sends a POST request
	 *
	 * @param [body]
	 * @param [opts]
	 */
	post<T>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse {
		const
			url = this.url(),
			eventName = this.name(),
			method = this.method() || 'POST';

		const req = this.request(url, this.resolver, this.mergeToOpts(eventName || 'post', {
			...opts,
			body,
			method
		}));

		if (eventName) {
			return this.updateRequest(url, eventName, req);
		}

		return this.updateRequest(url, req);
	}

	/**
	 * Adds data
	 *
	 * @param [body]
	 * @param [opts]
	 */
	add<T>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse {
		if (this.baseAddURL && !this.advURL) {
			this.base(this.baseAddURL);
		}

		const
			url = this.url(),
			eventName = this.name() || 'add',
			method = this.method() || this.addMethod;

		return this.updateRequest(url, eventName, this.request(url, this.resolver, this.mergeToOpts('add', {
			...opts,
			body,
			method
		})));
	}

	/**
	 * Updates data
	 *
	 * @param [body]
	 * @param [opts]
	 */
	upd<T>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse {
		if (this.baseUpdURL && !this.advURL) {
			this.base(this.baseUpdURL);
		}

		const
			url = this.url(),
			eventName = this.name() || 'upd',
			method = this.method() || this.updMethod;

		return this.updateRequest(url, eventName, this.request(url, this.resolver, this.mergeToOpts('upd', {
			...opts,
			body,
			method
		})));
	}

	/**
	 * Deletes data
	 *
	 * @param [body]
	 * @param [opts]
	 */
	del<T>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse {
		if (this.baseDelURL && !this.advURL) {
			this.base(this.baseDelURL);
		}

		const
			url = this.url(),
			eventName = this.name() || 'upd',
			method = this.method() || this.delMethod;

		return this.updateRequest(url, eventName, this.request(url, this.resolver, this.mergeToOpts('del', {
			...opts,
			body,
			method
		})));
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
	 * Merge options from class fields to the specified options object and returns new options
	 *
	 * @param method - model method
	 * @param opts
	 */
	protected mergeToOpts(method: ModelMethods, opts: CreateRequestOptions): CreateRequestOptions {
		opts = opts || {};

		const
			{middlewares, encoders, decoders} = <typeof Provider>this.constructor;

		const merge = (a, b) => {
			a = Object.isFunction(a) ? [a] : a;
			b = Object.isFunction(b) ? [b] : b;
			return {...a, ...b};
		};

		return {
			...opts,
			cacheId: this.cacheId,
			middlewares: $C(merge(middlewares, opts.middlewares)).map((fn) => fn.bind(this)),
			// tslint:disable-next-line:no-string-literal
			encoder: merge(encoders[method] || encoders['def'], opts.encoder),
			// tslint:disable-next-line:no-string-literal
			decoder: merge(decoders[method] || decoders['def'], opts.decoder)
		};
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
				const
					{ctx} = res;

				if (ctx.canCache) {
					requestCache[this.constructor.name][res.cacheKey] = res;
				}

				this.setEventToQueue(this.getEventKey(e, res.data), e, () => res.data);
			});
		}

		return req;
	}
}
