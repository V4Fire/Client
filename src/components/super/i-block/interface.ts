/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { LogLevel } from 'core/log';
import type { UnsafeComponentInterface } from 'core/component';

import type iBlock from 'components/super/i-block/i-block';
import type iBlockEvent from 'components/super/i-block/event';

import type { statuses } from 'components/super/i-block/const';

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

export interface CallChild<CTX extends iBlockEvent = iBlockEvent> {
	if(ctx: CTX): AnyToBoolean;
	then(ctx: CTX): void;
}

export type Stage =
	string |
	number;

export interface ComponentEvent {
	event: string;
	logLevel?: LogLevel;
}

export interface InitLoadOptions {
	/**
	 * If true, the component is loaded silently, i.e. without switching `componentStatus` to `loading`
	 * @default `false`
	 */
	silent?: boolean;

	/**
	 * If true, the component is forced to load/reload all child components
	 * @default `false`
	 */
	recursive?: boolean;

	/**
	 * If false, then the data loading start event won't be fired
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
	asyncRender: CTX['asyncRender'];

	// @ts-ignore (access)
	moduleLoader: CTX['moduleLoader'];

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
	reactiveTmp: CTX['reactiveTmp'];

	// @ts-ignore (access)
	ifOnceStore: CTX['ifOnceStore'];

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
