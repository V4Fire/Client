/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-input-text/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import iWidth from 'traits/i-width/i-width';
import iSize from 'traits/i-size/i-size';

import iInput, {

	component,
	prop,

	ModsDecl

} from 'super/i-input/i-input';

export * from 'super/i-input/i-input';

export const
	$$ = symbolGenerator();

/**
 * Superclass to create text inputs
 */
@component({
	functional: {
		dataProvider: undefined
	}
})

export default class iInputText extends iInput implements iWidth, iSize {
	/**
	 * Input type
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input
	 */
	@prop(String)
	readonly type: string = 'text';

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iWidth.mods,
		...iSize.mods,

		empty: [
			'true',
			'false'
		]
	};

	/** @override */
	protected readonly $refs!: {input: HTMLInputElement};
}
