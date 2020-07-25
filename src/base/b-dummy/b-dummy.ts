/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component } from 'super/i-data/i-data';

import { ImageLoader } from 'core/component/directives/image';
import ImageLoaderConstructor from 'core/component/directives/image/image';

export * from 'super/i-data/i-data';

export interface Directives {
	image: ImageLoaderConstructor;
}

@component()
export default class bDummy extends iData {
	/**
	 * Links to directives
	 */
	get directives(): Directives {
		return {
			image: ImageLoader
		};
	}
}
