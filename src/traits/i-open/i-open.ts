/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import keyCodes from 'core/key-codes';
import iBlock, { ModsDecl, ModEvent, SetModEvent } from 'super/i-block/i-block';

export interface CloseHelperEvents {
	key?: string;
	touch?: string;
}

export default abstract class iOpen {
	/**
	 * Opens the component
	 * @param component
	 */
	static async open(component: iBlock): Promise<boolean> {
		return component.setMod('opened', true);
	}

	/**
	 * Closes the component
	 * @param component
	 */
	static async close(component: iBlock): Promise<boolean> {
		return component.setMod('opened', false);
	}

	/**
	 * Initializes close helpers
	 *
	 * @param component
	 * @param [events] - event names for helpers
	 */
	static initCloseHelpers(component: iBlock & iOpen, events: CloseHelperEvents = {}): void {
		const
			// @ts-ignore
			{async: $a, localEvent: $e} = component;

		const
			helpersGroup = {group: 'closeHelpers'},
			modsGroup = {group: 'closeHelpers:mods'};

		$e.off({group: /closeHelpers/});
		$e.on('block.mod.*.opened.*', component.onOpenedChange, modsGroup);
		$e.on('block.mod.set.opened.false', () => $e.off(helpersGroup), modsGroup);

		const onOpened = () => {
			$a.setImmediate(() => {
				try {
					$a.on(document, events.key || 'keyup', this.onKeyClose, helpersGroup);
					$a.on(document, events.touch || 'click', this.onTouchClose, helpersGroup);

				} catch {}
			}, helpersGroup);
		};

		$e.on('block.mod.set.opened.true', onOpened, modsGroup);
	}

	/**
	 * Initializes modifiers event listeners
	 *
	 * @emits open()
	 * @emits close()
	 *
	 * @param component
	 */
	static initModEvents(component: iBlock): void {
		const
			// @ts-ignore
			{localEvent: $e} = component;

		$e.on('block.mod.*.opened.*', (e) => {
			component.emit(e.value === 'false' || e.type === 'remove' ? 'close' : 'open');
		});
	}

	/**
	 * Handler: close by a keyboard event
	 *
	 * @param component
	 * @param e
	 */
	static async onKeyClose(component: iBlock & iOpen, e: KeyboardEvent): Promise<void> {
		if (e.keyCode === keyCodes.ESC) {
			await component.close();
		}
	}

	/**
	 * Handler: close by a touch event
	 *
	 * @param component
	 * @param e
	 */
	static async onTouchClose(component: iBlock & iOpen, e: MouseEvent): Promise<void> {
		const
			target = <Element>e.target;

		if (!target) {
			return;
		}

		if (!target.closest(`.${component.componentId}`)) {
			await component.close();
		}
	}

	/**
	 * Open modifiers
	 */
	static readonly mods: ModsDecl = {
		opened: [
			'true',
			'false'
		]
	};

	/**
	 * Opens the component
	 */
	abstract open(): Promise<boolean>;

	/**
	 * Closes the component
	 */
	abstract close(): Promise<boolean>;

	/**
	 * Handler: opened modifier change
	 * @param e
	 */
	protected abstract onOpenedChange(e: ModEvent | SetModEvent): void;

	/**
	 * Handler: close by a keyboard event
	 * @param e
	 */
	protected abstract onKeyClose(e: KeyboardEvent): Promise<void>;

	/**
	 * Handler: close by a touch event
	 * @param e
	 */
	protected abstract onTouchClose(e: MouseEvent): Promise<void>;
}
