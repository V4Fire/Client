/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { PARENT } from 'core/component/const';
import { ComponentInterface } from 'core/component/interface';
import { ComponentMeta } from 'core/component/interface/meta';

import {

	ComponentDriver as Component,
	ComponentOptions,

	FunctionalComponentOptions,
	PropOptions as BasePropOptions

} from 'core/component/engines';

export interface PropOptions extends BasePropOptions {
	functional?: boolean;
}

export interface InitFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX, data: Dictionary): unknown;
}

export interface MergeFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX, oldCtx: CTX, field: string, link?: string): unknown;
}

export interface UniqueFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX, oldCtx: CTX): unknown;
}

export type ModVal = string | boolean | number;
export type StrictModDeclVal = CanArray<ModVal>;
export type ModDeclVal = StrictModDeclVal | typeof PARENT;

export interface ModsDecl {
	[name: string]: Array<ModDeclVal> | void;
}

export interface FunctionalCtx {
	componentName: string;
	meta: ComponentMeta;
	instance: Dictionary;
	$options: Dictionary;
}

export type RenderFunction =
	ComponentOptions<Component>['render'] |
	FunctionalComponentOptions['render'];

export interface SyncLink<T = unknown> {
	path: string;
	sync(value?: T): void;
}

export type SyncLinkCache<T = unknown> = Dictionary<
	Dictionary<SyncLink<T>>
>;

export type Hook =
	'beforeRuntime' |
	'beforeCreate' |
	'beforeDataCreate' |
	'created' |
	'beforeMount' |
	'beforeMounted' |
	'mounted' |
	'beforeUpdate' |
	'beforeUpdated' |
	'updated' |
	'beforeActivated' |
	'activated' |
	'deactivated' |
	'beforeDestroy' |
	'destroyed' |
	'errorCaptured';
