/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { normalizeClass, normalizeStyle } from 'core/component/render/helpers/normalizers';

export const isHandler = {
	test(key: string): boolean {
		if (key.length < 3 || !key.startsWith('on')) {
			return false;
		}

		const codePoint = key.codePointAt(2);

		// [^a-z]
		return codePoint != null && (codePoint < 97 || codePoint > 122);
	}
};

/**
 * Merges the specified props into one and returns a single merged prop object
 * @param args
 */
export function mergeProps(...args: Dictionary[]): Dictionary {
	const props: Dictionary = {};

	for (let i = 0; i < args.length; i += 1) {
		const toMerge = args[i];

		for (const key in toMerge) {
			if (key === 'class') {
				if (props.class !== toMerge.class) {
					props.class = normalizeClass(Object.cast([props.class, toMerge.class]));
				}

			} else if (key === 'style') {
				props.style = normalizeStyle(Object.cast([props.style, toMerge.style]));

			} else if (isHandler.test(key)) {
				const
					existing = props[key],
					incoming = toMerge[key];

				if (
					existing !== incoming &&
					!(Object.isArray(existing) && existing.includes(incoming))
				) {
					props[key] = Object.isTruly(existing) ? Array.toArray(existing, incoming) : incoming;
				}

			} else if (key !== '') {
				props[key] = toMerge[key];
			}
		}
	}

	return props;
}
