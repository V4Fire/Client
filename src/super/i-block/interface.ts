/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async, { AsyncOptions } from 'core/async';
import iBlock from 'super/i-block/i-block';
import { statuses } from 'super/i-block/const';

export type Statuses =
	'destroyed' |
	'inactive' |
	'unloaded' |
	'loading' |
	'beforeReady' |
	'ready';

export interface WaitStatusOptions extends AsyncOptions {
	defer?: boolean;
}

export type ParentMessageFields =
	'instanceOf' |
	'globalName' |
	'componentName' |
	'componentId';

export interface ParentMessage<T extends iBlock = iBlock> {
	check: [ParentMessageFields, unknown];
	action(this: T): Function;
}

export type Stage = string | number;
export type ComponentStatuses = Partial<Record<keyof typeof statuses, boolean>>;

export interface ComponentEventDecl {
	event: string;
	type?: 'error';
}

export interface InitLoadParams {
	silent?: boolean;
	recursive?: boolean;
}

export interface Unsafe<CTX extends iBlock = iBlock> {
	instance: CTX['instance'];

	lfc: iBlock['lfc'];
	state: iBlock['state'];
	storage: iBlock['storage'];

	opt: iBlock['opt'];
	lazy: iBlock['lazy'];

	dom: iBlock['dom'];
	block: iBlock['block'];
	async: Async<CTX>;

	localEvent: iBlock['localEvent'];
	parentEvent: iBlock['parentEvent'];
	rootEvent: iBlock['rootEvent'];
	globalEvent: iBlock['globalEvent'];

	log: iBlock['log'];
	meta: iBlock['meta'];
	blockReadyListeners: iBlock['blockReadyListeners'];
	beforeReadyListeners: iBlock['beforeReadyListeners'];

	tmp: iBlock['tmp'];
	watchTmp: iBlock['watchTmp'];
	renderTmp: iBlock['renderTmp'];
	ifOnceStore: iBlock['ifOnceStore'];

	activated: iBlock['activated'];
	deactivated: iBlock['deactivated'];
	syncRouterState: iBlock['syncRouterState'];
	convertStateToRouterReset: iBlock['convertStateToRouterReset'];
	syncStorageState: iBlock['syncStorageState'];
	convertStateToStorageReset: iBlock['convertStateToStorageReset'];

	$el: iBlock['$el'];
	$async: iBlock['$async'];

	$props: iBlock['$props'];
	$attrs: iBlock['$attrs'];

	$fields: iBlock['$fields'];
	$systemFields: iBlock['$fields'];

	$options: iBlock['$options'];
	$syncLinkCache: iBlock['$syncLinkCache'];

	readonly $asyncLabel: symbol;
	readonly $activeField: CanUndef<string>;

	// @ts-ignore (access)
	$refs: CTX['$refs'];
	$root: CTX['$root'];

	$set: iBlock['$set'];
	$delete: iBlock['$delete'];
	$createElement: iBlock['$createElement'];
}
