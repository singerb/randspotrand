<template>
	<div>
		<rsr-album v-bind:album='currentlyPlaying' v-bind:imageSize='imageSize'></rsr-album>
		<p>Playing on {{ currentDevice }}</p>
		<rsr-button v-on:clicked='playRandomAlbum' color='green'>Play Random Album</rsr-button>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';

// components
import Album from './album.vue';
import Button from './button.vue';
import { ImageSize } from '../image-size';

// store
import albumsStore from '../store/albums';
import deviceStore from '../store/devices';

export default Vue.extend( {
	created: function() {
		this.getCurrentlyPlaying().catch( ( err ) => {
			console.error( err );
		} );
		this.getCurrentDevice().catch( ( err ) => {
			console.error( err );
		} );
	},
	computed: {
		currentlyPlaying() {
			return albumsStore.state().currentlyPlaying;
		},
		currentDevice() {
			return deviceStore.state().currentDevice;
		},
		imageSize() {
			return ImageSize.MEDIUM;
		},
	},
	methods: {
		async getCurrentlyPlaying() {
			await albumsStore.retrieveCurrentlyPlaying();
		},
		async getCurrentDevice() {
			await deviceStore.retrieveCurrentDevice();
		},
		async playRandomAlbum() {
			await albumsStore.playRandom();
		},
	},
	components: {
		'rsr-album': Album,
		'rsr-button': Button,
	},
} );
</script>
