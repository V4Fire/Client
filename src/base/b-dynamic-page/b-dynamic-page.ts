/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import iDynamicPage, { component, prop, field, watch } from 'super/i-dynamic-page/i-dynamic-page';
import { EventEmitterLike } from 'core/async';
export * from 'super/i-data/i-data';

export type KeepAlive =
	string |
	string[] |
	RegExp;

@component({
	inheritMods: false,
	defaultProps: false
})

export default class bDynamicPage extends iDynamicPage {
	/** @override */
	@prop({forceDefault: true})
	readonly selfDispatching: boolean = true;

	/**
	 * Initial component name
	 */
	@prop({type: String, required: false})
	readonly pageProp?: string;

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
	@prop({
		type: String,
		required: false,
		forceDefault: true
	})

	readonly event?: string = 'setRoute';

	/**
	 * Event value converter
	 */
	@prop({type: Function, required: false})
	readonly eventConverter?: Function;

	/**
	 * Component name
	 */
	@field((o) => o.link())
	page?: string;

	/**
	 * Link to a page component
	 */
	get component(): CanUndef<iDynamicPage> {
		return this.$refs.component;
	}

	/** @override */
	protected readonly $refs!: {component?: iDynamicPage};

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
			$a.on(this.emitter || this.$root, this.event, (component, e) => {
				if (component != null && !((<Dictionary>component).instance instanceof iBlock)) {
					e = component;
				}

				this.page = this.eventConverter ? this.eventConverter(e, this.page) : e;
			}, group);
		}
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.bindModTo('hidden', 'page', (v) => !v);
	}
}
