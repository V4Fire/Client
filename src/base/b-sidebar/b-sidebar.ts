/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iVisible from 'traits/i-visible/i-visible';
import iOpenToggle, { CloseHelperEvents } from 'traits/i-open-toggle/i-open-toggle';

import iData, { component, hook, ModsDecl, ModEvent, SetModEvent } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

@component()
export default class bSidebar<T extends Dictionary = Dictionary> extends iData<T>
	implements iVisible, iOpenToggle {

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iOpenToggle.mods,
		...iVisible.mods
	};

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
	}
}
