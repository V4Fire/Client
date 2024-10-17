/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { KeyedEvent, ModifierGuards } from 'components/directives/safe-on/interface';

const systemModifiers = <const>['ctrl', 'shift', 'alt', 'meta'];

type GuardFn = ((e: Event) => boolean) | ((e: Event, modifiers: string[]) => boolean);

/**
 * Modifier guards
 */
export const modifierGuards: Record<ModifierGuards, GuardFn> = {
	stop: (e: Event) => {
		e.stopPropagation();
		return false;
	},
	prevent: (e: Event) => {
		e.preventDefault();
		return false;
	},
	self: (e: Event) => e.target !== e.currentTarget,
	ctrl: (e: Event) => !(<KeyedEvent>e).ctrlKey,
	shift: (e: Event) => !(<KeyedEvent>e).shiftKey,
	alt: (e: Event) => !(<KeyedEvent>e).altKey,
	meta: (e: Event) => !(<KeyedEvent>e).metaKey,
	left: (e: Event) => 'button' in e && (<MouseEvent>e).button !== 0,
	middle: (e: Event) => 'button' in e && (<MouseEvent>e).button !== 1,
	right: (e: Event) => 'button' in e && (<MouseEvent>e).button !== 2,
	exact: (e, modifiers) =>
		systemModifiers.some((m) => e[`${m}Key`] != null && !modifiers.includes(m))
};

/**
 * True, if the specified name is an options modifier
 * @param name
 */
export const isOptionsModifier = (name: string): boolean => /(?:once|passive|capture)$/.test(name);
