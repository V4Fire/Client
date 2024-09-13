/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Provider from 'core/data';
import type { ModelMethod, RequestQuery, RequestBody } from 'core/data';

import type { ReadonlyEventEmitterWrapper } from 'core/async';

import Friend, { fakeMethods } from 'components/friends/friend';
import type { CreateRequestOptions } from 'components/traits/i-data-provider/i-data-provider';

import type iBlock from 'components/super/i-block/i-block';
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
	override readonly CTX!: this['C']['unsafe'] & iDataProvider;

	/**
	 * The component data provider event emitter.
	 * To avoid memory leaks, only this emitter is used to listen for provider events.
	 *
	 * Note that to detach a listener, you can specify not only a reference to the listener,
	 * but also the name of the group or label to which the listener is attached.
	 * By default, all listeners are assigned a group name that corresponds to the event name they are listening to.
	 * If no specific group is mentioned when detaching, then all listeners associated with the component will be removed.
	 */
	readonly emitter!: ReadonlyEventEmitterWrapper<this['component']>;

	/**
	 * An instance of the component data provider
	 */
	readonly provider!: Provider;

	constructor(component: iBlock & iDataProvider, provider: DataProviderProp, opts?: DataProviderOptions) {
		super(component);

		const
			dp = <Nullable<Provider>>component.createDataProviderInstance(provider, opts);

		if (dp == null) {
			return;
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
	}

	/**
	 * Drops the data provider's cache
	 *
	 * @param [recursive] - if true, then the `dropCache` operation will be propagated recursively,
	 * for example, if an engine based on a data provider is used
	 */
	dropCache(recursive?: boolean): void {
		this.provider.dropCache(recursive);
	}
}

export default DataProvider;
