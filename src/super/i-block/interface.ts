/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { UnsafeComponentInterface } from 'core/component';

import iBlock from 'super/i-block/i-block';
import { statuses } from 'super/i-block/const';

export type ComponentStatus =
	'destroyed' |
	'inactive' |
	'unloaded' |
	'loading' |
	'beforeReady' |
	'ready';

export type ComponentStatuses = Partial<
	Record<keyof typeof statuses, boolean>
>;

export type ParentMessageProperty =
	'instanceOf' |
	'globalName' |
	'componentName' |
	'componentId';

export interface ParentMessage<CTX extends iBlock = iBlock> {
	check: [ParentMessageProperty, unknown];
	action(this: CTX): Function;
}

export type Stage =
	string |
	number;

export interface ComponentEvent {
	event: string;
	type?: 'error';
}

export interface InitLoadOptions {
	/**
	 * If true, the component is loaded in silent, i.e. without toggling .componentStatus to 'loading'
	 * @default `false`
	 */
	silent?: boolean;

	/**
	 * If true, the component force all child components to load/reload
	 * @default `false`
	 */
	recursive?: boolean;

	/**
	 * If false, there won't be fired an event of load beginning
	 * @default `true`
	 */
	emitStartEvent?: boolean;
}

export interface InitLoadCb<R = unknown, CTX extends iBlock = iBlock> {
	(this: CTX): R;
}

export interface UnsafeIBlock<CTX extends iBlock = iBlock> extends UnsafeComponentInterface<CTX> {
	// @ts-ignore (access)
	state: CTX['state'];

	// @ts-ignore (access)
	storage: CTX['storage'];

	// @ts-ignore (access)
	opt: CTX['opt'];

	// @ts-ignore (access)
	dom: CTX['dom'];

	// @ts-ignore (access)
	block: CTX['block'];

	// @ts-ignore (access)
	async: CTX['async'];

	// @ts-ignore (access)
	sync: CTX['sync'];

	// @ts-ignore (access)
	localEmitter: CTX['localEmitter'];

	// @ts-ignore (access)
	parentEmitter: CTX['parentEmitter'];

	// @ts-ignore (access)
	rootEmitter: CTX['rootEmitter'];

	// @ts-ignore (access)
	globalEmitter: CTX['globalEmitter'];

	// @ts-ignore (access)
	blockReadyListeners: CTX['blockReadyListeners'];

	// @ts-ignore (access)
	beforeReadyListeners: CTX['beforeReadyListeners'];

	// @ts-ignore (access)
	tmp: CTX['tmp'];

	// @ts-ignore (access)
	watchTmp: CTX['watchTmp'];

	// @ts-ignore (access)
	renderTmp: CTX['renderTmp'];

	// @ts-ignore (access)
	ifOnceStore: CTX['ifOnceStore'];

	// @ts-ignore (access)
	activated: CTX['activated'];

	// @ts-ignore (access)
	deactivated: CTX['deactivated'];

	// @ts-ignore (access)
	syncRouterState: CTX['syncRouterState'];

	// @ts-ignore (access)
	convertStateToRouterReset: CTX['convertStateToRouterReset'];

	// @ts-ignore (access)
	syncStorageState: CTX['syncStorageState'];

	// @ts-ignore (access)
	convertStateToStorageReset: CTX['convertStateToStorageReset'];

	// @ts-ignore (access)
	waitRef: CTX['waitRef'];
}
