/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export type Value = Date[];
export type FormValue = CanArray<Date>;

export interface Day {
	text: string;
	active: boolean;
	disabled?: boolean;
	inRange?: boolean;
	rangeStart?: boolean;
	rangeEnd?: boolean;
}

export type Range = string | number | Date;
export type Directions = 'right' | 'left';
export type MonthSwitchDirection = 0 | 1;
