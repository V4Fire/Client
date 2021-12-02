/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { namespaces as superNamespaces } from '@v4fire/core/core/async/const';
import { ClientNamespaces } from '@src/core/async/interface';

export * from '@v4fire/core/core/async/const';

export const namespaces = {
	...superNamespaces,
	...Object.convertEnumToDict(ClientNamespaces)
};

export type NamespacesDictionary = typeof namespaces;

export const
	unsuspendRgxp = /:!suspend(?:\b|$)/;
