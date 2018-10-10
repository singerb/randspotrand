import Vue from 'vue';

// components
import Album, { ImageSize } from './album';
import Button from './button';

// store
import albumStore from '../store/albums';
import rsrStore from '../store/rsr';

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
		// TODO: should this be in the store itself? Probably yes, and you just commit a 'refresh' mutation
		async getAlbums() {
			console.log( 'in component album get' );

			let offset = 0;
			const limit = 20;

			const newAlbums: SpotifyApi.AlbumObjectFull[] = [];

			while ( true ) {
				const albums = await rsrStore.state().api.getMySavedAlbums( { offset: offset, limit: limit } );

				for ( const album of albums.items ) {
					newAlbums.push( album.album );
				}

				if ( albums.next ) {
					offset += limit;
				} else {
					break;
				}
			}

			albumStore.commitAlbums( newAlbums );
		},
	},
	components: {
		'rsr-album': Album,
		'rsr-button': Button,
	},
	template: `
		<div>
			<rsr-button v-on:clicked='getAlbums' color='grey'>Refresh Album List</rsr-button>
			<ul>
				<li v-for='album in albums' :key='album.uri'>
					<rsr-album v-bind:album='album' v-bind:imageSize='imageSize'></rsr-album>
				</li>
			</ul>
		</div>
	`,
} );
