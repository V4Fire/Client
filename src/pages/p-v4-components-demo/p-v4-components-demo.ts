/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Option } from 'form/b-select/b-select';
import iStaticPage, { component } from 'super/i-static-page/i-static-page';
export * from 'super/i-static-page/i-static-page';

@component({root: true})
export default class pV4ComponentsDemo extends iStaticPage {
	get selectOptions(): Option[] {
		const
			options = <Option[]>[];

		for (let i = 0; i < 50; i++) {
			options.push({
				value: i,
				label: String(i)
			});
		}

		return options;
	}

	protected beforeCreate(): void {
		console.time('Render');
	}

	protected mounted(): void {
		console.timeEnd('Render');
	}
}
