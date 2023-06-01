/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AsyncOptions } from 'core/async';

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { ComponentLocalEvents, LocalEventPayload } from 'components/base/b-scrolly/interface';

/**
 * Factory for producing typed `localEmitter` methods.
 * Provides a methods of the `localEmitter` with types
 *
 * @param ctx
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function typedLocalEmitterFactory(ctx: bScrolly) {
	const once = <EVENT extends ComponentLocalEvents>(
		event: EVENT,
		handler: (...args: LocalEventPayload<EVENT>) => void,
		asyncOpts?: AsyncOptions
	) => {
		ctx.unsafe.localEmitter.once(event, <Function>handler, asyncOpts);
	};

	const on = <EVENT extends ComponentLocalEvents>(
		event: EVENT,
		handler: (...args: LocalEventPayload<EVENT>) => void,
		asyncOpts?: AsyncOptions
	) => {
		ctx.unsafe.localEmitter.on(event, <Function>handler, asyncOpts);
	};

	const promisifyOnce = <EVENT extends ComponentLocalEvents>(
		event: EVENT,
		asyncOpts?: AsyncOptions
	) => ctx.unsafe.localEmitter.promisifyOnce(event, asyncOpts);

	const emit = <EVENT extends ComponentLocalEvents>(
		event: EVENT,
		...payload: LocalEventPayload<EVENT>
	) => {
		ctx.unsafe.localEmitter.emit(event, ...payload);
	};

	return {
		once,
		on,
		promisifyOnce,
		emit
	};
}
