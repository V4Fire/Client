/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { deprecate } from 'core/meta/deprecation';
import { concatUrls } from 'core/url';

import request, {

	CreateRequestOptions,
	Middlewares,
	MiddlewareParams,
	RequestQuery,
	RequestMethod,
	RequestResponse,
	RequestBody,
	ResolverResult

} from 'core/request';

import { Socket } from 'core/socket';
import Async, { AsyncCbOptions } from 'core/async';

import { select, SelectParams } from 'core/object';
import { emitter, requestCache } from 'core/data/const';

import {

	ModelMethod,
	FunctionalExtraProviders,
	EncodersMap,
	DecodersMap,
	Mocks

} from 'core/data/interface';

export * from 'core/data/interface/types';

export const
	$$ = symbolGenerator();

export default abstract class Provider {
	/**
	 * The transport function for a request.
	 * Basically, you can use an overload of the request API for flexibly extending.
	 *
	 * @example
	 * ```js
	 * import request from 'core/request';
	 *
	 * class Parent extends Provider {
	 *   request: request({responseType: 'json'})
	 * }
	 *
	 * class Children extends Parent {
	 *   request: Parent.request({credentials: true})
	 * }
	 * ```
	 */
	static readonly request: typeof request = request;

	/**
	 * A sequence of middlewares that is provided to the request function.
	 * An object form is easily for extending, bur you can choose any different form.
	 *
	 * @example
	 * ```js
	 * import request from 'core/request';
	 *
	 * class Parent extends Provider {
	 *   middlewares: {
	 *     attachGeoCoords() { ... }
	 *   }
	 * }
	 *
	 * class Children extends Parent {
	 *   middlewares: {
	 *     ...Parent.middlewares,
	 *     addSession() {
	 *       ...
	 *     }
	 *   }
	 * }
	 * ```
	 */
	static readonly middlewares: Middlewares = {};

	/**
	 * Map of data encoder sequences.
	 * The key of a map element is represents a name of the provider method: 'get', 'post', etc.
	 * The value of a map element is represents a sequence of encoders for the specified provider method.
	 *
	 * @example
	 * ```js
	 * class MyProvider extends Provider {
	 *   encoders: {
	 *     get: [convertToJSON],
	 *     upd: [convertToBuffer]
	 *   }
	 * }
	 * ```
	 */
	static readonly encoders: EncodersMap = {};

	/**
	 * Map of data decoder sequences.
	 * The key of a map element is represents a name of the provider method: 'get', 'post', etc.
	 * The value of a map element is represents a sequence of decoders for the specified provider method.
	 *
	 * @example
	 * ```js
	 * class MyProvider extends Provider {
	 *   decoders: {
	 *     get: [fromJSON],
	 *     upd: [fromBuffer]
	 *   }
	 * }
	 * ```
	 */
	static readonly decoders: DecodersMap = {};

	/**
	 * Finds an element from an object by the specified params
	 *
	 * @param obj
	 * @param params
	 *
	 * @example
	 * ```js
	 * class MyProvider extends Provider {}
	 * MyProvider.select([{test: 1}], {where: {test: 1}}) // {test: 1}
	 * ```
	 */
	static select<T = unknown>(obj: unknown, params: SelectParams): CanUndef<T> {
		return select(obj, params);
	}

	/**
	 * Name of the provider
	 */
	readonly providerName!: string;

	/**
	 * Request mock objects.
	 */
	mocks?: Mocks;

	/**
	 * HTTP method for .get()
	 */
	getMethod: RequestMethod = 'GET';

	/**
	 * HTTP method for .peek()
	 */
	peekMethod: RequestMethod = 'HEAD';

	/**
	 * HTTP method for .add()
	 */
	addMethod: RequestMethod = 'POST';

	/**
	 * HTTP method for .upd()
	 */
	updMethod: RequestMethod = 'PUT';

	/**
	 * HTTP method for .del()
	 */
	delMethod: RequestMethod = 'DELETE';

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
	tmpEventName: CanUndef<ModelMethod>;

	/**
	 * Temporary request method
	 */
	tmpMethod: CanUndef<RequestMethod>;

	/**
	 * Cache id
	 */
	readonly cacheId!: string;

	/**
	 * External request mode
	 */
	readonly externalRequest: boolean = false;

	/**
	 * List of additional data providers for the a get request
	 */
	readonly extraProviders?: FunctionalExtraProviders;

	/**
	 * List of socket events to listen
	 */
	readonly events: string[] = ['add', 'upd', 'del', 'refresh'];

	/**
	 * List of additional providers to listen
	 */
	readonly providers: string[] = [];

	/**
	 * If true, then the provider will be listen all events from all providers
	 */
	readonly listenAllEvents: boolean = false;

	/**
	 * Event emitter for broadcasting provider events
	 */
	readonly emitter!: EventEmitter;

	/**
	 * Global event emitter for broadcasting provider events
	 */
	readonly globalEmitter: EventEmitter = emitter;

	/**
	 * @deprecated
	 * @see [[Provider.prototype.emitter]]
	 */
	get event(): EventEmitter {
		deprecate({name: 'event', type: 'accessor', renamedTo: 'emitter'});
		return this.emitter;
	}

	/**
	 * @deprecated
	 * @see [[Provider.prototype.globalEmitter]]
	 */
	get globalEvent(): EventEmitter {
		deprecate({name: 'globalEvent', type: 'accessor', renamedTo: 'globalEmitter'});
		return this.globalEmitter;
	}

	/**
	 * Alias for the request function
	 */
	get request(): typeof request {
		return (<typeof Provider>this.constructor).request;
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
	 * @param [opts] - additional parameters
	 */
	abstract async connect(opts?: Dictionary): Promise<Socket | void>;

	/**
	 * Executes the specified function with a socket connection
	 *
	 * @see Async.on
	 * @param fn
	 * @param [params]
	 */
	abstract attachToSocket(fn: (socket: Socket) => void, params?: AsyncCbOptions<this>): void;

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
							this.emitter.emit(type, data);
						}
					});
				}
			}
		}, {label: $$.bindEvents, group: 'bindEvents'});
	}

	//#endif

	/**
	 * Returns a custom event name for the operation
	 */
	name(): CanUndef<ModelMethod>;

	/**
	 * Sets a custom event name for the operation
	 * @param [value]
	 */
	name(value: ModelMethod): Provider;
	name(value?: ModelMethod): CanUndef<Provider | ModelMethod> {
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
	method(): CanUndef<RequestMethod>;

	/**
	 * Sets a custom request method for the operation
	 * @param [value]
	 */
	method(value: RequestMethod): Provider;
	method(value?: RequestMethod): CanUndef<Provider | RequestMethod> {
		if (value == null) {
			const val = this.tmpMethod;
			this.tmpMethod = undefined;
			return val;
		}

		this.tmpMethod = value;
		return this;
	}

	/**
	 * Returns the full request URL
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
	abstract get<T = unknown>(query?: RequestQuery, opts?: CreateRequestOptions<T>): RequestResponse;

	/**
	 * Peeks data
	 *
	 * @param [query]
	 * @param [opts]
	 */
	abstract peek<T = unknown>(query?: RequestQuery, opts?: CreateRequestOptions<T>): RequestResponse;

	/**
	 * Sends a POST request
	 *
	 * @param [body]
	 * @param [opts]
	 */
	abstract post<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse;

	/**
	 * Adds data
	 *
	 * @param [body]
	 * @param [opts]
	 */
	abstract add<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse;

	/**
	 * Updates data
	 *
	 * @param [body]
	 * @param [opts]
	 */
	abstract upd<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse;

	/**
	 * Deletes data
	 *
	 * @param [body]
	 * @param [opts]
	 */
	abstract del<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse;
}
