/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { BROKEN_PICTURE_SRC, EXISTING_PICTURE_SRC } from 'components/directives/image/test/const';
import { createDivForTest, getImageTestData } from 'components/directives/image/test/helpers';

test.describe('components/directives/image', () => {

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('a successfully loaded image set in .src should be shown', async ({page}) => {
		const divLocator = await createDivForTest(page, {src: EXISTING_PICTURE_SRC});
		const {span, img} = await getImageTestData(divLocator);
		test.expect(span.dataImage).toBe('preview');
		test.expect(span.style).toBeNull();
		test.expect(img.dataImg).toBe('loaded');
		test.expect(img.style).toBeNull();
		test.expect(img.src).toBe(EXISTING_PICTURE_SRC);
	});

	test('an image set in .broken should be shown instead of broken one', async ({page}) => {
		const divLocator = await createDivForTest(page, {src: BROKEN_PICTURE_SRC, broken: EXISTING_PICTURE_SRC});
		const {span, img} = await getImageTestData(divLocator);
		test.expect(span.dataImage).toBe('broken');
		test.expect(span.style).toBe(`background-image: url("${EXISTING_PICTURE_SRC}");`);
		test.expect(img.dataImg).toBe('failed');
		test.expect(img.style).toBe('opacity: 0;');
	});

});
