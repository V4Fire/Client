// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{initRouter} = include('base/b-router/test/helpers/init'),
	{generateWatchCommonSpecs} = include('base/b-router/test/helpers/watch'),
	{generateSimpleUsageCommonSpecs} = include('base/b-router/test/helpers/simple'),
	{generateTransitionCommonSpecs} = include('base/b-router/test/helpers/transition');

module.exports = {
	initRouter,
	generateWatchCommonSpecs,
	generateTransitionCommonSpecs,
	generateSimpleUsageCommonSpecs
};
