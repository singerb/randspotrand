export default {
	// TODO: defaults somehow?
	props: [
		'color',
	],
	// TODO: needs to set the background color not the text
	template: `
		<button v-bind:style='{ color: color }' v-on:click='$emit("clicked")'>
			<slot></slot>
		</button>
	`,
};
