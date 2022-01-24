/**
 * Environment setup options
 */
export interface SetupOptions {
	/**
	 * Parameters of mocks to be set using `setEnv`
	 * @default `"['.*']"`
	 */
	mocks?: string;

	/**
	 * Set of `permissions`
	 * @default ['geolocation']
	 */
	permissions?: Playwright.Permissions;

	/**
	 * Current geolocation
	 * @default `{latitude: 59.95, longitude: 30.31667}`
	 */
	location?: Playwright.Geolocation;

	/**
	 * Delay before starting a test
	 * @default `2000`
	 */
	sleepAfter?: number;

	/**
	 * If `true` the page will reload after setting up the environment
	 * @default `true`
	 */
	reload?: boolean;

	/**
	 * If settled, the test will not start until the element is attached to the page.
	 * @default `undefined`
	 */
	waitForEl?: string;
}
