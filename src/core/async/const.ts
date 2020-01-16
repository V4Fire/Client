/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ClientNamespaces } from 'core/async/interface';
import { namespaces as superNamespaces } from 'core/async/const';
export * from 'core/async/const';

export const
	namespaces = {...superNamespaces, ...Object.convertEnumToDict(ClientNamespaces)};

export type NamespacesDictionary = typeof namespaces;
