/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { EventEmitterLike } from 'core/async';

import iDynamicPage, { component, prop, field, watch, Statuses } from 'super/i-dynamic-page/i-dynamic-page';
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
	@prop({
		type: Function,
		default: (e) => e && (e.component || e.page),
		forceDefault: true
	})

	readonly eventConverter!: Function;

	/**
	 * Component name
	 */
	@field((o) => o.sync.link())
	page?: string;

	/**
	 * Link to a page component
	 */
	get component(): CanUndef<iDynamicPage> {
		return this.$refs.component;
	}

	/** @override */
	protected readonly componentStatusStore: Statuses = 'ready';

	/** @override */
	protected readonly $refs!: {component?: iDynamicPage};

	/** @override */
	async initLoad(data?: unknown, silent?: boolean): Promise<void> {
		return undefined;
	}

	/** @override */
	async reload(): Promise<void> {
		const {component} = this.$refs;
		return component && component.reload();
	}

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

				const
					v = this.eventConverter ? this.eventConverter(e, this.page) : e;

				if (v == null || Object.isString(v)) {
					this.page = v;
				}

			}, group);
		}
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('hidden', 'page', (v) => !v);
	}
}
