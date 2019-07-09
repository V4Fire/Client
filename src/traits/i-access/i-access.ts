/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { ModsDecl, ModEvent } from 'super/i-block/i-block';

export default abstract class iAccess {
	/**
	 * Disables the component
	 * @param component
	 */
	static async disable<T extends iBlock>(component: T): Promise<boolean> {
		return component.setMod('disabled', true);
	}

	/**
	 * Enables the component
	 * @param component
	 */
	static async enable<T extends iBlock>(component: T): Promise<boolean> {
		return component.setMod('disabled', false);
	}

	/**
	 * Sets focus for the component
	 * @param component
	 */
	static async focus<T extends iBlock>(component: T): Promise<boolean> {
		return component.setMod('focused', true);
	}

	/**
	 * Unsets focus for the component
	 * @param component
	 */
	static async blur<T extends iBlock>(component: T): Promise<boolean> {
		return component.setMod('focused', false);
	}

	/**
	 * Initializes modifiers event listeners
	 *
	 * @emits enable()
	 * @emits disable()
	 *
	 * @emits focus()
	 * @emits blur()
	 *
	 * @param component
	 */
	static initModEvents<T extends iBlock>(component: T): void {
		const
			// @ts-ignore
			{localEvent: $e, async: $a} = component;

		$e.on('block.mod.*.disabled.*', (e: ModEvent) => {
			if (e.value === 'false' || e.type === 'remove') {
				$a.off({group: 'blockOnDisable'});
				component.emit('enable');

			} else {
				component.emit('disable');

				const handler = (e) => {
					e.preventDefault();
					e.stopImmediatePropagation();
				};

				$a.on(component.$el, 'click mousedown touchstart keydown input change scroll', handler, {
					group: 'blockOnDisable',
					options: {
						capture: true
					}
				});
			}
		});

		$e.on('block.mod.*.focused.*', (e: ModEvent) => {
			component.emit(e.value === 'false' || e.type === 'remove' ? 'blur' : 'focus');
		});
	}

	/**
	 * Accessibility modifiers
	 */
	static readonly mods: ModsDecl = {
		disabled: [
			'true',
			'false'
		],

		focused: [
			'true',
			'false'
		]
	};

	/**
	 * Disables the component
	 * @param args
	 */
	abstract async disable(...args: unknown[]): Promise<boolean>;

	/**
	 * Enables the component
	 * @param args
	 */
	abstract async enable(...args: unknown[]): Promise<boolean>;

	/**
	 * Sets focus for the component
	 * @param args
	 */
	abstract async focus(...args: unknown[]): Promise<boolean> ;

	/**
	 * Unsets focus for the component
	 * @param args
	 */
	abstract async blur(...args: unknown[]): Promise<boolean>;
}
