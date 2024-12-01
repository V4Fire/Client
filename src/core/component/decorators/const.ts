/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { RegisteredComponent } from 'core/component/decorators/interface';

// Descriptor of the currently registered DSL component.
// It is initialized for each component file during the project's build phase.
// ```typescript
// import { registeredComponent } from 'core/component/decorators/const';
//
// import iBlock, { component } from 'components/super/i-block/i-block';
//
// registeredComponent.name = 'bExample';
// registeredComponent.layer = '@v4fire/client';
// registeredComponent.event = 'constructor.b-example.@v4fire/client';
//
// @component()
// class bExample extends iBlock {}
// ```
export const registeredComponent: RegisteredComponent = {
	name: undefined,
	layer: undefined,
	event: undefined
};
