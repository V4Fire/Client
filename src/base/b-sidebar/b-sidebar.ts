/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-sidebar/README.md]]
 * @packageDocumentation
 */

import { derive } from '@src/core/functools/trait';

import iVisible from '@src/traits/i-visible/i-visible';
import iOpenToggle, { CloseHelperEvents } from '@src/traits/i-open-toggle/i-open-toggle';
import iLockPageScroll from '@src/traits/i-lock-page-scroll/i-lock-page-scroll';

import iData, { component, hook, prop, ModsDecl } from '@src/super/i-data/i-data';

export * from '@src/super/i-data/i-data';
export * from '@src/traits/i-open-toggle/i-open-toggle';

interface bSidebar extends Trait<typeof iOpenToggle>, Trait<typeof iLockPageScroll> {}

/**
 * Component to create a sidebar with the feature of collapsing
 */
@component()
@derive(iOpenToggle, iLockPageScroll)
class bSidebar extends iData implements iVisible, iOpenToggle, iLockPageScroll {
	override readonly rootTag: string = 'aside';

	/**
	 * If true, then will be blocked the document' scrolling when the component is opened
	 */
	@prop(Boolean)
	readonly lockPageScroll: boolean = false;

	/**
	 * If false, the inner content of the component won't be rendered if the component isn't opened
	 */
	@prop(Boolean)
	readonly forceInnerRender: boolean = true;

	static override readonly mods: ModsDecl = {
		...iVisible.mods,

		opened: [
			...iOpenToggle.mods.opened ?? [],
			['false']
		]
	};

	/** @see [[iOpenToggle.onTouchClose]] */
	async onTouchClose(e: MouseEvent): Promise<void> {
		const
			target = <CanUndef<Element>>e.target;

		if (!target) {
			return;
		}

		const
			overWrapperSelector = this.block?.getElSelector('overWrapper');

		if (overWrapperSelector != null && target.matches(overWrapperSelector)) {
			e.preventDefault();
			await this.close();
		}
	}

	protected override syncStorageState(): Dictionary {
		return {
			'mods.opened': this.mods.opened
		};
	}

	/** @see [[iOpenToggle.initCloseHelpers]] */
	@hook('beforeDataCreate')
	protected initCloseHelpers(events?: CloseHelperEvents): void {
		iOpenToggle.initCloseHelpers(this, events);
	}

	protected override initModEvents(): void {
		super.initModEvents();

		iOpenToggle.initModEvents(this);
		iVisible.initModEvents(this);

		if (this.lockPageScroll) {
			iLockPageScroll.initModEvents(this);
		}
	}
}

export default bSidebar;
