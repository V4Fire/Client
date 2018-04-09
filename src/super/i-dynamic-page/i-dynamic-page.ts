/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import URI = require('urijs');
import symbolGenerator from 'core/symbol';
import iData, { component, prop, hook } from 'super/i-data/i-data';

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
		this.initStateFromHash(state);
		this.async.on(window, 'hashchange', this.initStateFromHash, {
			label: $$.activate
		});
	}

	/**
	 * Deactivates the page
	 */
	@hook('deactivated')
	deactivate(): void {
		this.async.off('hashchange');
		$C(this.convertStateToHash()).forEach((el, key) => this[key] = undefined);
	}

	/**
	 * Gets values from the specified object and saves it to the block state
	 *
	 * @param obj
	 * @param [state] - state object
	 */
	setState(obj: Dictionary, state: Dictionary = this): void {
		return;
	}

	/**
	 * Saves the block state to the location.hash
	 * @param obj - state object
	 */
	setHash(obj: Dictionary): string | false {
		obj = this.convertStateToHash(obj);

		$C(obj).forEach((el, key) => {
			if (el) {
				this[key] = el;
			}
		});

		if (!this.blockActivated) {
			return false;
		}

		const
			hash = <string>Object.toQueryString(obj, {deep: true}),
			url = new URI();

		if (url.fragment()) {
			location.hash = hash;

		} else if (hash) {
			location.replace(url.hash(hash).toString());
		}

		return hash;
	}

	/**
	 * Resets the filter hash
	 */
	resetHash(): string {
		$C(this.convertStateToHash()).forEach((el, key) => this[key] = undefined);
		location.hash = '';
		return '';
	}

	/**
	 * Initialized the block state from hash values
	 * @param [state] - state object
	 */
	initStateFromHash(state: Dictionary = this): void {
		this.setState(Object.fromQueryString(new URI().fragment(), {deep: true}), state);
	}

	/**
	 * Returns an object with default block fields for hash
	 * @param [obj]
	 */
	protected convertStateToHash(obj?: Dictionary | undefined): Dictionary {
		return {...obj};
	}

	/**
	 * Accumulates a state for a setting hash
	 * @param obj - state object
	 */
	protected async accumulateHashState(obj: Dictionary): Promise<void> {
		const
			{tmp} = this;

		if (!tmp.hash) {
			tmp.hash = {};
		}

		Object.assign(tmp.hash, obj);

		try {
			await this.async.sleep(0.22.second(), {label: $$.accumulateHash});
			this.setHash(tmp.hash);
			tmp.hash = {};

		} catch (_) {}
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

		await this.accumulateHashState({...e.mixin, ...hashData});
	}
}
