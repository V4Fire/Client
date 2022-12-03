/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-open/README.md]]
 *
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';

import type iBlock from 'super/i-block/i-block';
import type { ModsDecl, ModEvent, SetModEvent } from 'super/i-block/i-block';
import type { CloseHelperEvents } from 'traits/i-open/interface';

export * from 'traits/i-open/interface';

export default abstract class iOpen {
	/**
	 * Trait modifiers
	 */
	static readonly mods: ModsDecl = {
		opened: [
			'true',
			'false'
		]
	};

	/** @see [[iOpen.open]] */
	static open: AddSelf<iOpen['open'], iBlock> =
		(component) => SyncPromise.resolve(component.setMod('opened', true));

	/** @see [[iOpen.close]] */
	static close: AddSelf<iOpen['close'], iBlock> =
		(component) => SyncPromise.resolve(component.setMod('opened', false));

	/** @see [[iOpen.onOpenedChange]] */
	static onOpenedChange: AddSelf<iOpen['onOpenedChange'], iBlock> = async (_component) => {
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
	 * Initialize default event listeners to close a component by a keyboard or mouse
	 *
	 * @param component
	 * @param [events] - map with events to listen
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
	 * @emits `open()`
	 * @emits `close()`
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
	 *
	 * @param _args
	 */
	open(..._args: unknown[]): Promise<boolean> {
		return Object.throw();
	}

	/**
	 * Closes the component
	 *
	 * @param _args
	 */
	close(..._args: unknown[]): Promise<boolean> {
		return Object.throw();
	}

	/**
	 * Handler: the opened modifier has been changed
	 *
	 * @param _e
	 */
	onOpenedChange(_e: ModEvent | SetModEvent): Promise<void> {
		return Object.throw();
	}

	/**
	 * Handler: closing by a keyboard event
	 *
	 * @param _e
	 */
	onKeyClose(_e: KeyboardEvent): Promise<void> {
		return Object.throw();
	}

	/**
	 * Handler: closing by a touch event
	 *
	 * @param _e
	 */
	onTouchClose(_e: MouseEvent): Promise<void> {
		return Object.throw();
	}
}
