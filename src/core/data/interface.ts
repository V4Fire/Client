/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export type SocketEvent = (() => Dictionary) | {
	type: string;
	instance: string;
	data: Dictionary;
};

export interface ProviderParams {
	listenAllEvents?: boolean;
}
