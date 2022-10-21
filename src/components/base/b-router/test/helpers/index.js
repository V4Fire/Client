// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{initRouter} = include('src/components/base/b-router/test/helpers/init'),
	{generateWatchCommonSpecs} = include('src/components/base/b-router/test/helpers/watch'),
	{generateSimpleUsageCommonSpecs} = include('src/components/base/b-router/test/helpers/simple'),
	{generateTransitionCommonSpecs} = include('src/components/base/b-router/test/helpers/transition');

module.exports = {
	initRouter,
	generateWatchCommonSpecs,
	generateTransitionCommonSpecs,
	generateSimpleUsageCommonSpecs
};
