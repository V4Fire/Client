/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/traits/i-open/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';

import type iBlock from 'components/super/i-block/i-block';
import type { ModsDecl, ModEvent, SetModEvent } from 'components/super/i-block/i-block';

import type { CloseHelperEvents } from 'components/traits/i-open/interface';

export * from 'components/traits/i-open/interface';

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

	/** {@link iOpen.prototype.open} */
	static open: AddSelf<iOpen['open'], iBlock> =
		(component) => SyncPromise.resolve(component.setMod('opened', true));

	/** {@link iOpen.prototype.close} */
	static close: AddSelf<iOpen['close'], iBlock> =
		(component) => SyncPromise.resolve(component.setMod('opened', false));

	/** {@link iOpen.prototype.onOpenedChange} */
	static onOpenedChange: AddSelf<iOpen['onOpenedChange'], iBlock> = async (_component) => {
		// Loopback
	};

	/** {@link iOpen.prototype.onKeyClose} */
	static onKeyClose: AddSelf<iOpen['onKeyClose'], iBlock & iOpen> = async (component, e) => {
		if (e.key === 'Escape') {
			await component.close();
		}
	};

	/** {@link iOpen.prototype.onTouchClose} */
	static onTouchClose: AddSelf<iOpen['onTouchClose'], iBlock & iOpen> = async (component, e) => {
		const target = <CanUndef<Element>>e.target;

		if (target == null) {
			return;
		}

		const
			{unsafe} = component;

		if (unsafe.dom.getComponent(target, `.${component.componentName}`) == null) {
			await component.close();
		}
	};

	/**
	 * Initializes default event listeners to close a component using the keyboard or mouse
	 *
	 * @param component
	 * @param [events] - a map with events to listen
	 * @param [eventOpts] - an options for the event listener {@link AddEventListenerOptions}
	 */
	static initCloseHelpers<T extends iBlock>(
		component: T & iOpen,
		events: CloseHelperEvents = {},
		eventOpts: AddEventListenerOptions = {}
	): void {
		const {async: $a, localEmitter: $e} = component.unsafe;

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

					options: {
						passive: false,
						...eventOpts
					}
				};

				try {
					$a.on(document, events.key ?? 'keyup', (e?: KeyboardEvent) => {
						if (e != null) {
							return component.onKeyClose(e);
						}

					}, opts);

					$a.on(document, events.touch ?? 'click touchend', (e?: MouseEvent) => {
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
	 * @param _args
	 */
	open(..._args: unknown[]): Promise<boolean> {
		return Object.throw();
	}

	/**
	 * Closes the component
	 * @param _args
	 */
	close(..._args: unknown[]): Promise<boolean> {
		return Object.throw();
	}

	/**
	 * Handler: the opened modifier has been changed
	 * @param _e
	 */
	onOpenedChange(_e: ModEvent | SetModEvent): Promise<void> {
		return Object.throw();
	}

	/**
	 * Handler: closing the component by a keyboard event
	 * @param _e
	 */
	onKeyClose(_e: KeyboardEvent): Promise<void> {
		return Object.throw();
	}

	/**
	 * Handler: closing the component by a touch event
	 * @param _e
	 */
	onTouchClose(_e: MouseEvent): Promise<void> {
		return Object.throw();
	}
}
