/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-dynamic-page/README.md]]
 * @packageDocumentation
 */

/* eslint-disable @v4fire/require-jsdoc */
import iPage, { component, field } from 'components/super/i-page/i-page';

export * from 'components/super/i-page/i-page';

@component()
export default abstract class iDynamicPage extends iPage {
	override readonly rootTag: string = 'main';

	@field()
	mountCounter: number = 0;

	mounted(): void {
		this.mountCounter += 1;
	}
}
