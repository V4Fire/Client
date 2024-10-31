- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/dummies/b-dummy'|b as placeholder

- template index() extends ['b-dummy'].index
	- block body
		< . v-if = isElementVisible
			< button.&__dynamic-event &
				v-if = stage === 'with only safe' |
				v-safe-on:click = onEvent |
				-testid = trigger
			.

			< button.&__dynamic-event &
				v-else-if = stage === 'with prevent and stop modifiers' |
				v-safe-on:click.prevent.stop = onEvent |
				-testid = trigger
			.

			< button.&__dynamic-event &
				v-else-if = stage === 'with dynamic event name' |
				v-safe-on:[dynamicEventName].prevent.stop = onEvent |
				-testid = trigger
			.

