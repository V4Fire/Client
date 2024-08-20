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
 * It resolves some ambiguous TS warnings.
 */
export type UnsafeGetter<U extends UnsafeComponentInterface = UnsafeComponentInterface> = U['CTX'] & U;

/**
 * This is a special interface that provides access to protected properties and methods outside the primary class.
 * It is used to create friendly classes.
 */
export interface UnsafeComponentInterface<CTX extends ComponentInterface = ComponentInterface> {
	/**
	 * Type: the context type
	 */
	readonly CTX: Omit<CTX, 'unsafe'>;

	// @ts-ignore (access)
	meta: CTX['meta'];

	// @ts-ignore (access)
	$fields: CTX['$fields'];

	// @ts-ignore (access)
	$systemFields: CTX['$systemFields'];

	// @ts-ignore (access)
	$modifiedFields: CTX['$modifiedFields'];

	// Avoid using references to CTX for primitive types, as doing so may cause issues with TS
	$activeField: CanUndef<string>;

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
	$destroy: CTX['$destroy'];

	// @ts-ignore (access)
	$resolveRef: CTX['$resolveRef'];

	// @ts-ignore (access)
	$withCtx: CTX['$withCtx'];

	// @ts-ignore (access)
	$restArgs: CTX['$restArgs'];

	// @ts-ignore (access)
	createPropAccessors: CTX['createPropAccessors'];
}
