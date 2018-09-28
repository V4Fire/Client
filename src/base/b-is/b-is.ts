/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitterLike } from 'core/async';
import iBlock, { component, prop, field, watch } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export type KeepAlive =
	string |
	string[] |
	RegExp;

@component({functional: true})
export default class bIs extends iBlock {
	/**
	 * Initial component name
	 */
	@prop({type: String, required: false})
	readonly componentProp?: string;

	/**
	 * If true, then will be using keep-alive
	 */
	readonly keepAlive: boolean = false;

	/**
	 * Value for keep-alive :include
	 */
	@prop({type: [String, Array, RegExp], required: false})
	readonly include?: KeepAlive;

	/**
	 * Value for keep-alive :exclude
	 */
	@prop({type: [String, Array, RegExp], required: false})
	readonly exclude?: KeepAlive;

	/**
	 * Link to an event emitter
	 */
	@prop({type: Object, required: false})
	readonly emitter?: EventEmitterLike;

	/**
	 * Event name for listening
	 */
	@prop({type: String, required: false})
	readonly event?: string = 'set';

	/**
	 * Event value converter
	 */
	@prop({type: Function, required: false})
	readonly eventConverter?: Function;

	/**
	 * Component name
	 */
	@field((o) => o.link())
	component?: string;

	/**
	 * Synchronization for the emitter prop
	 */
	@watch('emitter')
	@watch({field: 'event', immediate: true})
	protected syncEmitterWatcher(): void {
		const
			{async: $a} = this,
			group = {group: 'emitter'};

		$a.clearAll(group);

		if (this.event) {
			$a.on(this.emitter || this.$root, this.event, (e) => {
				this.component = this.eventConverter ? this.eventConverter(e, this.component) : e;
			}, group);
		}
	}
}
