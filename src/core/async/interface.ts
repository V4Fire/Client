/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

import {

	Namespace as SuperNamespace,
	AsyncOptions,
	AsyncCbOptions,
	AsyncOnOptions,
	ProxyCb

} from '@v4fire/core/core/async/interface';

export * from '@v4fire/core/core/async/interface';

export enum ClientNamespaces {
	animationFrame,
	animationFramePromise
}

export type ClientNamespace = keyof typeof ClientNamespaces;
export type Namespace = SuperNamespace | ClientNamespace;

export interface AsyncRequestAnimationFrameOptions<CTX extends object = Async> extends AsyncCbOptions<CTX> {
	element?: Element;
}

export interface AsyncAnimationFrameOptions extends AsyncOptions {
	element?: Element;
}

export interface AsyncDnDOptions<R = unknown, CTX extends object = Async> extends AsyncOnOptions<CTX> {
	onDragStart?: DnDCb<R, CTX> | DnDEventOptions<R, CTX>;
	onDrag?: DnDCb<R, CTX> | DnDEventOptions<R, CTX>;
	onDragEnd?: DnDCb<R, CTX> | DnDEventOptions<R, CTX>;
}

export type DnDCb<R = unknown, CTX extends object = Async> = Function | ((this: CTX, e: MouseEvent, el: Node) => R);
export type AnimationFrameCb<R = unknown, CTX extends object = Async> = ProxyCb<number, R, CTX>;

export interface DnDEventOptions<R = unknown, CTX extends object = Async> {
	capture?: boolean;
	handler: DnDCb<R, CTX>;
}
