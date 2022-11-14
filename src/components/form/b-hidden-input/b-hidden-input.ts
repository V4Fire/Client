/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/form/b-hidden-input/README.md]]
 * @packageDocumentation
 */

import iInput, { component } from 'components/super/i-input/i-input';

export * from 'components/super/i-input/i-input';

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bHiddenInput extends iInput {
	override readonly rootTag: string = 'span';
	protected override readonly $refs!: {input: HTMLInputElement};
}
