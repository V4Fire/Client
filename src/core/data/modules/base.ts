/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { deprecate } from 'core/meta/deprecation';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { concatUrls } from 'core/url';

import Then from 'core/then';
import Async from 'core/async';
import IO, { Socket } from 'core/socket';

import {

	globalOpts,
	CreateRequestOptions,
	MiddlewareParams,
	RequestQuery,
	RequestMethod,
	RequestResponse,
	RequestBody,
	ResolverResult,
	RequestFunctionResponse,
	RequestResponseObject

} from 'core/request';

import iProvider, { ProviderOptions, ModelMethod, DataEvent, EventData } from 'core/data/interface';
import { providers, requestCache, queryMethods, instanceCache, namespace, connectCache } from 'core/data/const';

import ParamsProvider from 'core/data/modules/params';
export * from 'core/data/modules/params';

export const
	$$ = symbolGenerator();

export default abstract class Provider extends ParamsProvider implements iProvider {
	/**
	 * Cache identifier
	 */
	readonly cacheId!: string;

	/** @inheritDoc */
	emitter!: EventEmitter;

	/** @inheritDoc */
	get providerName(): string {
		return this.constructor[namespace];
	}

	/** @inheritDoc */
	get event(): EventEmitter {
		deprecate({name: 'event', type: 'accessor', renamedTo: 'emitter'});
		return this.emitter;
	}

	/**
	 * Map of data events
	 */
	protected readonly eventMap!: Map<unknown, DataEvent>;

	/**
	 * API for async operations
	 */
	protected readonly async!: Async<this>;

	/**
	 * Socket connection
	 */
	protected connection?: Promise<Socket>;

	/**
	 * @param [opts] - additional options
	 */
	protected constructor(opts: ProviderOptions = {}) {
		super();

		const
			paramsForCache = <Dictionary>{...opts},
			extra = opts.extraProviders;

		if (extra) {
			let
				cacheKey;

			// tslint:disable-next-line:prefer-conditional-expression
			if (Object.isFunction(extra)) {
				cacheKey = extra[$$.extraProviderKey] = extra[$$.extraProviderKey] || Math.random();

			} else {
				cacheKey = Object.keys(extra).join();
			}

			if (cacheKey) {
				paramsForCache.extraProviders = cacheKey;

			} else {
				delete paramsForCache.extraProviders;
			}
		}

		const
			id = this.cacheId = `${this.providerName}:${JSON.stringify(paramsForCache)}`,
			cacheVal = instanceCache[id];

		if (cacheVal) {
			return <this>cacheVal;
		}

		this.async = new Async(this);
		this.emitter = new EventEmitter({maxListeners: 1e3, newListener: false});
		this.eventMap = new Map();

		requestCache[id] =
			Object.createDict();

		if (extra) {
			this.setReadonlyParam('extraProviders', extra);
		}

		if (Object.isBoolean(opts.externalRequest)) {
			this.setReadonlyParam('externalRequest', opts.externalRequest);
		}

		if (Object.isBoolean(opts.collapseEvents)) {
			this.setReadonlyParam('collapseEvents', opts.collapseEvents);
		}

		if (opts.socket || this.socketURL) {
			const
				c = this.connect();

			if (c) {
				c.then(this.initSocketBehaviour.bind(this), stderr);
			}
		}

		instanceCache[id] = this;
	}

	/**
	 * Returns an object with authentication parameters
	 * @param params - additional parameters
	 */
	async getAuthParams(params?: Dictionary): Promise<Dictionary> {
		return {};
	}

	/**
	 * Function for request resolving:
	 * this function takes a request URL, request environment and arguments from invoking of the result function and
	 * can returns a modification chunk for the request URL or fully replace it.
	 *
	 * @see [[RequestResolver]]
	 * @param url - request URL
	 * @param params - request parameters
	 */
	resolver<T = unknown>(url: string, params: MiddlewareParams<T>): ResolverResult {
		return undefined;
	}

	/**
	 * Connects to a socket server and returns connection
	 * @param [opts] - additional options for the server
	 */
	async connect(opts?: Dictionary): Promise<Socket | void> {
		await this.async.wait(() => this.socketURL);

		const
			{socketURL: url} = this,
			key = JSON.stringify(opts);

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

				socket.once('connect', () => resolve(socket));
			});
		}
	}

	/** @inheritDoc */
	name(): CanUndef<ModelMethod>;

	/** @inheritDoc */
	name(value: ModelMethod): Provider;
	name(value?: ModelMethod): CanUndef<ModelMethod | Provider> {
		if (value == null) {
			return this.eventName;
		}

		const obj = Object.create(this);
		obj.eventName = value;
		return obj;
	}

	/** @inheritDoc */
	method(): CanUndef<RequestMethod>;

	//** @inheritDoc */
	method(value: RequestMethod): Provider;
	method(value?: RequestMethod): CanUndef<RequestMethod | Provider> {
		if (value == null) {
			return this.customMethod;
		}

		const obj = Object.create(this);
		obj.customMethod = value;
		return obj;
	}

	/** @inheritDoc */
	base(): string;

	/** @inheritDoc */
	base(value: string): Provider;
	base(value?: string): string | Provider {
		if (value == null) {
			return this.baseURL;
		}

		const obj = Object.create(this);
		obj.baseURL = value;
		return obj;
	}

	/** @inheritDoc */
	url(): string;

	/** @inheritDoc */
	url(value: string): Provider;
	url(value?: string): string | Provider {
		if (value == null) {
			return concatUrls(this.baseURL, this.advURL);
		}

		const obj = Object.create(this);
		obj.advURL = value;
		return obj;
	}

	/** @inheritDoc */
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

	/** @inheritDoc */
	get<T = unknown>(query?: RequestQuery, opts?: CreateRequestOptions<T>): RequestResponse {
		if (this.baseGetURL && !this.advURL) {
			this.base(this.baseGetURL);
		}

		const
			url = this.url(),
			nm = this.providerName,
			eventName = this.name(),
			method = this.method() || this.getMethod;

		const mergedOpts = this.mixWithOpts('get', {
			externalRequest: this.externalRequest,
			...opts,
			[queryMethods[method] ? 'query' : 'body']: query,
			method
		});

		const
			req = this.request(url, this.resolver, mergedOpts),
			res = eventName ? this.updateRequest(url, eventName, req) : this.updateRequest(url, req);

		const extraProviders = Object.isFunction(this.extraProviders) ?
			this.extraProviders({opts: mergedOpts, globalOpts}) : this.extraProviders;

		if (extraProviders) {
			const
				composition = {},
				tasks = <Then<RequestResponseObject>[]>[],
				cloneTasks = <Function[]>[];

			for (let keys = Object.keys(extraProviders), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = extraProviders[key] || {};

				const
					nm = el.provider || key,
					as = el.as || key;

				const
					ProviderConstructor = <Dictionary & typeof Provider>providers[nm];

				if (!ProviderConstructor) {
					throw new Error(`Provider "${nm}" is not defined`);
				}

				const
					dp = new ProviderConstructor(el.providerParams);

				tasks.push(
					dp.get(el.query || query, el.request).then(({data}) => {
						cloneTasks.push((composition) => Object.set(composition, as, data && (<object>data).valueOf()));
						return Object.set(composition, as, data);
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

	/** @inheritDoc */
	peek<T = unknown>(query?: RequestQuery, opts?: CreateRequestOptions<T>): RequestResponse {
		if (this.basePeekURL && !this.advURL) {
			this.base(this.basePeekURL);
		}

		const
			url = this.url(),
			eventName = this.name(),
			method = this.method() || this.peekMethod;

		const req = this.request(url, this.resolver, this.mixWithOpts('peek', {
			...opts,
			[queryMethods[method] ? 'query' : 'body']: query,
			method
		}));

		if (eventName) {
			return this.updateRequest(url, eventName, req);
		}

		return this.updateRequest(url, req);
	}

	/** @inheritDoc */
	post<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse {
		const
			url = this.url(),
			eventName = this.name(),
			method = this.method() || 'POST';

		const req = this.request(url, this.resolver, this.mixWithOpts(eventName || 'post', {
			...opts,
			body,
			method
		}));

		if (eventName) {
			return this.updateRequest(url, eventName, req);
		}

		return this.updateRequest(url, req);
	}

	/** @inheritDoc */
	add<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse {
		if (this.baseAddURL && !this.advURL) {
			this.base(this.baseAddURL);
		}

		const
			url = this.url(),
			eventName = this.name() || 'add',
			method = this.method() || this.addMethod;

		return this.updateRequest(url, eventName, this.request(url, this.resolver, this.mixWithOpts('add', {
			...opts,
			body,
			method
		})));
	}

	/** @inheritDoc */
	upd<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse {
		if (this.baseUpdURL && !this.advURL) {
			this.base(this.baseUpdURL);
		}

		const
			url = this.url(),
			eventName = this.name() || 'upd',
			method = this.method() || this.updMethod;

		return this.updateRequest(url, eventName, this.request(url, this.resolver, this.mixWithOpts('upd', {
			...opts,
			body,
			method
		})));
	}

	/** @inheritDoc */
	del<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse {
		if (this.baseDelURL && !this.advURL) {
			this.base(this.baseDelURL);
		}

		const
			url = this.url(),
			eventName = this.name() || 'del',
			method = this.method() || this.delMethod;

		return this.updateRequest(url, eventName, this.request(url, this.resolver, this.mixWithOpts('del', {
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
	 * Returns an event cache key by the specified parameters
	 *
	 * @param event - event name
	 * @param data - event data
	 */
	protected getEventKey(event: string, data: unknown): unknown {
		if (Object.isArray(data) || Object.isDictionary(data)) {
			return `${event}::${Object.fastHash(data)}`;
		}

		return {};
	}

	/**
	 * Sets a provider event to a queue by the specified key
	 *
	 * @param key - event cache key
	 * @param event - event name
	 * @param data - event data
	 *
	 * @emits `drain()`
	 */
	protected setEventToQueue(key: unknown, event: string, data: EventData): void {
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

		}, 0.1.second(), {
			group: 'eventQueue',
			label: $$.setEventToQueue
		});
	}

	/**
	 * Mixes options from class fields and the specified object and returns a new object.
	 * This method takes a name of the model method that have associated options.
	 *
	 * @param method - model method
	 * @param obj - object for mixing
	 */
	protected mixWithOpts<A = unknown, B = unknown>(
		method: ModelMethod,
		obj: CreateRequestOptions<A>
	): CreateRequestOptions<B> {
		obj = obj || {};

		const
			{middlewares, encoders, decoders} = <typeof Provider>this.constructor;

		const merge = (a, b) => {
			a = Object.isFunction(a) ? [a] : a;
			b = Object.isFunction(b) ? [b] : b;
			return {...a, ...b};
		};

		const
			mappedMiddlewares = merge(middlewares, obj.middlewares);

		for (let keys = Object.keys(mappedMiddlewares), i = 0; i < keys.length; i++) {
			const key = keys[i];
			mappedMiddlewares[key] = mappedMiddlewares[key].bind(this);
		}

		return {
			...obj,
			cacheId: this.cacheId,
			middlewares: mappedMiddlewares,

			// tslint:disable-next-line:no-string-literal
			encoder: merge(encoders[method] || encoders['def'], obj.encoder),

			// tslint:disable-next-line:no-string-literal
			decoder: merge(decoders[method] || decoders['def'], obj.decoder)
		};
	}

	/**
	 * Updates the specified request with adding caching, etc.
	 *
	 * @param url - request url
	 * @param factory - request factory
	 */
	protected updateRequest<T = unknown>(url: string, factory: RequestFunctionResponse<T>): RequestResponse<T>;

	/**
	 * Updates the specified request with adding caching, etc.
	 *
	 * @param url - request url
	 * @param event - event name that is fires after resolving of the request
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

				if (this.collapseEvents) {
					this.setEventToQueue(this.getEventKey(e, res.data), e, () => res.data);

				} else {
					this.emitter.emit(e, () => res.data);
				}
			});
		}

		return req;
	}

	/**
	 * Initializes socket behaviour after successful connecting
	 */
	protected async initSocketBehaviour(): Promise<void> {
		return undefined;
	}
}
