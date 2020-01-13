/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iVisible from 'traits/i-visible/i-visible';
import iOpenToggle, { CloseHelperEvents } from 'traits/i-open-toggle/i-open-toggle';
import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';

import iData, { component, hook, prop, wait, ModsDecl, ModEvent, SetModEvent } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';
export * from 'traits/i-open-toggle/i-open-toggle';

@component()
export default class bSidebar extends iData implements iVisible, iOpenToggle, iLockPageScroll {
	/**
	 * If true, then will be blocked the scrolling of the document when component is opened
	 */
	@prop(Boolean)
	readonly lockPageScroll: boolean = false;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iVisible.mods,

		opened: [
			...iOpenToggle.mods.opened,
			['false']
		]
	};

	/** @see iLockPageScroll.lock */
	@wait('loading')
	lock(): Promise<void> {
		return iLockPageScroll.lock(this);
	}

	/** @see iLockPageScroll.unlock */
	unlock(): Promise<void> {
		return iLockPageScroll.unlock(this);
	}

	/** @see iOpenToggle.open */
	open(): Promise<boolean> {
		return iOpenToggle.open(this);
	}

	/** @see iOpenToggle.close */
	close(): Promise<boolean> {
		return iOpenToggle.close(this);
	}

	/** @see iOpenToggle.toggle */
	toggle(): Promise<boolean> {
		return iOpenToggle.toggle(this);
	}

	/** @see iOpenToggle.onOpenedChange */
	onOpenedChange(e: ModEvent | SetModEvent): void {
		// ...
	}

	/** @see iOpenToggle.onKeyClose */
	onKeyClose(e: KeyboardEvent): Promise<void> {
		return iOpenToggle.onKeyClose(this, e);
	}

	/** @see iOpenToggle.onTouchClose */
	async onTouchClose(e: MouseEvent): Promise<void> {
		const
			target = <Element>e.target;

		if (!target) {
			return;
		}

		if (target.matches(this.block.getElSelector('overWrapper'))) {
			e.preventDefault();
			await this.close();
		}
	}

	/** @override */
	protected syncStorageState(): Dictionary {
		return {
			'mods.opened': this.mods.opened
		};
	}

	/** @see iOpenToggle.initCloseHelpers */
	@hook('beforeDataCreate')
	protected initCloseHelpers(events?: CloseHelperEvents): void {
		iOpenToggle.initCloseHelpers(this, events);
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iOpenToggle.initModEvents(this);
		iVisible.initModEvents(this);
		this.lockPageScroll && iLockPageScroll.initModEvents(this);
	}
}
