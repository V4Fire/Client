/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/browser/README.md]]
 * @packageDocumentation
 */

import semver, { Operation } from 'core/semver';
import { is } from 'core/browser/const';

export * from 'core/browser/const';
export * from 'core/browser/helpers';
export * from 'core/browser/interface';

/**
 * It returns true if the `navigator.userAgent` matches the given parameters
 *
 * @param platform - the browser platform
 * @param [operation] - the operation type (>, >=, etc.)
 * @param [version] - the browser version
 *
 * @example
 * ```js
 * console.log(test('Android', '>=', '5.1'));
 * ```
 */
export function test(platform: keyof typeof is, operation?: Operation, version?: string): boolean {
	const
		val = is[platform];

	if (val === false) {
		return false;
	}

	if (operation == null || version == null) {
		return true;
	}

	if (val[1] == null) {
		return false;
	}

	return semver(val[1].join('.'), version, operation);
}
