/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Provider, { providers, ProviderOptions } from 'core/data';
import type { ReadonlyEventEmitterWrapper } from 'core/async';

import Friend, { fakeMethods } from 'components/friends/friend';
import type iDataCommon from 'components/super/i-data/common';

import type * as request from 'components/friends/data/request';

interface Data {
	url: typeof request.url;
	base: typeof request.base;
	get: typeof request.get;
	peek: typeof request.peek;
	post: typeof request.post;
	update: typeof request.update;
	delete: typeof request.del;
	getDefaultRequestParams: typeof request.getDefaultRequestParams;
}

@fakeMethods(
	'url',
	'base',
	'get',
	'peek',
	'post',
	'update',
	'delete',
	'getDefaultRequestParams'
)

class Data extends Friend {
	override readonly C!: iDataCommon;

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

	constructor(component: iDataCommon, provider: string | Provider, opts?: ProviderOptions) {
		super(component);

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

		} else {
			dp = provider;
		}

		this.provider = dp;
		this.emitter = this.async.wrapEventEmitter({
			get on() {
				return dp.emitter.on.bind(dp) ?? (() => Object.throw());
			},

			get once() {
				return dp.emitter.once.bind(dp) ?? (() => Object.throw());
			},

			get off() {
				return dp.emitter.off.bind(dp) ?? (() => Object.throw());
			}
		});
	}

	/**
	 * Drops the data provider cache
	 */
	dropCache(): void {
		this.provider.dropCache();
	}
}

export default Data;
