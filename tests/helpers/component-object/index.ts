/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'components/super/i-block/i-block';
import ComponentObjectMock from 'tests/helpers/component-object/mock';

export default class ComponentObject<COMPONENT extends iBlock = iBlock> extends ComponentObjectMock<COMPONENT> {
	// ...
}
