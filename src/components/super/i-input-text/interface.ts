/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { UnsafeIInput } from 'components/super/i-input/i-input';
import type iInputText from 'components/super/i-input-text/i-input-text';

export * from 'components/super/i-input-text/mask/interface';

// @ts-ignore (extend)
export interface UnsafeIInputText<CTX extends iInputText = iInputText> extends UnsafeIInput<CTX> {
	// @ts-ignore (access)
	updateTextStore: CTX['updateTextStore'];

	// @ts-ignore (access)
	maskAPI: CTX['maskAPI'];

	// @ts-ignore (access)
	initMask: CTX['initMask'];
}
