/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iTheme from 'traits/i-theme/i-theme';
import iAccess from 'traits/i-access/i-access';
import iVisible from 'traits/i-visible/i-visible';
import iSize, { SizeDictionary } from 'traits/i-size/i-size';
import iIcon from 'traits/i-icon/i-icon';
import iHint from 'traits/i-hint/i-hint';

import iData, { component, prop, ModsDecl } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bLink<T extends Dictionary = Dictionary> extends iData<T>
	implements iTheme, iAccess, iIcon, iHint, iVisible, iSize {

	/**
	 * Link href
	 */
	@prop(String)
	readonly href: string = '#';

	/**
	 * Icon before text
	 */
	@prop({type: String, required: false})
	preIcon?: string;

	/**
	 * Component for .preIcon
	 */
	@prop(String)
	preIconComponent?: string;

	/**
	 * Icon after text
	 */
	@prop({type: String, required: false})
	icon?: string;

	/**
	 * Component for .icon
	 */
	@prop(String)
	iconComponent?: string;

	/**
	 * Tooltip text
	 */
	@prop({type: String, required: false})
	hint?: string;

	/**
	 * Tooltip position
	 */
	@prop({type: String, required: false})
	hintPos?: string;

	/** @see iSize.lt */
	get lt(): SizeDictionary {
		return iSize.lt;
	}

	/** @see iSize.gt */
	get gt(): SizeDictionary {
		return iSize.gt;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		underline: [
			['true'],
			'false'
		],

		...iTheme.mods,
		...iAccess.mods,
		...iVisible.mods,
		...iSize.mods
	};

	/** @override */
	protected readonly $refs!: {link: HTMLAnchorElement};

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

	/** @see iHint.getHintClass */
	getHintClass(pos: string): ReadonlyArray<string> {
		return iHint.getHintClass(this, pos);
	}

	/** @see iIcon.getIconLink */
	getIconLink(iconId: string): string {
		return iIcon.getIconLink(iconId);
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iAccess.initModEvents(this);
		iVisible.initModEvents(this);
	}

	/**
	 * Handler: link trigger
	 *
	 * @param e
	 * @emits click(e: Event)
	 */
	protected onClick(e: Event): void {
		const
			{link} = this.$refs;

		if (e.target !== link && link.href) {
			link.click();

		} else {
			this.emit('click', e);
		}
	}
}
