<template>
	<button class='rsr_button' v-bind:style='{ "background-color": color }' v-on:click='$emit("clicked")'>
		<slot></slot>
	</button>
</template>

<style lang="scss">
	button.rsr_button {
		text-decoration: underline;
		border: 0;
		color: white;
		font-size: 1.5em;
		padding: 0.25em;
		font-family: monospace;
	}
</style>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend( {
	// TODO: defaults somehow?
	// TODO: typesafe somehow?
	props: [
		'color',
	],
} );
</script>
