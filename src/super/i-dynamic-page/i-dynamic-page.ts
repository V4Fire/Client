/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iPage, { component } from 'super/i-page/i-page';
export * from 'super/i-page/i-page';

export interface OnFilterChange {
	mixin?: Dictionary;
	modifier?(value: unknown): unknown;
}

export const
	$$ = symbolGenerator();

@component()
export default class iDynamicPage<T extends Dictionary = Dictionary> extends iPage<T> {
	/**
	 * Handler: filter change
	 *
	 * @param args - tuple:
	 *   1) el - event component
	 *   2) value - component value
	 *   3) [defKey] - default state key
	 *
	 * @param [key] - state key
	 * @param [e] - additional event parameters:
	 *   *) [mixin] - filter mixin
	 *   *) [modifier] - value modifier
	 */
	protected async onFilterChange(args: IArguments, key: string = args[2], e: OnFilterChange = {}): Promise<void> {
		let
			hashData = {};

		if (key) {
			const value = args[1];
			hashData = {[key]: e.modifier ? e.modifier(value) : value};
		}

		await this.accumulateTmpObj({...e.mixin, ...hashData}, $$.state, this.saveStateToRouter);
	}
}
