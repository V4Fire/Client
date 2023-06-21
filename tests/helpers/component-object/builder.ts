/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import path from 'upath';
import type { JSHandle, Locator, Page } from 'playwright';
import { resolve } from '@pzlr/build-core';

import { Component, DOM, Utils } from 'tests/helpers';

import type iBlock from 'components/super/i-block/i-block';

/**
 * A class implementing the `ComponentObject` approach that encapsulates different
 * interactions with a component from the client.
 *
 * This class provides a basic API for creating or selecting any component and interacting with it during tests.
 *
 * However, the recommended usage is to inherit from this class and implement a specific `ComponentObject`
 * that encapsulates and enhances the client's interaction with component during the test.
 */
export default class ComponentObjectBuilder<COMPONENT extends iBlock> {
	/**
	 * The name of the component to be rendered.
	 */
	readonly componentName: string;

	/**
	 * The props of the component.
	 */
	readonly props: Dictionary = {};

	/**
	 * The children of the component.
	 */
	readonly children: VNodeChildren = {};

	/**
	 * The locator for the root node of the component.
	 */
	readonly node: Locator;

	/**
	 * The path to the class used to build the component.
	 * By default, it generates the path using `plzr.resolve.blockSync(componentName)`.
	 *
	 * This field is used for setting up various mocks and spies.
	 * Setting the path is optional if you're not using the `spy` API.
	 */
	readonly componentClassImportPath: Nullable<string>;

	/**
	 * The page on which the component is located.
	 */
	readonly page: Page;

	/**
	 * The unique ID of the component generated when the constructor is called.
	 */
	protected id: string;

	/**
	 * Stores a reference to the component's `JSHandle`.
	 */
	protected componentStore?: JSHandle<COMPONENT>;

	/**
	 * A shorthand for generating selectors for component elements.
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
	 * Public access to the reference of the component's `JSHandle`.
	 * @throws {@link Error} if trying to access a component that has not been built or picked
	 */
	get component(): JSHandle<COMPONENT> {
		if (!this.componentStore) {
			throw new Error('Bad access to the component without `build` or `pick` call');
		}

		return this.componentStore;
	}

	/**
	 * Returns `true` if the component is built or picked.
	 */
	get isBuilded(): boolean {
		return Boolean(this.componentStore);
	}

	/**
	 * @param page - The page on which the component is located
	 * @param componentName - The name of the component to be rendered
	 */
	constructor(page: Page, componentName: string) {
		this.page = page;
		this.componentName = componentName;
		this.id = `${this.componentName}_${Math.random().toString()}`;
		this.props = {'data-testid': this.id};
		this.node = page.getByTestId(this.id);
		this.componentClassImportPath = path.join(
			path.relative(`${process.cwd()}/src`, resolve.blockSync(this.componentName)!),
			`/${this.componentName}.ts`
		);
	}

	/**
	 * Returns the base class of the component.
	 */
	async getComponentClass(): Promise<JSHandle<new () => COMPONENT>> {
		const {componentClassImportPath} = this;

		if (componentClassImportPath == null) {
			throw new Error('Missing component path');
		}

		const
			classModule = await Utils.import<{default: new () => COMPONENT}>(this.page, componentClassImportPath),
			classInstance = await classModule.evaluateHandle((ctx) => ctx.default);

		return classInstance;
	}

	/**
	 * Renders the component with the previously set props and children
	 * using the `setProps` and `setChildren` methods.
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
	 * Picks the `Node` with the provided selector and extracts the `component` property,
	 * which will be assigned to the `component` property of the `ComponentObject`.
	 *
	 * After this operation, the `ComponentObject` will be marked as built and the `ComponentObject.component` property
	 * will be accessible.
	 *
	 * @param selector - The selector or locator for the component node
	 */
	async pick(selector: string): Promise<this>;

	/**
	 * Extracts the `component` property from the provided locator,
	 * which will be assigned to the `component` property of the `ComponentObject`.
	 *
	 * After this operation, the `ComponentObject` will be marked as built and the `ComponentObject.component` property
	 * will be accessible.
	 *
	 * @param locator - The locator for the component node
	 */
	async pick(locator: Locator): Promise<this>;

	async pick(selectorOrLocator: string | Locator): Promise<this> {
		const locator = Object.isString(selectorOrLocator) ?
			this.page.locator(selectorOrLocator) :
			selectorOrLocator;

		this.componentStore = await locator.elementHandle().then(async (el) => {
			await el?.evaluate((ctx, [id]) => ctx.setAttribute('data-test-id', id), [this.id]);
			return el?.getProperty('component');
		});

		await this.applyProps(this.props);

		return this;
	}

	/**
	 * Stores the provided props.
	 * The stored props will be assigned when the component is created or picked.
	 *
	 * @param props - The props to set
	 */
	async setProps(props: Dictionary): Promise<this> {
		if (!this.isBuilded) {
			Object.assign(this.props, props);

		} else {
			await this.applyProps(props);
		}

		return this;
	}

	/**
	 * Stores the provided children.
	 * The stored children will be assigned when the component is created.
	 *
	 * @param children - The children to set
	 */
	setChildren(children: VNodeChildren): this {
		Object.assign(this.children, children);
		return this;
	}

	/**
	 * Applies the stored props to the component instance.
	 * @param props
	 */
	async applyProps(props: Dictionary): Promise<this> {
		const
			{component} = this;

		if (!this.isBuilded) {
			return this.setProps(props);
		}

		await component.evaluate((ctx, [props]) => Object.assign(ctx, props), [props]);
		return this;
	}
}
