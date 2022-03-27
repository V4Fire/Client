import { expect } from '@playwright/test';

expect.extend({
	async toBeResolved(received: Promise<unknown>) {
		if (!Object.isPromise(received)) {
			return {
				message: () => `Expected promise to be provided, got ${typeof received}`,
				pass: false
			};
		}

		try {
			await received;

			return {
				message: () => 'passed',
				pass: true
			};

		} catch (err) {
			return {
				message: () => `Expected promise to be resolved but it was rejected \n ${err}`,
				pass: false
			};
		}
	},

	async toBeResolvedTo(received: Promise<unknown>, expected: unknown) {
		if (!Object.isPromise(received)) {
			return {
				message: () => `Expected promise to be provided, got ${typeof received}`,
				pass: false
			};
		}

		try {
			const
				val = await received;

			if (Object.fastCompare(val, expected)) {
				return {
					message: () => 'passed',
					pass: true
				};
			}

			return {
				message: () => 'Provided value is not equal to expected',
				pass: false
			};

		} catch (err) {
			return {
				message: () => `Expected promise to be resolved but it was rejected \n ${err}`,
				pass: false
			};
		}
	},

	async toReRejected(received: Promise<unknown>) {
		if (!Object.isPromise(received)) {
			return {
				message: () => `Expected promise to be provided, got ${typeof received}`,
				pass: false
			};
		}

		try {
			await received;

			return {
				message: () => 'Expected promise to be rejected but it was resolved',
				pass: false
			};

		} catch {
			return {
				message: () => 'passed',
				pass: true
			};
		}
	},

	async toBeRejectedWith(received: Promise<unknown>, expected: unknown) {
		if (!Object.isPromise(received)) {
			return {
				message: () => `Expected promise to be provided, got ${typeof received}`,
				pass: false
			};
		}

		return received
			.then(() => ({
				message: () => 'Expected promise to be rejected but it was resolved',
				pass: false
			}))

			.catch((val) => {
				if (Object.fastCompare(val, expected)) {
					return {
						message: () => 'passed',
						pass: true
					};

				}

				return {
					message: () => 'Provided value is not equal to expected',
					pass: false
				};
			});
	},

	async toBePending(received: Promise<unknown>) {
		if (!Object.isPromise(received)) {
			return {
				message: () => `Expected promise to be provided, got ${typeof received}`,
				pass: false
			};
		}

		let
			isPending = true;

		return Promise.race([
			received.then(() => isPending = false),
			Promise.resolve().then(() => Promise.resolve()).then(() => isPending = true)
		])
			.then(() => {
				if (isPending) {
					return {
						message: () => 'passed',
						pass: true
					};

				}

				return {
					message: () => 'Expected promise to be in the pending state but it was fulfilled',
					pass: false
				};
			})
			.catch(() => ({
				message: () => 'Expected promise to be in the pending state but it was rejected',
				pass: false
			}));
	}
});
