/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:form/b-input-hidden/README.md]]
 * @packageDocumentation
 */

//#if demo
import 'models/demo/input';
//#endif

import iInput, { component } from 'super/i-input/i-input';

export * from 'super/i-input/i-input';

/**
 * Component to create a hidden input
 */
@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bInputHidden extends iInput {
	/** @override */
	protected readonly $refs!: {input: HTMLInputElement};
}
