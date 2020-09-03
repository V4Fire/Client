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

import ImageLoader from 'core/dom/image/image';
import { defaultParams } from 'core/dom/image/default-params';
import { DefaultParams } from 'core/dom/image/interface';

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

/*
 * This export should be before creating an instance due to the order of initialization of variables
 */
export * from 'core/dom/image/interface';

const ImageLoaderInstance = imageLoaderFactory();
export { ImageLoaderInstance as ImageLoader };
