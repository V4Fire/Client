/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/dom/image/README.md]]
 * @packageDocumentation
 */

import ImageLoader from 'core/dom/image/loader';

import { defaultParams } from 'core/dom/image/const';
import type { DefaultParams } from 'core/dom/image/interface';

export * from 'core/dom/image/const';
export * from 'core/dom/image/interface';

/**
 * Creates an image module
 * @param [params]
 */
export function imageLoaderFactory(params: CanUndef<DefaultParams> = defaultParams): ImageLoader {
	const instance = new ImageLoader();

	if (params?.broken != null) {
		instance.setDefaultBrokenImage(params.broken);
	}

	if (params?.preview != null) {
		instance.setDefaultPreviewImage(params.preview);
	}

	if (params?.optionsResolver != null) {
		instance.setDefaultOptionsResolver(params.optionsResolver);
	}

	return instance;
}

const ImageLoaderInstance = imageLoaderFactory();
export { ImageLoaderInstance as ImageLoader };
