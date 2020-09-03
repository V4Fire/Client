/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import ImageLoader from 'core/dom/image/image';
import { defaultParams } from 'core/dom/image/default-params';
import { DefaultParams } from 'core/dom/image/interface';

const ImageLoaderInstance = new ImageLoader();

/**
 * Creates an image module
 * @param params
 */
export function imageLoaderFactory(params: CanUndef<DefaultParams> = defaultParams): ImageLoader {
	const instance = new ImageLoader();

	if (params?.broken != null) {
		instance.setDefaultBrokenImage(params.broken);
	}

	if (params?.preview != null) {
		instance.setDefaultPreviewImage(params.preview);
	}

	return instance;
}

export { ImageLoaderInstance as ImageLoader };
export * from 'core/dom/image/interface';
