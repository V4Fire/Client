/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-block/README.md]]
 * @packageDocumentation
 */

import { component, watch, UnsafeGetter } from 'core/component';
import type { Classes } from 'components/friends/provide';

import type { ModVal, ModsDecl, ModsProp, ModsDict } from 'components/super/i-block/modules/mods';
import type { UnsafeIBlock } from 'components/super/i-block/interface';

import iBlockProviders from 'components/super/i-block/providers';

//#if runtime has dummyComponents
import('components/super/i-block/test/b-super-i-block-dummy');
import('components/super/i-block/test/b-super-i-block-watch-dummy');
import('components/super/i-block/test/b-super-i-block-lfc-dummy');
import('components/super/i-block/test/b-super-i-block-destructor-dummy');
import('components/super/i-block/test/b-super-i-block-deactivation-dummy');
//#endif

export * from 'core/component';
export { Module } from 'components/friends/module-loader';

export * from 'components/super/i-block/const';
export * from 'components/super/i-block/interface';

export { Theme } from 'components/super/i-block/mods';
export { ComponentEvent, InferEvents, InferComponentEvents } from 'components/super/i-block/event';
export { prop, field, system, computed, hook, watch, wait } from 'components/super/i-block/decorators';

export {

	ModEvent,
	ModEventName,
	ModEventReason,
	ModEventType,
	SetModEvent,

	ElementModEvent,
	SetElementModEvent

} from 'components/friends/block';

export { Classes, ModVal, ModsDecl, ModsProp, ModsDict };

@component()
export default abstract class iBlock extends iBlockProviders {
	override get unsafe(): UnsafeGetter<UnsafeIBlock<this>> {
		return Object.cast(this);
	}

	static override readonly mods: ModsDecl = {
		diff: [
			'true',
			'false'
		],

		theme: [],
		exterior: [],
		context: [],
		stage: []
	};

	protected override readonly $refs!: {
		$el?: Element;
	};

	/**
	 * Returns true if the specified object is a component
	 *
	 * @param obj
	 * @param [constructor] - the component constructor
	 */
	isComponent<T extends iBlock>(obj: unknown, constructor?: {new(): T} | Function): obj is T {
		return Object.isTruly(obj) && (<Dictionary>obj).instance instanceof (constructor ?? iBlock);
	}

	/**
	 * Fixes the issue where the teleported component
	 * and its DOM nodes were rendered before the teleport container was ready
	 */
	@watch('r.shouldMountTeleports')
	protected async shouldMountTeleports(): Promise<void> {
		await this.nextTick();

		if (this.$el && this.$el.component !== this) {
			// Fix the DOM element link to the component
			this.$el.component = this;

			Object.defineProperty(this.unsafe, '$el', {
				configurable: true,
				get: () => this.$refs[this.$resolveRef('$el')] ?? this.$el
			});

			// Fix the teleported DOM element link to the component
			this.$el.component = this;
		}
	}
}
