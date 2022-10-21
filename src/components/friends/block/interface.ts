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
	type: ModEventType;
	event: ModEventName;
	reason: ModEventReason;
	name: string;
	value: string;
}

export interface SetModEvent extends ModEvent {
	oldValue: CanUndef<string>;
}

export interface ElementModEvent {
	type: ModEventType;
	event: ModEventName;
	reason: ModEventReason;
	link: Element;
	element: string;
	name: string;
	value: string;
}

export interface SetElementModEvent extends ElementModEvent {
	oldValue: CanUndef<string>;
}
