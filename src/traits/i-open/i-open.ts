/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-unused-vars-experimental */

import type iBlock from 'super/i-block/i-block';
import type { ModsDecl, ModEvent, SetModEvent } from 'super/i-block/i-block';

export interface CloseHelperEvents {
	key?: string;
	touch?: string;
}

export default abstract class iOpen {
	/**
	 * Open modifiers
	 */
	static readonly mods: ModsDecl = {
		opened: [
			'true',
			'false'
		]
	};

	/** @see [[iOpen.open]] */
	static open: AddSelf<iOpen['open'], iBlock> =
		async (component) => component.setMod('opened', true);

	/** @see [[iOpen.close]] */
	static close: AddSelf<iOpen['close'], iBlock> =
		async (component) => component.setMod('opened', false);

	/** @see [[iOpen.onOpenedChange]] */
	static onOpenedChange: AddSelf<iOpen['onOpenedChange'], iBlock> = (component) => {
		// Loopback
	};

	/** @see [[iOpen.onKeyClose]] */
	static onKeyClose: AddSelf<iOpen['onKeyClose'], iBlock & iOpen> = async (component, e) => {
		if (e.key === 'Escape') {
			await component.close();
		}
	};

	/** @see [[iOpen.onTouchClose]] */
	static onTouchClose: AddSelf<iOpen['onTouchClose'], iBlock & iOpen> = async (component, e) => {
		const
			target = <CanUndef<Element>>e.target;

		if (target == null) {
			return;
		}

		if (!target.closest(`.${component.componentId}`)) {
			await component.close();
		}
	};

	/**
	 * Initializes close helper listeners
	 *
	 * @param component
	 * @param [events] - event names for helpers
	 */
	static initCloseHelpers<T extends iBlock>(component: T & iOpen, events: CloseHelperEvents = {}): void {
		const
			{async: $a, localEmitter: $e} = component.unsafe;

		const
			helpersGroup = {group: 'closeHelpers'},
			modsGroup = {group: 'closeHelpers:mods'};

		$a.off({group: /closeHelpers/});
		$e.on('block.mod.*.opened.*', component.onOpenedChange.bind(component), modsGroup);
		$e.on('block.mod.set.opened.false', () => $a.off(helpersGroup), modsGroup);

		const onOpened = () => {
			$a.setTimeout(() => {
				const opts = {
					...helpersGroup,
					options: {passive: false}
				};

				try {
					$a.on(document, events.key ?? 'keyup', (e) => {
						if (e != null) {
							return component.onKeyClose(e);
						}

					}, opts);

					$a.on(document, events.touch ?? 'click touchend', (e) => {
						if (e != null) {
							return component.onTouchClose(e);
						}

					}, opts);

				} catch {}
			}, 0, helpersGroup);
		};

		$e.on('block.mod.set.opened.true', onOpened, modsGroup);
	}

	/**
	 * Initializes modifier event listeners
	 *
	 * @emits open()
	 * @emits close()
	 *
	 * @param component
	 */
	static initModEvents<T extends iBlock>(component: T): void {
		const
			{localEmitter: $e} = component.unsafe;

		$e.on('block.mod.*.opened.*', (e: ModEvent) => {
			if (e.type === 'remove' && e.reason !== 'removeMod') {
				return;
			}

			component.emit(e.value === 'false' || e.type === 'remove' ? 'close' : 'open');
		});
	}

	/**
	 * Opens the component
	 * @param args
	 */
	open(...args: unknown[]): Promise<boolean> {
		return <any>null;
	}

	/**
	 * Closes the component
	 * @param args
	 */
	close(...args: unknown[]): Promise<boolean> {
		return <any>null;
	}

	/**
	 * Handler: opened modifier change
	 * @param e
	 */
	onOpenedChange(e: ModEvent | SetModEvent): void {
		return <any>null;
	}

	/**
	 * Handler: close by a keyboard event
	 * @param e
	 */
	onKeyClose(e: KeyboardEvent): Promise<void> {
		return <any>null;
	}

	/**
	 * Handler: close by a touch event
	 * @param e
	 */
	onTouchClose(e: MouseEvent): Promise<void> {
		return <any>null;
	}
}
