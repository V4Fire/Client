/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

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
	static async open<T extends iBlock>(component: T): Promise<boolean> {
		return component.setMod('opened', true);
	}

	/**
	 * Closes the component
	 * @param component
	 */
	static async close<T extends iBlock>(component: T): Promise<boolean> {
		return component.setMod('opened', false);
	}

	/**
	 * Initializes close helpers
	 *
	 * @param component
	 * @param [events] - event names for helpers
	 */
	static initCloseHelpers<T extends iBlock>(component: T & iOpen, events: CloseHelperEvents = {}): void {
		const
			// @ts-ignore
			{async: $a, localEvent: $e} = component;

		const
			helpersGroup = {group: 'closeHelpers'},
			modsGroup = {group: 'closeHelpers:mods'};

		$a.off({group: /closeHelpers/});
		$e.on('block.mod.*.opened.*', component.onOpenedChange, modsGroup);
		$e.on('block.mod.set.opened.false', () => $a.off(helpersGroup), modsGroup);

		const onOpened = () => {
			$a.setTimeout(() => {
				const opts = {
					...helpersGroup,
					options: {passive: false}
				};

				try {
					$a.on(document, events.key || 'keyup', (e) => {
						if (e) {
							return component.onKeyClose(e);
						}

					}, opts);

					$a.on(document, events.touch || 'click touchend', (e) => {
						if (e) {
							return component.onTouchClose(e);
						}

					}, opts);

				} catch {}
			}, 0, helpersGroup);
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
	static initModEvents<T extends iBlock>(component: T): void {
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
	static async onKeyClose<T extends iBlock>(component: T & iOpen, e: KeyboardEvent): Promise<void> {
		if (e.key === 'Escape') {
			await component.close();
		}
	}

	/**
	 * Handler: close by a touch event
	 *
	 * @param component
	 * @param e
	 */
	static async onTouchClose<T extends iBlock>(component: T & iOpen, e: MouseEvent): Promise<void> {
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
	 * @param {...unknown} args
	 */
	abstract open(...args: unknown[]): Promise<boolean>;

	/**
	 * Closes the component
	 * @param {...unknown} args
	 */
	abstract close(...args: unknown[]): Promise<boolean>;

	/**
	 * Handler: opened modifier change
	 * @param e
	 */
	abstract onOpenedChange(e: ModEvent | SetModEvent): void;

	/**
	 * Handler: close by a keyboard event
	 * @param e
	 */
	abstract onKeyClose(e: KeyboardEvent): Promise<void>;

	/**
	 * Handler: close by a touch event
	 * @param e
	 */
	abstract onTouchClose(e: MouseEvent): Promise<void>;
}
