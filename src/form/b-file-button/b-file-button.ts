/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import bButton, { component, prop, wait } from 'form/b-button/b-button';

export * from 'form/b-button/b-button';
export class bUploaderError extends Error {}

export interface Test {
	(file: File): boolean;
}

export const
	$$ = symbolGenerator();

@component()
export default class bFileButton extends bButton {
	/**
	 * Test function
	 */
	@prop({type: Function, required: false})
	readonly test?: Test;

	/**
	 * Accept string
	 */
	@prop({type: String, required: false})
	readonly accept?: string;

	/**
	 * Read type
	 */
	@prop(String)
	read: string = 'readAsDataURL';

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
	 * @emits set(result: InputEvent.target.result)
	 * @emits error(err: bUploaderError)
	 */
	protected onFileSelected(e: Event): void {
		const
			file = (<any>e.target).files[0],
			reader = new FileReader();

		if (this.test && !this.test(file)) {
			this.emit('error', new bUploaderError('TEST_FAIL'));
			return;
		}

		reader.addEventListener('load', <any>this.async.proxy((e) => this.emit('set', e.target.result)));
		reader[this.read](file);
	}

	/** @override */
	protected async mounted(): Promise<void> {
		await super.mounted();

		const {
			file,
			button
		} = this.$refs;

		this.async.on(button, 'click', () => file.click(), {
			label: $$.activation
		});
	}
}
