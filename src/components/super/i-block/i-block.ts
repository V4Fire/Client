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

import { component, UnsafeGetter } from 'core/component';
import type { Classes } from 'components/friends/provide';

import type { ModVal, ModsDecl, ModsProp, ModsDict } from 'components/super/i-block/modules/mods';
import type { UnsafeIBlock } from 'components/super/i-block/interface';

import iBlockProviders from 'components/super/i-block/providers';

export * from 'core/component';
export * from 'components/super/i-block/const';
export * from 'components/super/i-block/interface';

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

	/**
	 * Returns true if the specified object is a component
	 *
	 * @param obj
	 * @param [constructor] - the component constructor
	 */
	isComponent<T extends iBlock>(obj: unknown, constructor?: {new(): T} | Function): obj is T {
		return Object.isTruly(obj) && (<Dictionary>obj).instance instanceof (constructor ?? iBlock);
	}
}
