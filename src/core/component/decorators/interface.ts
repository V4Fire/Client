/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentMeta } from 'core/component/meta';

export interface DecoratorFunctionalOptions {
	/**
	 * If set to false, this value can't be used with a functional component
	 * @default `true`
	 */
	functional?: boolean;
}

interface ComponentDescriptor {
	meta: ComponentMeta;
	parentMeta: CanNull<ComponentMeta>;
}

export interface ComponentPartDecorator {
	(component: ComponentDescriptor, partKey: string, partDesc?: PropertyDescriptor): void;
}

export interface PartDecorator {
	(target: object, partKey: string, partDesc?: PropertyDescriptor): void;
}
