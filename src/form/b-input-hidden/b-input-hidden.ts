/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iInput, { component } from 'super/i-input/i-input';
export * from  'super/i-input/i-input';

@component()
export default class bInputHidden extends iInput {
	/** @override */
	protected readonly $refs!: {input: HTMLInputElement};
}
