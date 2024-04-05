/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Link, Meta, SSREngine } from 'core/page-meta-data/elements';

describe('using meta elements with SSR', () => {
	describe('an instance of a `Meta` element', () => {
		it('should be rendered to a string', () => {
			const description = 'Cool description';
			const meta = new Meta(new SSREngine(), {name: 'description', content: description});
			expect(meta.render()).toBe(`<meta name="description" content="${description}" />`);
		});

		it("The `update` method call should update the element's attributes", () => {
			const description = 'Cool description';
			const meta = new Meta(new SSREngine(), {name: 'description', content: description});

			const newDescription = 'Very cool description';
			meta.update({content: newDescription});

			const newMeta = new Meta(new SSREngine(), {name: 'description', content: newDescription});
			expect(meta).toEqual(newMeta);
		});
	});

	describe('An instance of a `Link` element', () => {
		it('should be rendered to a string', () => {
			const href = 'https://example.com/';
			const link = new Link(new SSREngine(), {rel: 'canonical', href});
			expect(link.render()).toBe(`<link rel="canonical" href="${href}" />`);
		});
	});
});
