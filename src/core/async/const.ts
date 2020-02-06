/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ClientNamespaces } from 'core/async/interface';
import { namespaces as superNamespaces } from '@v4fire/core/core/async/const';
export * from '@v4fire/core/core/async/const';

export const
	namespaces = {...superNamespaces, ...Object.convertEnumToDict(ClientNamespaces)};

export type NamespacesDictionary = typeof namespaces;
