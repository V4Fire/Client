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

export interface ComponentDescriptor {
	meta: ComponentMeta;
	parentMeta: CanNull<ComponentMeta>;
}

export interface ComponentPartDecorator3 {
	(component: ComponentDescriptor, partKey: string, proto: object): void;
}

export interface ComponentPartDecorator4 {
	(component: ComponentDescriptor, partKey: string, partDesc: CanUndef<PropertyDescriptor>, proto: object): void;
}

export interface PartDecorator {
	(target: object, partKey: string, partDesc?: PropertyDescriptor): void;
}

export interface RegisteredComponent {
	name?: string;
	layer?: string;
	event?: string;
	methods?: string[];
	accessors?: string[];
}
