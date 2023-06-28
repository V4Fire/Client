/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AsyncOptions } from 'core/async';

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { ComponentEvents, LocalEventPayload } from 'components/base/b-scrolly/interface';
import type { ComponentTypedEmitter } from 'components/base/b-scrolly/modules/emitter/interface';

export * from 'components/base/b-scrolly/modules/emitter/interface';

/**
 * Provides methods for interacting with the `selfEmitter` using typed events.
 * @param ctx
 */
export function componentTypedEmitter(ctx: bScrolly): ComponentTypedEmitter {
	const once = <EVENT extends ComponentEvents>(
		event: EVENT,
		handler: (...args: LocalEventPayload<EVENT>) => void,
		asyncOpts?: AsyncOptions
	) => {
		ctx.once(event, <Function>handler, asyncOpts);
	};

	const on = <EVENT extends ComponentEvents>(
		event: EVENT,
		handler: (...args: LocalEventPayload<EVENT>) => void,
		asyncOpts?: AsyncOptions
	) => {
		ctx.on(event, <Function>handler, asyncOpts);
	};

	const promisifyOnce = <EVENT extends ComponentEvents>(
		event: EVENT,
		asyncOpts?: AsyncOptions
	) => ctx.promisifyOnce(event, asyncOpts);

	const emit = <EVENT extends ComponentEvents>(
		event: EVENT,
		...payload: LocalEventPayload<EVENT>
	) => {
		ctx.emit(event, ...payload);
	};

	return <ComponentTypedEmitter>{
		once,
		on,
		promisifyOnce,
		emit
	};
}

