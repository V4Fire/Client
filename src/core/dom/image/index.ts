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

import ImageLoader from '@src/core/dom/image/loader';

import { defaultParams } from '@src/core/dom/image/const';
import type { DefaultParams } from '@src/core/dom/image/interface';

export * from '@src/core/dom/image/const';
export * from '@src/core/dom/image/interface';

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
		instance.defaultOptionsResolver = params.optionsResolver;
	}

	return instance;
}

const ImageLoaderInstance = imageLoaderFactory();
export { ImageLoaderInstance as ImageLoader };
