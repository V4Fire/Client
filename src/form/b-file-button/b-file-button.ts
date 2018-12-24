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

export type ReadType =
	'readAsArrayBuffer' |
	'readAsBinaryString' |
	'readAsBlob' |
	'readAsDataURL' |
	'readAsText';

export const
	$$ = symbolGenerator();

@component()
export default class bFileButton<T extends Dictionary = Dictionary> extends bButton<T> {
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
	read: ReadType = 'readAsDataURL';

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
	 * @emits change(result: InputEvent.target.result)
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

		this.async.on(reader, 'load', (e) => this.emit('change', e.target.result));
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
