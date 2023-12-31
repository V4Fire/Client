/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'components/super/i-block/i-block';
import ComponentObjectMock from 'tests/helpers/component-object/mock';

export default class ComponentObject<COMPONENT extends iBlock = iBlock> extends ComponentObjectMock<COMPONENT> {
	/**
	 * Returns the current value of the component's modifier. To extract the value,
	 * the .mods property of the component is used.
	 *
	 * @param modName - the name of the modifier.
	 * @returns A Promise that resolves to the value of the modifier or undefined.
	 */
	getModVal(modName: string): Promise<CanUndef<string>> {
		return this.component.evaluate((ctx, [modName]) => ctx.mods[modName], [modName]);
	}

	/**
	 * Waits for the specified value to be set for the specified modifier
	 *
	 * @param modName - the name of the modifier
	 * @param modVal - the value to wait for
	 * @returns A Promise that resolves when the specified value is set for the modifier
	 */
	waitForModVal(modName: string, modVal: string): Promise<void> {
		return this.pwPage
			.waitForFunction(
				([ctx, modName, modVal]) => ctx.mods[modName] === modVal,
				<const>[this.component, modName, modVal]
			)
			.then(() => undefined);
	}

	/**
	 * Activates the component (a shorthand for {@link iBlock.activate})
	 */
	activate(): Promise<void> {
		return this.component.evaluate((ctx) => ctx.activate());
	}

	/**
	 * Deactivates the component (a shorthand for {@link iBlock.deactivate})
	 */
	deactivate(): Promise<void> {
		return this.component.evaluate((ctx) => ctx.deactivate());
	}
}
