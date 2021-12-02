/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { UnsafeIInput } from '@src/super/i-input/i-input';
import type iInputText from '@src/super/i-input-text/i-input-text';

export * from '@src/super/i-input-text/modules/mask/interface';

// @ts-ignore (extend)
export interface UnsafeIInputText<CTX extends iInputText = iInputText> extends UnsafeIInput<CTX> {
	// @ts-ignore (access)
	updateTextStore: CTX['updateTextStore'];

	// @ts-ignore (access)
	maskRepetitions: CTX['maskRepetitions'];

	// @ts-ignore (access)
	compiledMask: CTX['compiledMask'];

	// @ts-ignore (access)
	initMask: CTX['initMask'];

	// @ts-ignore (access)
	compileMask: CTX['compileMask'];

	// @ts-ignore (access)
	syncMaskWithText: CTX['syncMaskWithText'];
}
