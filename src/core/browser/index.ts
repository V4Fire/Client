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

import semver, { Operation } from '/core/semver';
import { is } from '/core/browser/const';

export * from '/core/browser/const';
export * from '/core/browser/helpers';

/**
 * Returns true if `navigator.userAgent` matches with the specified parameters
 *
 * @param platform - browser platform
 * @param [operation] - operation type (>, >=, etc.)
 * @param [version] - browser version
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
