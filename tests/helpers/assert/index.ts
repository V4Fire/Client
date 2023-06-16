/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import AssertBase from 'tests/helpers/assert/base';
import AssertComponent from 'tests/helpers/assert/component';

export * from 'tests/helpers/assert/interface';

export default abstract class Assert extends AssertBase {
	static override setPage(page: Page): typeof Assert {
		super.setPage(page);
		this.component.setPage(page);
		return this;
	}

	static override unsetPage(): void {
		super.unsetPage();
		this.component.unsetPage();
	}

	static get component(): typeof AssertComponent {
		return AssertComponent;
	}
}

