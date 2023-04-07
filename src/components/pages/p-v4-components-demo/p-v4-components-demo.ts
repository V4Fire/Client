/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/pages/p-v4-components-demo/README.md]]
 * @packageDocumentation
 */

import { faker } from '@faker-js/faker';
import type { DummyUser } from 'components/dummies/b-dummy-user/interface';
import iStaticPage, { component, system, field } from 'components/super/i-static-page/i-static-page';

export * from 'components/super/i-static-page/i-static-page';

console.time('Initializing');

/**
 * Page with component demos.
 * Basically it uses with component tests.
 */
@component({root: true})
export default class pV4ComponentsDemo extends iStaticPage {
	/**
	 * Parameter to test
	 */
	@system()
	rootParam?: number;

	@system()
	dummyData: DummyUser = createFakeData(1)[0];

	/**
	 * Field for tests purposes
	 */
	@field()
	someField: unknown = 'foo';

	protected beforeCreate(): void {
		console.time('Render');
	}
}

function createFakeData(count: number): any[] {
	const create: () => DummyUser = () => ({
		userId: faker.datatype.uuid(),
		username: faker.internet.userName(),
		email: faker.internet.email(),
		avatar: faker.image.avatar(),
		password: faker.internet.password(),
		birthdate: faker.date.birthdate(),
		registeredAt: faker.date.past()
	});

	return Array.from(new Array(count), create);
}
