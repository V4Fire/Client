/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:config/README.md]]
 * @packageDocumentation
 */

import { extend } from '@v4fire/core/config';

export * from '@v4fire/core/config';
export { default } from '@v4fire/core/config';

extend({
	components: COMPONENTS
});
