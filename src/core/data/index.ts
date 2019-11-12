/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

//#set runtime.core/data

import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import Then from 'core/then';
import symbolGenerator from 'core/symbol';
import Async, { AsyncCbOpts } from 'core/async';
import IO, { Socket } from 'core/socket';
import { select, SelectParams } from 'core/object';

import { concatUrls } from 'core/url';
import { ModelMethods, SocketEvent, ProviderParams, FunctionalExtraProviders, Mocks } from 'core/data/interface';
import { providers } from 'core/data/const';
import { attachMock } from 'core/data/middlewares';

import request, {

	globalOpts,
	CreateRequestOpts,
	Middlewares,
	MiddlewareParams,
	CacheStrategy,
	RequestQuery,
	RequestMethods,
	RequestResponse,
	RequestResponseObject,
	RequestFunctionResponse,
	Response,
	RequestBody,
	ResolverResult,
	Decoders,
	Encoders

} from 'core/request';

export * from 'core/data/const';
export * from 'core/data/interface';
export * from 'core/data/middlewares';

export { RequestMethods, RequestError } from 'core/request';
export {

	globalOpts,
	Socket,
	CreateRequestOpts,

	Mocks,
	Middlewares,
	MiddlewareParams,

	CacheStrategy,
	RequestQuery,
	RequestResponse,
	RequestResponseObject,
	RequestFunctionResponse,
	Response,
	RequestBody

};

export type EncodersTable = Record<ModelMethods | 'def', Encoders> | {};
export type DecodersTable = Record<ModelMethods | 'def', Decoders> | {};

const globalEvent = new EventEmitter({
	maxListeners: 1e3,
	newListener: false,
	wildcard: true
});

const
	instanceCache: Dictionary<Provider> = Object.createDict(),
	requestCache: Dictionary<Dictionary<RequestResponseObject>> = Object.createDict(),
	connectCache: Dictionary<Promise<Socket>> = Object.createDict();

export const
	$$ = symbolGenerator();

/**
 * Adds a data provider to the global cache with the specified namespace
 *
 * @decorator
 * @param namespace
 */
export function provider(namespace: string): (target: Function) => void;

/**
 * Adds a data provider to the global cache
 *
 * @decorator
 * @param target
 */
export function provider(target: Function): void;
// tslint:disable-next-line:completed-docs
export function provider(nmsOrFn: Function | string): Function | void {
	if (Object.isString(nmsOrFn)) {
		return (target) => {
			const nms = target[$$.namespace] = `${nmsOrFn}.${target.name}`;
			providers[nms] = target;
		};
	}

	nmsOrFn[$$.namespace] = nmsOrFn.name;
	providers[nmsOrFn.name] = <typeof Provider>nmsOrFn;
}

const queryMethods = {
	GET: true,
	HEAD: true
};

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
	static readonly middlewares: Middlewares = {
		attachMock
	};

	/**
	 * Data encoders
	 */
	static readonly encoders: EncodersTable = {};

	/**
	 * Data decoders
	 */
	static readonly decoders: DecodersTable = {};

	/**
	 * Finds an element from an object by the specified params
	 *
	 * @param obj
	 * @param params
	 */
	static select<T = unknown>(obj: unknown, params: SelectParams): CanUndef<T> {
		return select(obj, params);
	}

	/**
	 * Request mock objects
	 */
	mocks?: Mocks;

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
	tmpEventName: CanUndef<ModelMethods>;

	/**
	 * Temporary request method
	 */
	tmpMethod: CanUndef<RequestMethods>;

	/**
	 * Cache id
	 */
	readonly cacheId: string;

	/**
	 * External request mode
	 */
	readonly externalRequest: boolean = false;

	/**
	 * List of additional data providers for the get request
	 */
	readonly extraProviders?: FunctionalExtraProviders;

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
	readonly listenAllEvents: boolean = false;

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
	 * Alias for the request function
	 */
	get request(): typeof request {
		return (<typeof Provider>this.constructor).request;
	}

	/**
	 * Name of the provider
	 */
	get providerName(): string {
		return this.constructor[$$.namespace];
	}

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
			paramsForCache = <Dictionary>{...params},
			extra = params.extraProviders;

		if (extra) {
			const
				extraVal = Object.isFunction(extra) ? extra() : extra,
				extraValKeys = extraVal && Object.keys(extraVal);

			if (extraValKeys && extraValKeys.length) {
				paramsForCache.extraProviders = extraValKeys;
			}
		}

		const
			id = this.cacheId = `${this.providerName}:${JSON.stringify(paramsForCache)}`,
			cacheVal = instanceCache[id];

		if (cacheVal) {
			return cacheVal;
		}

		requestCache[id] = Object.createDict();
		this.async = new Async(this);
		this.event = new EventEmitter({maxListeners: 1e3, newListener: false});

		if (Object.isBoolean(params.listenAllEvents)) {
			this.setReadonlyParam('listenAllEvents', params.listenAllEvents);
		}

		if (Object.isBoolean(params.externalRequest)) {
			this.setReadonlyParam('externalRequest', params.externalRequest);
		}

		if (extra) {
			this.setReadonlyParam('extraProviders', extra);
		}

		if (params.socket || this.socketURL) {
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
		}

		instanceCache[id] = this;
	}

	/**
	 * Returns an object with authentication params
	 * @param params - additional parameters
	 */
	async getAuthParams(params?: Dictionary): Promise<Dictionary> {
		return {};
	}

	/**
	 * Request resolve function
	 *
	 * @param url - request url
	 * @param opts - request params
	 */
	resolver<T = unknown>(url: string, opts: MiddlewareParams<T>): ResolverResult {
		return undefined;
	}

	//#if runtime has socket

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

				function onClear(err: unknown): void {
					reject(err);
					delete connectCache[key];
				}

				this.async.worker(socket, {
					label: $$.connect,
					join: true,
					onClear
				});

				socket.once('connect', async () => {
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

						.emit('authentication', await this.getAuthParams(params));
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
			for (let i = 0; i < providers.length; i++) {
				const
					provider = providers[i];

				for (let i = 0; i < this.events.length; i++) {
					const
						type = this.events[i];

					socket.on(type, ({instance, type, data}) => {
						if (instance === provider) {
							this.dropCache();
							this.event.emit(type, data);
						}
					});
				}
			}
		}, {label: $$.bindEvents});
	}

	//#endif

	/**
	 * Returns a custom event name for the operation
	 */
	name(): CanUndef<ModelMethods>;

	/**
	 * Sets a custom event name for the operation
	 * @param [value]
	 */
	name(value: ModelMethods): Provider;
	name(value?: ModelMethods): CanUndef<Provider | ModelMethods> {
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
	method(): CanUndef<RequestMethods>;

	/**
	 * Sets a custom request method for the operation
	 * @param [value]
	 */
	method(value: RequestMethods): Provider;
	method(value?: RequestMethods): CanUndef<Provider | RequestMethods> {
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
		const
			cache = requestCache[this.cacheId];

		if (cache) {
			for (let keys = Object.keys(cache), i = 0; i < keys.length; i++) {
				const
					obj = cache[keys[i]];

				if (obj) {
					obj.dropCache();
				}
			}
		}

		requestCache[this.cacheId] = Object.createDict();
	}

	/**
	 * Gets data
	 *
	 * @param [query]
	 * @param [opts]
	 */
	get<T = unknown>(query?: RequestQuery, opts?: CreateRequestOpts<T>): RequestResponse {
		if (this.baseGetURL && !this.advURL) {
			this.base(this.baseGetURL);
		}

		const
			url = this.url(),
			nm = this.providerName,
			eventName = this.name(),
			method = this.method() || this.getMethod;

		const req = this.request(url, this.resolver, this.mergeToOpts('get', {
			externalRequest: this.externalRequest,
			...opts,
			[queryMethods[method] ? 'query' : 'body']: query,
			method
		}));

		const
			res = eventName ? this.updateRequest(url, eventName, req) : this.updateRequest(url, req),
			extraProviders = Object.isFunction(this.extraProviders) ? this.extraProviders() : this.extraProviders;

		if (extraProviders) {
			const
				composition = {},
				tasks = <Then[]>[],
				cloneTasks = <Function[]>[];

			for (let keys = Object.keys(extraProviders), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = extraProviders[key] || {},
					ProviderConstructor = <typeof Provider>providers[key];

				if (!ProviderConstructor) {
					throw new Error(`Provider "${key}" is not defined`);
				}

				const
					dp = new ProviderConstructor(el.providerParams);

				tasks.push(
					dp.get(el.query || query, el.requestOpts).then(({data}) => {
						cloneTasks.push((composition) => Object.set(composition, key, data && (<object>data).valueOf()));
						return Object.set(composition, key, data);
					})
				);
			}

			return res.then(
				(res) => Promise.all(tasks).then(() => {
					const
						data = res.data;

					cloneTasks.push((composition) => Object.set(composition, nm, data && (<object>data).valueOf()));
					Object.set(composition, nm, data);

					composition.valueOf = () => {
						const
							clone = {};

						for (let i = 0; i < cloneTasks.length; i++) {
							cloneTasks[i](clone);
						}

						return clone;
					};

					res.data = Object.freeze(composition);
					return res;
				}),

				null,

				() => {
					for (let i = 0; i < tasks.length; i++) {
						tasks[i].abort();
					}
				}
			);
		}

		return res;
	}

	/**
	 * Peeks data
	 *
	 * @param [query]
	 * @param [opts]
	 */
	peek<T = unknown>(query?: RequestQuery, opts?: CreateRequestOpts<T>): RequestResponse {
		if (this.basePeekURL && !this.advURL) {
			this.base(this.basePeekURL);
		}

		const
			url = this.url(),
			eventName = this.name(),
			method = this.method() || this.peekMethod;

		const req = this.request(url, this.resolver, this.mergeToOpts('peek', {
			...opts,
			[queryMethods[method] ? 'query' : 'body']: query,
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
	post<T = unknown>(body?: RequestBody, opts?: CreateRequestOpts<T>): RequestResponse {
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
	add<T = unknown>(body?: RequestBody, opts?: CreateRequestOpts<T>): RequestResponse {
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
	upd<T = unknown>(body?: RequestBody, opts?: CreateRequestOpts<T>): RequestResponse {
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
	del<T = unknown>(body?: RequestBody, opts?: CreateRequestOpts<T>): RequestResponse {
		if (this.baseDelURL && !this.advURL) {
			this.base(this.baseDelURL);
		}

		const
			url = this.url(),
			eventName = this.name() || 'del',
			method = this.method() || this.delMethod;

		return this.updateRequest(url, eventName, this.request(url, this.resolver, this.mergeToOpts('del', {
			...opts,
			body,
			method
		})));
	}

	/**
	 * Sets a value by the specified key to the provider as readonly
	 */
	protected setReadonlyParam(key: string, val: unknown): void {
		Object.defineProperty(this, key, {
			configurable: true,
			get: () => val,
			set: (v) => v
		});
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
			for (let o = $m.values(), val = o.next(); !val.done; val = o.next()) {
				const el = val.value;
				$e.emit(el.event, el.data);
			}

			$m.clear();
			$e.emit('drain');
		}, 0.1.second(), {label: $$.setEventToQueue});
	}

	//#if runtime has socket

	/**
	 * Attaches event listeners for the specified socket connection
	 */
	protected listenSocketEvents(): void {
		const
			{async: $a, constructor: {name: nm}} = this;

		this.attachToSocket((socket) => {
			const label = {
				label: $$.listenSocketEvents
			};

			for (let i = 0; i < this.events.length; i++) {
				const
					type = this.events[i];

				$a.on(socket, type, ({instance, type, data}) => {
					const
						f = () => Object.fastClone(data),
						key = this.getEventKey(type, data);

					this
						.dropCache();

					if (this.listenAllEvents) {
						this.setEventToQueue(key, type, {
							type,
							instance,
							get data(): Dictionary {
								return f();
							}
						});

					} else if (nm.camelize(false) === instance) {
						this.setEventToQueue(key, type, f);
					}

				}, label);
			}

			$a.on(socket, 'alive?', () => socket.emit('alive!'), {
				label: $$.alive
			});

		}, {label: $$.listenSocketEvents});
	}

	//#endif

	/**
	 * Merge options from class fields to the specified options object and returns new options
	 *
	 * @param method - model method
	 * @param opts
	 */
	protected mergeToOpts<A = unknown, B = unknown>(
		method: ModelMethods,
		opts: CreateRequestOpts<A>
	): CreateRequestOpts<B> {
		opts = opts || {};

		const
			{middlewares, encoders, decoders} = <typeof Provider>this.constructor;

		const merge = (a, b) => {
			a = Object.isFunction(a) ? [a] : a;
			b = Object.isFunction(b) ? [b] : b;
			return {...a, ...b};
		};

		const
			mappedMiddlewares = merge(middlewares, opts.middlewares);

		for (let keys = Object.keys(mappedMiddlewares), i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			mappedMiddlewares[key] = mappedMiddlewares[key].bind(this);
		}

		return {
			...opts,
			cacheId: this.cacheId,
			middlewares: mappedMiddlewares,
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
	protected updateRequest<T = unknown>(url: string, factory: RequestFunctionResponse<T>): RequestResponse<T>;

	/**
	 * @param url - request url
	 * @param event - event type
	 * @param factory - request factory
	 */
	protected updateRequest<T = unknown>(
		url: string,
		event: string,
		factory: RequestFunctionResponse<T>
	): RequestResponse<T>;

	protected updateRequest(
		url: string,
		event: string | RequestFunctionResponse,
		factory?: RequestFunctionResponse
	): RequestResponse {
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
					{ctx} = res,
					cache = requestCache[this.cacheId];

				if (ctx.canCache && cache) {
					cache[res.cacheKey] = res;
				}

				this.setEventToQueue(this.getEventKey(e, res.data), e, () => res.data);
			});
		}

		return req;
	}
}
