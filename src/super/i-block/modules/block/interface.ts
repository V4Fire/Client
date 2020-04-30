/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export type ModEventType =
	'set' |
	'remove';

export type ModEventName =
	'block.mod.set' |
	'block.mod.remove' |
	'el.mod.set' |
	'el.mod.remove';

export type ModEventReason =
	'initSetMod' |
	'setMod' |
	'removeMod';

export interface ModEvent {
	event: ModEventName;
	type: ModEventType;
	reason: ModEventReason;
	name: string;
	value: string;
}

export interface SetModEvent extends ModEvent {
	prev: CanUndef<string>;
}

export interface ElementModEvent {
	event: ModEventName;
	type: ModEventType;
	reason: ModEventReason;
	element: string;
	link: HTMLElement;
	modName: string;
	value: string;
}

export interface SetElementModEvent extends ElementModEvent {
	prev: CanUndef<string>;
}
