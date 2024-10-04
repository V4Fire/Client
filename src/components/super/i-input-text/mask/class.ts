/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';

import type iInputText from 'components/super/i-input-text/i-input-text';
import type { CompiledMask } from 'components/super/i-input-text/mask/interface';
import type * as api from 'components/super/i-input-text/mask/api';

interface Mask {
	init: typeof api.init;
	compile: typeof api.compile;
	saveSnapshot: typeof api.saveSnapshot;

	syncWithText: typeof api.syncWithText;
	syncInputWithField: typeof api.syncInputWithField;
	syncFieldWithInput: typeof api.syncFieldWithInput;

	onKeyPress: typeof api.onKeyPress;
	onDelete: typeof api.onDelete;
	onNavigate: typeof api.onNavigate;
}

@fakeMethods(
	'init',
	'compile',
	'saveSnapshot',

	'syncWithText',
	'syncInputWithField',
	'syncFieldWithInput',

	'onKeyPress',
	'onDelete',
	'onNavigate'
)

class Mask extends Friend {
	/** @inheritDoc */
	declare readonly C: iInputText;

	/**
	 * The compiled mask
	 */
	compiledMask: CanNull<CompiledMask> = null;

	/**
	 * Number of mask repetitions
	 */
	protected maskRepetitions: number = 1;
}

export default Mask;
