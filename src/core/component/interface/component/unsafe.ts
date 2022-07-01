/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface } from 'core/component/interface/component/component';

/**
 * A helper structure to pack the unsafe interface.
 * It fixes some ambiguous TS warnings.
 */
export type UnsafeGetter<U extends UnsafeComponentInterface = UnsafeComponentInterface> =
	Dictionary & U['CTX'] & U & {unsafe: any};

/**
 * A special interface to provide access for protected properties and methods outside the main component.
 * It's used to create a "friendly classes" feature.
 */
export interface UnsafeComponentInterface<CTX extends ComponentInterface = ComponentInterface> {
	/**
	 * Type: the context type
	 */
	readonly CTX: CTX;

	// @ts-ignore (access)
	meta: CTX['meta'];

	// @ts-ignore (access)
	$fields: CTX['$fields'];

	// @ts-ignore (access)
	$systemFields: CTX['$fields'];

	// @ts-ignore (access)
	$modifiedFields: CTX['$modifiedFields'];

	// Don't use referring from CTX for primitive types, because it breaks TS

	$activeField: CanUndef<string>;

	$renderCounter: number;

	// @ts-ignore (access)
	$attrs: CTX['$attrs'];

	// @ts-ignore (access)
	$refs: CTX['$refs'];

	// @ts-ignore (access)
	$slots: CTX['$slots'];

	// @ts-ignore (access)
	$syncLinkCache: CTX['$syncLinkCache'];

	// @ts-ignore (access)
	async: CTX['async'];

	// @ts-ignore (access)
	$async: CTX['$async'];

	// @ts-ignore (access)
	$initializer: CTX['$initializer'];

	// @ts-ignore (access)
	$watch: CTX['$watch'];

	// @ts-ignore (access)
	$on: CTX['$on'];

	// @ts-ignore (access)
	$once: CTX['$once'];

	// @ts-ignore (access)
	$off: CTX['$off'];

	// @ts-ignore (access)
	$emit: CTX['$emit'];

	// @ts-ignore (access)
	$set: CTX['$set'];

	// @ts-ignore (access)
	$delete: CTX['$delete'];

	// @ts-ignore (access)
	$forceUpdate: CTX['$forceUpdate'];

	// @ts-ignore (access)
	$nextTick: CTX['$nextTick'];

	// @ts-ignore (access)
	$destroy: CTX['$destroy'];

	// @ts-ignore (access)
	log: CTX['log'];

	// @ts-ignore (access)
	activate: CTX['activate'];

	// @ts-ignore (access)
	deactivate: CTX['deactivate'];
}
