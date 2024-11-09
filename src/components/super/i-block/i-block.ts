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

import { hook, watch } from 'components/super/i-block/decorators';
import type { ModVal, ModsDecl, ModsProp, ModsDict } from 'components/super/i-block/modules/mods';
import type { UnsafeIBlock } from 'components/super/i-block/interface';

import iBlockProviders from 'components/super/i-block/providers';

//#if runtime has dummyComponents
import('components/super/i-block/test/b-super-i-block-dummy');
import('components/super/i-block/test/b-super-i-block-mods-dummy');
import('components/super/i-block/test/b-super-i-block-watch-dummy');
import('components/super/i-block/test/b-super-i-block-lfc-dummy');
import('components/super/i-block/test/b-super-i-block-destructor-dummy');
import('components/super/i-block/test/b-super-i-block-deactivation-dummy');
import('components/super/i-block/test/b-super-i-block-teleport-dummy');
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

@component({inheritMods: false})
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

	/** @inheritDoc */
	declare protected readonly $refs: {
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
	 * Handler: fixes the issue where the teleported component
	 * and its DOM nodes were rendered before the teleport container was ready
	 */
	@watch<iBlock>({
		path: 'r.shouldMountTeleports',
		flush: 'post',
		shouldInit: (o) => o.r.shouldMountTeleports === false
	})

	@hook('before:mounted')
	protected onMountTeleports(): void {
		const {$el: originalNode, $async: $a} = this;

		if (originalNode == null) {
			return;
		}

		const getNode = () => this.$refs[this.$resolveRef('$el')] ?? this.$el;

		const node = getNode();

		let attrsStore: CanNull<Set<string>> = null;

		if (node != null && originalNode !== node) {
			// Fix the DOM element link to the component
			originalNode.component = this;

			// Fix the teleported DOM element link to the component
			node.component = this;

			Object.defineProperty(this.unsafe, '$el', {
				configurable: true,
				get: () => node
			});

			mountAttrs(this.$attrs);
			this.watch('$attrs', {deep: true}, mountAttrs);
		}

		function mountAttrs(attrs: Dictionary<string>) {
			const mountedAttrsGroup = {group: 'mountedAttrs'};
			$a.terminateWorker(mountedAttrsGroup);

			if (node == null || originalNode == null) {
				return;
			}

			attrsStore ??= new Set<string>();
			const mountedAttrs = attrsStore;

			Object.entries(attrs).forEach(([name, attr]) => {
				if (attr == null) {
					return;
				}

				if (name === 'class') {
					attr.split(/\s+/).forEach((val) => {
						node.classList.add(val);
						mountedAttrs.add(`class.${val}`);
					});

				} else if (originalNode.hasAttribute(name)) {
					node.setAttribute(name, attr);
					mountedAttrs.add(name);
				}
			});

			$a.worker(() => {
				mountedAttrs.forEach((attr) => {
					if (attr.startsWith('class.')) {
						node.classList.remove(attr.split('.')[1]);

					} else {
						node.removeAttribute(attr);
					}
				});

				mountedAttrs.clear();
			}, mountedAttrsGroup);
		}
	}

	/**
	 * Registers the handlers which will be called just before rendering the component
	 */
	@hook('beforeRuntime')
	private registerRenderHandlers(): void {
		this.$on('[[RENDER]]', () => {
			this.vdom.saveRenderContext();
			this.hydrateStyles();
		});
	}
}
