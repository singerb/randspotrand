<template>
	<div>
		<rsr-button v-on:clicked='getAlbums' color='grey'>Refresh Album List</rsr-button>
		<ul>
			<li v-for='album in albums' :key='album.uri'>
				<rsr-album v-bind:album='album' v-bind:imageSize='imageSize'></rsr-album>
			</li>
		</ul>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';

// components
import Album from './album.vue';
import Button from './button.vue';
import { ImageSize } from '../image-size';

// store
import albumStore from '../store/albums';

export default Vue.extend( {
	created: function() {
		this.getAlbums().catch( ( err ) => {
			console.error( err );
		} );
	},
	computed: {
		albums() {
			return albumStore.state().albums;
		},
		imageSize() {
			return ImageSize.SMALL;
		},
	},
	methods: {
		async getAlbums() {
			await albumStore.retrieveAlbums();
		},
	},
	components: {
		'rsr-album': Album,
		'rsr-button': Button,
	},
} );
</script>
