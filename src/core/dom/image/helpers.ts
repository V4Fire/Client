/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { concatURLs } from 'core/url';
import { getSrcSet } from 'core/html';

import type { ImageOptions } from 'core/dom/image/interface';

/**
 * Resolves the value of the `src` attribute for the given resource by the passed parameters and returns it
 *
 * @param src - the original resource src
 * @param resourceParams - additional parameters of the requested resource
 * @param commonParams - common additional parameters
 */
export function resolveSrc(
	src: CanUndef<string>,
	resourceParams: ImageOptions,
	commonParams: ImageOptions
): string {
	if (src == null || src === '') {
		return '';
	}

	const
		baseSrc = getBaseSrc(resourceParams, commonParams);

	if (baseSrc == null || baseSrc === '') {
		return src;
	}

	return concatURLs(baseSrc, src);
}

/**
 * Resolves the value of the `srcset` attribute for the given resource by the passed parameters and returns it
 *
 * @param srcset - the original resource src set
 * @param resourceParams - additional parameters of the requested resource
 * @param commonParams - common additional parameters
 */
export function resolveSrcSet(
	srcset: CanUndef<Dictionary<string> | string>,
	resourceParams: ImageOptions,
	commonParams: ImageOptions
): string {
	const normalizedSrcset = Object.isDictionary(srcset) ?
		getSrcSet(srcset) :
		srcset;

	if (normalizedSrcset == null || normalizedSrcset === '') {
		return '';
	}

	const
		baseSrc = getBaseSrc(resourceParams, commonParams);

	if (baseSrc == null || baseSrc === '') {
		return normalizedSrcset;
	}

	return normalizedSrcset
		.split(',')
		.map((val) => concatURLs(baseSrc, val.trim()))
		.join(',');
}

/**
 * Returns the underlying resource src based on the given parameters
 *
 * @param resourceParams - additional parameters of the requested resource
 * @param commonParams - common additional parameters
 */
function getBaseSrc(resourceParams: ImageOptions, commonParams: ImageOptions): CanUndef<string> {
	return resourceParams.baseSrc ?? commonParams.baseSrc ?? '';
}
