
/**
 * Returns a component props
 * @param {*} page 
 */
module.exports.getComponentProps = async function (page) {
	const
		componentSelector = '.b-virtual-scroll',
		component = await (await page.$(componentSelector)).getProperty('component');

	return {componentSelector, component};
}

/**
 * Scrolls page down and waits for items to be rendered
 *
 * @param {*} page
 * @param {number} count
 * @param {string} componentSelector
 */
module.exports.scrollAndWaitItemsCountGreaterThan = async function (page, count, componentSelector) {
	await module.exports.scrollToPageBottom(page);
	await module.exports.waitItemsCountGreaterThan(page, count, componentSelector);
}

/**
 * Scrolls page down and waits for items to be rendered
 *
 * @param {*} page
 * @param {number} count
 * @param {string} componentSelector
 */
module.exports.waitItemsCountGreaterThan = async function (page, count, componentSelector, op = '>') {
	await page.waitForFunction(`document.querySelector('${componentSelector}__container').childElementCount ${op} ${count}`);
}

/**
 * Scrolls page down
 * @param {*} page
 */
module.exports.scrollToPageBottom = async function (page) {
	await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
}

/**
 * Returns the specified field from object
 *
 * @param {*} object
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
