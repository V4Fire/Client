/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/data/README.md]]
 * @packageDocumentation
 */

//#set runtime.core/data

import symbolGenerator from 'core/symbol';
import IO, { Socket } from 'core/socket';

import iProvider from 'core/data/modules/base';
import { connectCache } from 'core/data/const';
import { provider } from 'core/data/decorators';
import { attachMock } from 'core/data/middlewares';
import { Mocks } from 'core/data/interface';

import {

	globalOpts,
	CreateRequestOptions,
	Middlewares,
	MiddlewareParams,
	CacheStrategy,
	RequestQuery,
	RequestMethod,
	RequestResponse,
	RequestResponseObject,
	RequestFunctionResponse,
	Response,
	RequestBody

} from 'core/request';

export * from 'core/data/const';
export * from 'core/data/const';
export * from 'core/data/decorators';
export * from 'core/data/interface';
export * from 'core/data/middlewares';

export { RequestMethod, RequestError } from 'core/request';
export {

	globalOpts,
	Socket,
	CreateRequestOptions,

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

export const
	$$ = symbolGenerator();

/**
 * Default data provider
 */
@provider
export default class Provider extends iProvider {
	/** @override */
	static readonly middlewares: Middlewares = {
		attachMock
	};

	//#if runtime has socket

	/** @inheritDoc */
	async connect(opts: Dictionary = {}): Promise<Socket | void> {
		await this.async.wait(() => this.socketURL);

		const
			{globalEmitter: $e, socketURL: url} = this,
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

						.emit('authentication', await this.getAuthParams(opts));
				});
			});
		}

		return this.connection = connectCache[key];
	}

	/** @inheritDoc */
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

	/** @inheritDoc */
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
}
