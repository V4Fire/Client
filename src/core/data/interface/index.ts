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
	 * Transport function for a request.
	 * Basically, you can use an overload of the request API for flexibly extending.
	 *
	 *
	 * @see [[request]]
	 * @see [[CreateRequestOptions]]
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
	 * Sequence of middlewares that is provided to the request function.
	 * An object form is easily for extending, bur you can choose any different form.
	 *
	 * @see [[Middlewares]]
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
	 * @see [[Encoders]]
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
	 * @see [[Decoders]]
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
	 * Finds an element from an object by the specified parameters
	 *
	 * @param obj - object for searching
	 * @param params - search parameters
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
	 * Map of data mocks.
	 * This object can be used with a middleware that implements API for data mocking,
	 * for example [[attachMock]] from `'core/data/middlewares'`.
	 *
	 * The key of a map element is represents a type of a request method: 'GET', 'POST', etc.
	 * The value of a map element is represents a list of parameters for matching.
	 *
	 * @see [[Middlewares]]
	 * @example
	 * ```js
	 * import { attachMock } from 'core/data/middlewares';
	 *
	 * class MyProvider extends Provider {
	 *   mocks: {
	 *     GET: [
	 *       // The mock for a GET request with a query parameter that contains
	 *       // `search=foo` parameter
	 *       {
	 *         status: 200,
	 *
	 *         // For the mock response won't be applied decoders
	 *         // (by default, `true`)
	 *         decoders: false,
	 *
	 *         query: {
	 *           search: 'foo'
	 *         },
	 *
	 *         // The response
	 *         response: {
	 *           data: [
	 *             'bla',
	 *             'baz
	 *           ]
	 *         }
	 *       }
	 *     ],
	 *
	 *     POST: [
	 *       // The mock is catches all POST requests and dynamically generated responses
	 *       {
	 *         response(params, response) {
	 *           if (!params.opts.query?.data) {
	 *             response.status = 400;
	 *             return;
	 *           }
	 *
	 *           response.status = 200;
	 *           response.responseType = 'string';
	 *           return 'ok';
	 *         }
	 *       }
	 *     ]
	 *   },
	 *
	 *   middlewares: {attachMock}
	 * }
	 * ```
	 */
	mocks?: Mocks;

	/**
	 * Temporary request method.
	 * If specified, the first invocation of any request method will use this method.
	 */
	tmpMethod: CanUndef<RequestMethod>;

	/**
	 * HTTP method that is used for the "get" method
	 */
	getMethod: RequestMethod = 'GET';

	/**
	 * HTTP method that is used for the "peek" method
	 */
	peekMethod: RequestMethod = 'HEAD';

	/**
	 * HTTP method that is used for the "add" method
	 */
	addMethod: RequestMethod = 'POST';

	/**
	 * HTTP method that is used for the "upd" method
	 */
	updMethod: RequestMethod = 'PUT';

	/**
	 * HTTP method that is used for the "del" method
	 */
	delMethod: RequestMethod = 'DELETE';

	/**
	 * Base part of URL for a request for all request methods
	 * (if custom methods is not specified)
	 *
	 * @example
	 * ```js
	 * class Profile extends Provider {
	 *   baseURL: 'profile/info'
	 * }
	 * ```
	 */
	baseURL: string = '';

	/**
	 * Base part of URL for a request using the "get" method
	 *
	 * @example
	 * ```js
	 * class Profile extends Provider {
	 *   // For all request methods despite the "get" is used this URL
	 *   baseURL: 'profile/info'
	 *   baseGetURL: 'profile/info/get'
	 * }
	 * ```
	 */
	baseGetURL: string = '';

	/**
	 * Base part of URL for a request using the "peek" method
	 *
	 * @example
	 * ```js
	 * class Profile extends Provider {
	 *   // For all request methods despite the "peek" is used this URL
	 *   baseURL: 'profile/info'
	 *   basePeekURL: 'profile/info/peek'
	 * }
	 * ```
	 */
	basePeekURL: string = '';

	/**
	 * Base part of URL for a request using the "add" method
	 *
	 * @example
	 * ```js
	 * class Profile extends Provider {
	 *   // baseURL request methods despite the "add" is used this URL
	 *   basePeekURL: 'profile/info'
	 *   baseAddURL: 'profile/info/add'
	 * }
	 * ```
	 */
	baseAddURL: string = '';

	/**
	 * Base part of URL for a request using the "upd" method
	 *
	 * @example
	 * ```js
	 * class Profile extends Provider {
	 *   // baseURL request methods despite the "upd" is used this URL
	 *   basePeekURL: 'profile/info'
	 *   baseUpdURL: 'profile/info/upd'
	 * }
	 * ```
	 */
	baseUpdURL: string = '';

	/**
	 * Base part of URL for a request using the "del" method
	 *
	 * @example
	 * ```js
	 * class Profile extends Provider {
	 *   // baseURL request methods despite the "del" is used this URL
	 *   basePeekURL: 'profile/info'
	 *   baseDelURL: 'profile/info/del'
	 * }
	 * ```
	 */
	baseDelURL: string = '';

	/**
	 * Temporary part of URL for a request.
	 * If specified, it replaces the base URL,
	 * but it will be dropped after the first usage of any request method.
	 */
	tmpURL: string = '';

	/**
	 * Advanced part of URL for a request
	 * (it is concatenated with the base part)
	 */
	advURL: string = '';

	/**
	 * URL for a socket connection
	 */
	socketURL?: string;

	/**
	 * Temporary event name of a request.
	 * All request methods except "get", "peek" and "request" emit events by default.
	 * But if you set this parameter, the first invocation of any request method will emit this event.
	 */
	tmpEventName: CanUndef<ModelMethod>;

	/**
	 * Cache identifier
	 */
	readonly cacheId!: string;

	/** @see [[CreateRequestOptions.externalRequest]] */
	readonly externalRequest: boolean = false;

	/**
	 * List of additional data providers for the a get request.
	 * It can be useful if you have some providers that you want combine to one.
	 *
	 * @example
	 * ```
	 * class User extends Provider {
	 *   baseURL: 'user/info',
	 *
	 *   extraProviders: {
	 *     balance: {
	 *       provider: 'UserBalance'
	 *     },
	 *
	 *     hobby: {
	 *       provider: 'UserHobby'
	 *     },
	 *   }
	 * }
	 * ```
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
