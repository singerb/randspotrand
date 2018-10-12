<template>
	<div class='album'>
		<div v-if='album'>
			<img v-bind:src='imageUrl' />
			<br />
			<span class='albumName'>{{ album.name }}</span>
			<br />
			<span class='artistName'>{{ artistList }}</span>
		</div>
		<span v-else>No album</span>
	</div>
</template>

<style lang="scss">

div.album {
	text-align: center;
}

span.albumName {
	font-weight: bold;
}

span.artistName {
	font-style: italic;
}

</style>


<script lang="ts">
import Vue from 'vue';
import { ImageSize } from '../image-size';

const sizeMap = new Map( [
	[ ImageSize.LARGE, 0 ],
	[ ImageSize.MEDIUM, 1 ],
	[ ImageSize.SMALL, 2 ],
] );

export default Vue.extend( {
	// TODO: defaults somehow?
	// TODO: typesafe somehow?
	props: [
		'album',
		'imageSize',
	],
	computed: {
		artistList: function() {
			// TODO: redo this as a class with decorator to get better types?
			return this.album.artists.map( ( artist: SpotifyApi.ArtistObjectFull ) => artist.name ).join( ', ' );
		},
		imageUrl: function() {
			const size: ImageSize = this.imageSize;
			if ( size && sizeMap.has( size ) ) {
				return this.album.images[ sizeMap.get( size )! ].url;
			}

			return this.album.images[ 0 ].url;
		},
	},
} );
</script>
