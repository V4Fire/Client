/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Provider, {

	provider,

	Mocks

} from 'core/data';

export * from 'core/data';

@provider
export default class Dummy extends Provider {
	override mocks: Mocks = import('models/dummy/mocks');
}
