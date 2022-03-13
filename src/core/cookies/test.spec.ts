import { test } from '@playwright/test';
import { get } from 'core/cookies';

test('get cookie', () => {
	get('test');
});
