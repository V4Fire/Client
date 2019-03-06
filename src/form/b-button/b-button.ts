/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import 'core/data';

//#if runtime has bForm
import bForm from 'form/b-form/b-form';
//#endif

import iTheme from 'traits/i-theme/i-theme';
import iAccess from 'traits/i-access/i-access';
import iVisible from 'traits/i-visible/i-visible';
import iWidth from 'traits/i-width/i-width';
import iSize, { SizeDictionary } from 'traits/i-size/i-size';
import iOpenToggle, { CloseHelperEvents } from 'traits/i-open-toggle/i-open-toggle';
import iIcon from 'traits/i-icon/i-icon';
import iHint from 'traits/i-hint/i-hint';

import iData, {

	component,
	prop,
	hook,
	p,

	ModsDecl,
	ModelMethods,
	RequestFilter,
	ModEvent,
	SetModEvent

} from 'super/i-data/i-data';

export { SizeDictionary, CloseHelperEvents };
export * from 'super/i-data/i-data';

export type ButtonType<T extends string = any> =
	'submit' |
	'button' |
	'image' |
	'link' |
	T;

@component({
	functional: {
		dataProvider: undefined,
		href: undefined
	}
})

export default class bButton<T extends Dictionary = Dictionary> extends iData<T>
	implements iTheme, iAccess, iOpenToggle, iIcon, iHint, iVisible, iWidth, iSize {

	/** @override */
	readonly dataProvider: string = 'Provider';

	/** @override */
	readonly requestFilter: RequestFilter = false;

	/**
	 * Link href
	 */
	@prop({type: String, required: false})
	readonly href?: string;

	/**
	 * Data provider method
	 */
	@prop(String)
	readonly method: ModelMethods = 'get';

	/**
	 * Button type
	 */
	@prop(String)
	readonly type: ButtonType = 'button';

	/**
	 * Connected form id
	 */
	@prop({type: String, required: false})
	readonly form?: string;

	/**
	 * Input autofocus mode
	 */
	@prop({type: Boolean, required: false})
	readonly autofocus?: boolean;

	/**
	 * Icon before text
	 */
	@prop({type: String, required: false})
	readonly preIcon?: string;

	/**
	 * Component for .preIcon
	 */
	@prop(String)
	readonly preIconComponent?: string;

	/**
	 * Icon after text
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/**
	 * Component for .icon
	 */
	@prop(String)
	readonly iconComponent?: string;

	/**
	 * Tooltip text
	 */
	@prop({type: String, required: false})
	readonly hint?: string;

	/**
	 * Tooltip position
	 */
	@prop({type: String, required: false})
	readonly hintPos?: string;

	/**
	 * Dropdown position
	 */
	@prop(String)
	readonly dropdown: string = 'bottom';

	/** @see iSize.lt */
	@p({replace: false})
	get lt(): SizeDictionary {
		return iSize.lt;
	}

	/** @see iSize.gt */
	@p({replace: false})
	get gt(): SizeDictionary {
		return iSize.gt;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		rounding: [
			'none',
			['small'],
			'normal',
			'big'
		],

		upper: [
			'true',
			['false']
		],

		...iTheme.mods,
		...iAccess.mods,
		...iOpenToggle.mods,
		...iVisible.mods,
		...iWidth.mods,
		...iSize.mods
	};

	/** @override */
	protected readonly $refs!: {button: HTMLButtonElement};

	/** @see iAccess.focus */
	focus(): Promise<boolean> {
		return iAccess.focus(this);
	}

	/** @see iAccess.blur */
	blur(): Promise<boolean> {
		return iAccess.blur(this);
	}

	/** @see iAccess.enable */
	enable(): Promise<boolean> {
		return iAccess.enable(this);
	}

	/** @see iAccess.disable */
	disable(): Promise<boolean> {
		return iAccess.disable(this);
	}

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

	/** @see iHint.setHint */
	setHint(pos: string): ReadonlyArray<string> {
		return iHint.setHint(this, pos);
	}

	/** @see iIcon.getIconLink */
	getIconLink(iconId: string): string {
		return iIcon.getIconLink(iconId);
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
	onTouchClose(e: MouseEvent): Promise<void> {
		return iOpenToggle.onTouchClose(this, e);
	}

	/** @see iOpenToggle.initCloseHelpers */
	@hook('beforeDataCreate')
	@p({replace: false})
	protected initCloseHelpers(events?: CloseHelperEvents): void {
		iOpenToggle.initCloseHelpers(this, events);
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iAccess.initModEvents(this);
		iOpenToggle.initModEvents(this);
		iVisible.initModEvents(this);
	}

	/**
	 * Handler: button trigger
	 *
	 * @param e
	 * @emits click(e: Event)
	 */
	protected async onClick(e: Event): Promise<void> {
		if (this.type !== 'link') {
			if (this.dataProvider !== 'Provider' || this.href) {
				if (this.href) {
					this.base(this.href);
				}

				await (<Function>this[this.method])();

			// Form attribute fix for MS Edge && IE
			} else if (this.form && this.type === 'submit') {
				e.preventDefault();
				const form = <bForm>this.dom.getComponent(`#${this.form}`);
				form && await form.submit();
			}

			await this.toggle();
		}

		this.emit('click', e);
	}
}
