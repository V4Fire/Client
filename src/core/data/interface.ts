/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { State } from 'core/component/state';
import type { ProviderOptions as SuperProviderOptions } from '@v4fire/core/core/data/interface';

export * from '@v4fire/core/core/data/interface';

export interface ProviderOptions extends SuperProviderOptions {
	id: string;
	remoteState?: State;
	i18n?: i18nFactory;
}
