/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import symbolGenerator from 'core/symbol';
import iData, { component, hook } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';
export interface OnFilterChange {
	mixin?: Dictionary;
	modifier?(value: any): any;
}

export const
	$$ = symbolGenerator();

@component()
export default class iDynamicPage<T extends Dictionary = Dictionary> extends iData<T> {
	/** @override */
	readonly needReInit: boolean = true;

	/**
	 * Activates the page
	 * @param [state] - state object
	 */
	@hook('beforeDataCreate')
	@hook('activated')
	activate(state: Dictionary = this): void {
		this.initStateFromLocation(state);
		this.async.on(window, 'hashchange', this.initStateFromLocation, {
			label: $$.activate
		});
	}

	/**
	 * Deactivates the page
	 */
	@hook('deactivated')
	deactivate(): void {
		this.async.off('hashchange');
		$C(this.convertStateToLocation()).forEach((el, key) => this[key] = undefined);
	}

	/**
	 * Saves the component state to the location
	 * @param obj - state object
	 */
	saveStateToLocation(obj: Dictionary): string | false {
		obj = this.convertStateToLocation(obj);

		$C(obj).forEach((el, key) => {
			if (el) {
				this[key] = el;
			}
		});

		if (!this.isActivated) {
			return false;
		}

		const
			hash = <string>Object.toQueryString(obj, {deep: true}),
			url = new URL(location.href);

		if (url.hash.slice(1)) {
			location.hash = hash;

		} else if (hash) {
			url.hash = hash;
			location.replace(url.toString());
		}

		return hash;
	}

	/**
	 * Resets the filter hash
	 */
	resetLocationState(): string {
		$C(this.convertStateToLocation()).forEach((el, key) => this[key] = undefined);
		location.hash = '';
		return '';
	}

	/**
	 * Initialized the component state from the location
	 * @param [state] - state object
	 */
	initStateFromLocation(state: Dictionary = this): void {
		this.setState(Object.fromQueryString(new URL(location.href).hash.slice(1), {deep: true}), state);
	}

	/**
	 * Returns an object with default component fields for hash
	 * @param [obj]
	 */
	protected convertStateToLocation(obj?: Dictionary | undefined): Dictionary {
		return {...obj};
	}

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

		await this.accumulateTmpObj({...e.mixin, ...hashData}, $$.state, this.saveStateToLocation);
	}
}
