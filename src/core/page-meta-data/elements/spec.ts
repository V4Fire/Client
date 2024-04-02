/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Link, Meta, SSREngine } from 'core/page-meta-data/elements';

describe('SSR page meta data', () => {
	it('render as string', () => {
		const
			href = 'https://edadeal.ru/',
			description = 'Cool description';

		const meta = new Meta(new SSREngine(), {name: 'description', content: description});
		const link = new Link(new SSREngine(), {rel: 'canonical', href});

		expect(meta.render()).toEqual(`<meta name="description" content="${description}" />`);
		expect(link.render()).toEqual(`<link rel="canonical" href="${href}" />`);
	});

	it('updates the element attributes', () => {
		const description = 'Cool description';
		const meta = new Meta(new SSREngine(), {name: 'description', content: description});

		const newDescription = 'Very cool description';
		meta.update({content: newDescription});

		const newMeta = new Meta(new SSREngine(), {name: 'description', content: newDescription});

		expect(meta).toEqual(newMeta);
	});
});
