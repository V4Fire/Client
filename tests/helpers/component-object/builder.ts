/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Locator, Page } from 'playwright';
import path from 'upath';
import { resolve } from '@pzlr/build-core';

import type iBlock from 'components/super/i-block/i-block';
import { Component, DOM, Utils } from 'tests/helpers';

export default class ComponentObjectBuilder<COMPONENT extends iBlock> {

	/**
	 * Name of the component that will be created
	 */
	readonly componentName: string;

	/**
	 * Component props
	 */
	readonly props: Dictionary = {};

	/**
	 * Component children
	 */
	readonly children: VNodeChildren = {};

	/**
	 * Component root element locator
	 */
	readonly node: Locator;

	/**
	 * Component path to import via webpack require.
	 * By default plzr.resolve.blockSync will be used
	 */
	readonly componentClassImportPath: Nullable<string>;

	/**
	 * {@link Page}
	 */
	protected page: Page;

	/**
	 * Uniq component node id
	 */
	protected id: string;

	/**
	 * Stores component instance
	 */
	protected componentStore?: JSHandle<COMPONENT>;

	/**
	 * Short hand for generating element selectors
	 * {@link DOM.elNameSelectorGenerator}
	 *
	 * @example
	 * ```typescript
	 * this.elSelector('element') // .${componentName}__element
	 * ```
	 */
	get elSelector(): (elName: string) => string {
		return DOM.elNameSelectorGenerator(this.componentName);
	}

	/**
	 * Component link
	 */
	get component(): JSHandle<COMPONENT> {
		if (!this.componentStore) {
			throw new Error('Bad access to the component without `build` or `pick` call');
		}

		return this.componentStore;
	}

	/**
	 * Returns if the `component` property are available. (`ComponentObject` are builded).
	 */
	get isBuilded(): boolean {
		return Boolean(this.componentStore);
	}

	/**
	 * @param page
	 * @param componentName
	 */
	constructor(page: Page, componentName: string) {
		this.page = page;
		this.componentName = componentName;
		this.id = `${this.componentName}_${Math.random().toString()}`;
		this.props = {'data-testid': this.id};
		this.node = page.getByTestId(this.id);
		this.componentClassImportPath = path.join(path.relative(`${process.cwd()}/src`, resolve.blockSync(this.componentName)!), `/${this.componentName}.ts`);
	}

	/**
	 * Returns a component class
	 */
	async getComponentClass(): Promise<JSHandle<new () => COMPONENT>> {
		const
			{componentClassImportPath} = this;

		if (componentClassImportPath == null) {
			throw new Error('Missing component path');
		}

		const
			classModule = await Utils.import<{default: new () => COMPONENT}>(this.page, componentClassImportPath),
			classInstance = await classModule.evaluateHandle((ctx) => ctx.default);

		return classInstance;
	}

	/**
	 * Creates a `component` instance with the provided
	 * in constructor `componentName` and settled via `setProps` properties
	 */
	async build(): Promise<JSHandle<COMPONENT>> {
		this.componentStore = await Component.createComponent(this.page, this.componentName, {
			attrs: {
				...this.props
			},
			children: this.children
		});

		return this.componentStore;
	}

	/**
	 * Picks the `Node` with the provided selector and extracts 'component' property
	 * that will be settled as `component` property of the `ComponentObject`.
	 *
	 * After this operation `ComponentObject` will be marked as builded and the `ComponentObject.component`
	 * property will be accessible.
	 *
	 * @param selectorOrLocator
	 */
	async pick(selector: string): Promise<this>;

	/**
	 * Extracts 'component' property from the provided locator
	 * that will be settled as `component` property of the `ComponentObject`.
	 *
	 * After this operation `ComponentObject` will be marked as builded and the `ComponentObject.component`
	 * property will be accessible.
	 *
	 * @param locator
	 */
	async pick(locator: Locator): Promise<this>;

	/**
	 * @inheritdoc
	 */
	async pick(selectorOrLocator: string | Locator): Promise<this> {
		const
			locator = Object.isString(selectorOrLocator) ? this.page.locator(selectorOrLocator) : selectorOrLocator;

		this.componentStore = await locator.elementHandle().then(async (el) => {
			await el?.evaluate((ctx, [id]) => ctx.setAttribute('data-test-id', id), [this.id]);
			return el?.getProperty('component');
		});

		await this.applyProps();

		return this;
	}

	/**
	 * Saves the provided props to store.
	 * After component will be created or picked the stored props will be settled
	 *
	 * @param props
	 */
	setProps(props: Dictionary): this {
		Object.assign(this.props, props);
		return this;
	}

	/**
	 * Saves the provided child to store.
	 * After component will be created the stored children will be settled
	 *
	 * @param children
	 */
	setChildren(children: VNodeChildren): this {
		Object.assign(this.children, children);
		return this;
	}

	/**
	 * Applies the settled via `setProps` props to the component instance
	 */
	async applyProps(): Promise<this> {
		const
			{component, props} = this;

		await component.evaluate((ctx, [props]) => Object.assign(ctx, props), [props]);
		return this;
	}
}
