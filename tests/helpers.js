/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Returns the specified field from the object
 *
 * @param {object} object
 * @param {string} path
 */
module.exports.getField = async function (object, path) {
	if (!object) {
		return undefined;
	}

	const
		chunks = path.split('.');

	let
		res = object;

	for (let i = 0; i < chunks.length; i++) {
		if (res == null) {
			return undefined;
		}

		res = await res.getProperty(chunks[i]);
	}

	return (await res.jsonValue());
}

/**
 * Returns a component props
 *
 * @param {*} page 
 * @param {string} componentSelector
 */
module.exports.getComponentProps = async function (page, componentSelector) {
	const
		component = await (await page.$(componentSelector)).getProperty('component');

	return {componentSelector, component};
}

/**
 * Scrolls page to the bottom
 * @param {*} page
 */
module.exports.scrollToPageBottom = async function (page) {
	await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
}
