/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:form/b-button/README.md]]
 * @packageDocumentation
 */

import { derive } from 'core/functools/trait';

//#if runtime has core/data
import 'core/data';
//#endif

import type bForm from 'form/b-form/b-form';

import iAccess from 'traits/i-access/i-access';
import iVisible from 'traits/i-visible/i-visible';
import iWidth from 'traits/i-width/i-width';
import iSize from 'traits/i-size/i-size';

import iOpenToggle, { CloseHelperEvents } from 'traits/i-open-toggle/i-open-toggle';
import type { HintPosition } from 'global/g-hint/interface';

import iData, {

	component,
	prop,
	p,

	ModsDecl,
	ModelMethod,
	RequestFilter

} from 'super/i-data/i-data';

import type { ButtonType } from 'form/b-button/interface';

export * from 'super/i-data/i-data';
export * from 'traits/i-open-toggle/i-open-toggle';
export * from 'form/b-button/interface';

interface bButton extends Trait<typeof iAccess>, Trait<typeof iOpenToggle> {}

/**
 * Component to create a button
 */
@component({
	flyweight: true,
	functional: {
		dataProvider: undefined,
		href: undefined
	}
})

@derive(iAccess, iOpenToggle)
class bButton extends iData implements iAccess, iOpenToggle, iVisible, iWidth, iSize {
	/** @override */
	readonly dataProvider: string = 'Provider';

	/** @override */
	readonly defaultRequestFilter: RequestFilter = true;

	/**
	 * Link href
	 */
	@prop({type: String, required: false})
	readonly href?: string;

	/**
	 * Data provider method
	 */
	@prop(String)
	readonly method: ModelMethod = 'get';

	/**
	 * Button type
	 */
	@prop(String)
	readonly type: ButtonType = 'button';

	/**
	 * Connected form identifier
	 */
	@prop({type: String, required: false})
	readonly form?: string;

	/** @see [[iAccess.autofocus]] */
	@prop({type: Boolean, required: false})
	readonly autofocus?: boolean;

	/** @see [[iAccess.tabIndex]] */
	@prop({type: Number, required: false})
	readonly tabIndex?: number;

	/**
	 * Icon to show before a button text
	 */
	@prop({type: String, required: false})
	readonly preIcon?: string;

	/**
	 * Name of the used component to show `preIcon`
	 * @default `'b-icon'`
	 */
	@prop({type: String, required: false})
	readonly preIconComponent?: string;

	/**
	 * Icon to show after a button text
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/**
	 * Name of the used component to show `icon`
	 * @default `'b-icon'`
	 */
	@prop({type: String, required: false})
	readonly iconComponent?: string;

	/**
	 * Component to show "in-progress" state or
	 * Boolean, if need to show progress by slot or `b-progress-icon`
	 */
	@prop({type: [String, Boolean], required: false})
	readonly progressIcon?: string | boolean;

	/**
	 * Tooltip text
	 */
	@prop({type: String, required: false})
	readonly hint?: string;

	/**
	 * Tooltip position
	 */
	@prop({type: String, required: false})
	readonly hintPos?: HintPosition;

	/**
	 * Dropdown position
	 */
	@prop(String)
	readonly dropdown: string = 'bottom';

	/** @see [[iAccess.isFocused]] */
	get isFocused(): boolean {
		const
			{button} = this.$refs;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (button != null) {
			return document.activeElement === button;
		}

		return iAccess.isFocused(this);
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iAccess.mods,
		...iVisible.mods,
		...iWidth.mods,
		...iSize.mods,

		opened: [
			...iOpenToggle.mods.opened ?? [],
			['false']
		],

		upper: [
			'true',
			'false'
		]
	};

	/** @override */
	protected readonly $refs!: {button: HTMLButtonElement};

	/** @see [[iOpenToggle.initCloseHelpers]] */
	@p({hook: 'beforeDataCreate', replace: false})
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
	 * @emits `click(e: Event)`
	 */
	protected async onClick(e: Event): Promise<void> {
		if (this.type !== 'link') {
			const
				dp = this.dataProvider;

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (dp != null && (dp !== 'Provider' || this.href != null)) {
				let
					that = this;

				if (this.href != null) {
					that = this.base(this.href);
				}

				await (<Function>that[this.method])();

			// Form attribute fix for MS Edge && IE
			} else if (this.form != null && this.type === 'submit') {
				e.preventDefault();
				const form = this.dom.getComponent<bForm>(`#${this.form}`);
				form && await form.submit();
			}

			await this.toggle();
		}

		this.emit('click', e);
	}
}

export default bButton;
