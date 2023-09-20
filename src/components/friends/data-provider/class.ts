/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Provider, {

	providers,

	requestCache,
	instanceCache,

	ModelMethod,
	RequestQuery,
	RequestBody

} from 'core/data';

import type { ReadonlyEventEmitterWrapper } from 'core/async';

import Friend, { fakeMethods } from 'components/friends/friend';
import type { CreateRequestOptions } from 'components/traits/i-data-provider/i-data-provider';

import type iBlock from 'components/super/i-block';
import type iDataProvider from 'components/traits/i-data-provider/i-data-provider';

import type { DataProviderProp, DataProviderOptions, DefaultRequest } from 'components/friends/data-provider/interface';

interface DataProvider {
	url(): CanUndef<string>;
	url(value: string): this;

	base(): CanUndef<string>;
	base(value: string): this;

	get<D = unknown>(query?: RequestQuery, opts?: CreateRequestOptions<D>): Promise<CanUndef<D>>;
	peek<D = unknown>(query?: RequestQuery, opts?: CreateRequestOptions<D>): Promise<CanUndef<D>>;
	post<D = unknown>(body?: RequestBody, opts?: CreateRequestOptions<D>): Promise<CanUndef<D>>;
	add<D = unknown>(body?: RequestBody, opts?: CreateRequestOptions<D>): Promise<CanUndef<D>>;
	update<D = unknown>(body?: RequestBody, opts?: CreateRequestOptions<D>): Promise<CanUndef<D>>;
	delete<D = unknown>(body?: RequestBody, opts?: CreateRequestOptions<D>): Promise<CanUndef<D>>;

	getDefaultRequestParams<T = unknown>(method: ModelMethod): CanNull<DefaultRequest<T>>;
}

@fakeMethods(
	'url',
	'base',
	'get',
	'peek',
	'post',
	'add',
	'update',
	'delete',
	'getDefaultRequestParams'
)

class DataProvider extends Friend {
	override readonly C!: iBlock & iDataProvider;

	/**
	 * The component data provider event emitter.
	 * To avoid memory leaks, only this emitter is used to listen for provider events.
	 *
	 * Note that to detach a listener, you can specify not only a link to the listener, but also the name of
	 * the group/label to which the listener is attached. By default, all listeners have a group name equal to
	 * the event name being listened to. If nothing is specified, then all component event listeners will be detached.
	 */
	readonly emitter!: ReadonlyEventEmitterWrapper<this['component']>;

	/**
	 * An instance of the component data provider
	 */
	readonly provider!: Provider;

	constructor(component: iBlock & iDataProvider, provider: DataProviderProp, opts?: DataProviderOptions) {
		super(component);

		const
			{ctx} = this;

		opts = {
			id: ctx.r.componentId,
			remoteState: ctx.remoteState,
			...opts
		};

		let
			dp: Provider;

		if (Object.isString(provider)) {
			const
				ProviderConstructor = <CanUndef<typeof Provider>>providers[provider];

			if (ProviderConstructor == null) {
				if (provider === 'Provider') {
					return;
				}

				throw new ReferenceError(`The provider "${provider}" is not defined`);
			}

			dp = new ProviderConstructor(opts);
			registerDestructor();

		} else if (Object.isFunction(provider)) {
			const ProviderConstructor = Object.cast<typeof Provider>(provider);

			dp = new ProviderConstructor(opts);
			registerDestructor();

		} else {
			dp = <Provider>provider;
		}

		this.provider = dp;

		this.emitter = this.async.wrapEventEmitter({
			get on() {
				return dp.emitter.on.bind(dp.emitter) ?? (() => Object.throw());
			},

			get once() {
				return dp.emitter.once.bind(dp.emitter) ?? (() => Object.throw());
			},

			get off() {
				return dp.emitter.off.bind(dp.emitter) ?? (() => Object.throw());
			}
		});

		function registerDestructor() {
			ctx.r.unsafe.async.worker(() => {
				const key = dp.getCacheKey();
				delete instanceCache[key];
				delete requestCache[key];
			});
		}
	}

	/**
	 * Drops the data provider cache
	 */
	dropCache(): void {
		this.provider.dropCache();
	}
}

export default DataProvider;
