/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { deprecate } from 'core/meta/deprecation';

import request, {

	CreateRequestOptions,
	Middlewares,
	RequestMethod

} from 'core/request';

import { select, SelectParams } from 'core/object';
import { emitter } from 'core/data/const';

import {

	ModelMethod,
	FunctionalExtraProviders,
	EncodersMap,
	DecodersMap,
	Mocks

} from 'core/data/interface';

export default abstract class Provider {
	/**
	 * Transport function for a request.
	 * Basically, you can use an overload of the request API for flexibly extending.
	 *
	 * @see [[request]]
	 * @see [[CreateRequestOptions]]
	 *
	 * @example
	 * ```js
	 * import request from 'core/request';
	 *
	 * class Parent extends Provider {
	 *   static request = request({responseType: 'json'})
	 * }
	 *
	 * class Children extends Parent {
	 *   static request = Parent.request({credentials: true})
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
	 *   static middlewares = {
	 *     attachGeoCoords() { ... }
	 *   };
	 * }
	 *
	 * class Children extends Parent {
	 *   static middlewares = {
	 *     ...Parent.middlewares,
	 *     addSession() {
	 *       ...
	 *     }
	 *   };
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
	 *   static encoders = {
	 *     get: [convertToJSON],
	 *     upd: [convertToBuffer]
	 *   };
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
	 *   static decoders = {
	 *     get: [fromJSON],
	 *     upd: [fromBuffer]
	 *   };
	 * }
	 * ```
	 */
	static readonly decoders: DecodersMap = {};

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
	 *   static mocks = {
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
	 *   };
	 *
	 *   static middlewares = {attachMock};
	 * }
	 * ```
	 */
	static mocks?: Mocks;

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
	 * Global event emitter for broadcasting provider events
	 */
	readonly globalEmitter: EventEmitter = emitter;

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
	 * List of additional data providers for a get request.
	 * It can be useful if you have some providers that you want combine to one.
	 *
	 * @example
	 * ```js
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
	extraProviders?: FunctionalExtraProviders;

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
	 * Temporary request method.
	 * If it is specified, the first invocation of any request method will use this method.
	 */
	tmpMethod: CanUndef<RequestMethod>;

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
	 * @deprecated
	 * @see [[Provider.mocks]]
	 */
	mocks?: Mocks;

	/** @see [[CreateRequestOptions.externalRequest]] */
	readonly externalRequest: boolean = false;

	/**
	 * @deprecated
	 * @see [[Provider.prototype.globalEmitter]]
	 */
	get globalEvent(): EventEmitter {
		deprecate({name: 'globalEvent', type: 'accessor', renamedTo: 'globalEmitter'});
		return this.globalEmitter;
	}

	/**
	 * Alias for a request function
	 */
	get request(): typeof request {
		return (<typeof Provider>this.constructor).request;
	}
}
