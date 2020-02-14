/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentParams, ComponentMeta } from 'core/component/interface';

export interface ComponentInfo {
	name: string;
	componentName: string;
	isAbstract: boolean;
	isSmart: boolean;
	constructor: Function;
	params: ComponentParams;
	parent?: Function;
	parentParams?: ComponentParams;
	parentMeta?: ComponentMeta;
}
