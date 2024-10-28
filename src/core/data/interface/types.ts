/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { State } from 'core/component/state';
import type { ProviderOptions as SuperProviderOptions } from '@v4fire/core/core/data/interface/types';
import type { Provider } from 'core/data/interface';

export * from '@v4fire/core/core/data/interface/types';

export interface ProviderOptions extends SuperProviderOptions {
	id: string;
	remoteState?: State;
	i18n?: i18nFactory;
}

export interface ProviderConstructor {
	new(opts: ProviderOptions): Provider;
}

export type ExtraProviderConstructor =
	string |
	Provider |
	ProviderConstructor;
