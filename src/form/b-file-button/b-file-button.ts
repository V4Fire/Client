/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bButton, { component, prop, wait } from 'form/b-button/b-button';
export * from 'form/b-button/b-button';

@component({flyweight: true})
export default class bFileButton<T extends Dictionary = Dictionary> extends bButton<T> {
	/**
	 * Accept string
	 */
	@prop({type: String, required: false})
	readonly accept?: string;

	/** @override */
	protected readonly $refs!: bButton['$refs'] & {
		file: HTMLInputElement;
	};

	/**
	 * Resets a value of the file input
	 */
	@wait('ready')
	reset(): CanPromise<void> {
		this.$refs.file.value = '';
	}

	/**
	 * Handler: file change
	 *
	 * @param e
	 * @emits change(result: InputEvent)
	 */
	protected onChange(e: Event): void {
		this.emit('change', e);
	}

	/** @override */
	protected async onClick(e: Event): Promise<void> {
		this.$refs.file.click();
		this.emit('click', e);
	}
}
