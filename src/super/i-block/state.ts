/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import config from 'config';

import { component, globalState, Hook } from 'core/component';
import type { Module } from 'friends/module-loader';

import { readyStatuses } from 'super/i-block/modules/activation';
import { field, system, computed } from 'super/i-block/modules/decorators';
import type { Stage, ComponentStatus } from 'super/i-block/interface';

import iBlockMods from 'super/i-block/mods';
import {ComponentStatuses} from "super/i-block/interface";

@component()
export default abstract class iBlockState extends iBlockMods {
	/**
	 * List of additional dependencies to load
	 * @see [[iBlock.dependenciesProp]]
	 */
	@system((o) => o.sync.link((val) => {
		const componentStaticDependencies = config.componentStaticDependencies[o.componentName];
		return Array.concat([], componentStaticDependencies, val);
	}))

	dependencies!: Module[];

	/**
	 * Component stage value
	 * @see [[iBlock.stageProp]]
	 */
	@computed()
	get stage(): CanUndef<Stage> {
		return this.field.get('stageStore');
	}

	/**
	 * Sets a new component stage value.
	 * By default, it clears all async listeners from the group of `stage.${oldGroup}`.
	 *
	 * @see [[iBlock.stageProp]]
	 * @emits `stage:${value}(value: CanUndef<Stage>, oldValue: CanUndef<Stage>)`
	 * @emits `stageChange(value: CanUndef<Stage>, oldValue: CanUndef<Stage>)`
	 */
	set stage(value: CanUndef<Stage>) {
		const
			oldValue = this.stage;

		if (oldValue === value) {
			return;
		}

		this.async.clearAll({group: this.stageGroup});
		this.field.set('stageStore', value);

		if (value != null) {
			this.emit(`stage:${value}`, value, oldValue);
		}

		this.emit('stageChange', value, oldValue);
	}

	/**
	 * Group name of the current stage
	 */
	@computed()
	get stageGroup(): string {
		return `stage.${this.stage}`;
	}

	/**
	 * A Link to the remote state object.
	 *
	 * The remote state object is a special watchable object that provides some parameters
	 * that can't be initialized within a component directly. You can modify this object outside of components,
	 * but remember that these mutations may force the re-rendering of all components.
	 */
	@computed({watchable: true})
	get remoteState(): typeof globalState {
		return globalState;
	}

	/**
	 * A component status.
	 * This parameter is pretty similar to the `hook` parameter.
	 * But, the hook represents a component status relative to its MVVM instance: created, mounted, destroyed, etc.
	 * Opposite to "hook", "componentStatus" represents a logical component status:
	 *
	 *   *) unloaded - a component was just created without any initializing:
	 *      this status can intersect with some hooks, like `beforeCreate` or `created`.
	 *
	 *   *) loading - a component starts to load data from its own providers:
	 *      this status can intersect with some hooks, like `created` or `mounted`.
	 *      If the component was mounted with this status, you can show by using UI that the data is loading.
	 *
	 *   *) beforeReady - a component was fully loaded and started to prepare to render:
	 *      this status can intersect with some hooks like `created` or `mounted`.
	 *
	 *   *) ready - a component was fully loaded and rendered:
	 *      this status can intersect with the `mounted` hook.
	 *
	 *   *) inactive - a component is frozen by keep-alive mechanism or special input property:
	 *      this status can intersect with the `deactivated` hook.
	 *
	 *   *) destroyed - a component was destroyed:
	 *      this status can intersect with some hooks, like `beforeDestroy` or `destroyed`.
	 */
	@computed()
	get componentStatus(): ComponentStatus {
		return this.shadowComponentStatusStore ?? this.field.get<ComponentStatus>('componentStatusStore') ?? 'unloaded';
	}

	/**
	 * Sets a new component status.
	 * Notice, not all statuses emit component' re-rendering: `unloaded`, `inactive`, `destroyed` will emit only an event.
	 *
	 * @param value
	 * @emits `componentStatus:{$value}(value: ComponentStatus, oldValue: ComponentStatus)`
	 * @emits `componentStatusChange(value: ComponentStatus, oldValue: ComponentStatus)`
	 */
	set componentStatus(value: ComponentStatus) {
		const
			oldValue = this.componentStatus;

		if (oldValue === value && value !== 'beforeReady') {
			return;
		}

		const isShadowStatus =
			this.isNotRegular ||

			value === 'ready' && oldValue === 'beforeReady' ||
			value === 'inactive' && !this.renderOnActivation ||

			(<typeof iBlock>this.instance.constructor).shadowComponentStatuses[value];

		if (isShadowStatus) {
			this.shadowComponentStatusStore = value;

		} else {
			this.shadowComponentStatusStore = undefined;
			this.field.set('componentStatusStore', value);

			if (this.isReady && this.dependencies.length > 0) {
				void this.forceUpdate();
			}
		}

		this.emit(`componentStatus:${value}`, value, oldValue);
		this.emit('componentStatusChange', value, oldValue);
	}

	/** @inheritDoc */
	get hook(): Hook {
		return this.hookStore;
	}

	/**
	 * True if the current component is completely ready to work.
	 * The `ready` status is mean, that component was mounted an all data provider are loaded.
	 */
	@computed()
	get isReady(): boolean {
		return Boolean(readyStatuses[this.componentStatus]);
	}

	/**
	 * A map of component shadow statuses.
	 * These statuses don't emit re-rendering of a component.
	 *
	 * @see [[iBlock.componentStatus]]
	 */
	static readonly shadowComponentStatuses: ComponentStatuses = {
		inactive: true,
		destroyed: true,
		unloaded: true
	};

	/**
	 * Component initialize status store
	 * @see [[iBlock.componentStatus]]
	 */
	@field({
		unique: true,
		forceUpdate: false,
		functionalWatching: false
	})

	protected componentStatusStore: ComponentStatus = 'unloaded';

	/**
	 * Component initialize status store for unwatchable statuses
	 * @see [[iBlock.componentStatus]]
	 */
	@system({unique: true})
	protected shadowComponentStatusStore?: ComponentStatus;

	/**
	 * Component stage store
	 * @see [[iBlock.stageProp]]
	 */
	@field({
		forceUpdate: false,
		functionalWatching: false,
		init: (o) => o.sync.link<CanUndef<Stage>>((val) => {
			o.stage = val;
			return o.field.get('stageStore');
		})
	})

	protected stageStore?: Stage;

	/**
	 * Component hook store
	 * @see [[iBlock.hook]]
	 */
	protected hookStore: Hook = 'beforeRuntime';

	/**
	 * Switches the component to a new hook
	 *
	 * @param value
	 * @emits `componentHook:{$value}(value: Hook, oldValue: Hook)`
	 * @emits `componentHookChange(value: Hook, oldValue: Hook)
	 */
	protected set hook(value: Hook) {
		const oldValue = this.hook;
		this.hookStore = value;

		if ('lfc' in this && !this.lfc.isBeforeCreate('beforeDataCreate')) {
			this.emit(`componentHook:${value}`, value, oldValue);
			this.emit('componentHookChange', value, oldValue);
		}
	}
}
