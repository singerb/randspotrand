import Vue from 'vue';

export default Vue.extend( {
	// TODO: defaults somehow?
	// TODO: typesafe somehow?
	props: [
		'album',
	],
	computed: {
		artistList: function() {
			// TODO: redo this as a class with decorator to get better types?
			return this.album.artists.map( ( artist: SpotifyApi.ArtistObjectFull ) => artist.name ).join( ', ' );
		},
	},
	template: `
		<span>
			<span v-if='album'>{{ album.name }} - {{ artistList }}</span>
			<span v-else>No album</span>
		</span>
	`,
} );
