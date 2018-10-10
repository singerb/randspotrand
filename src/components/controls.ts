import Vue from 'vue';
import { sample } from 'lodash';

// components
import Album, { ImageSize } from './album';
import Button from './button';

// store
import albumsStore from '../store/albums';
import rsrStore from '../store/rsr';
import deviceStore from '../store/devices';

export default Vue.extend( {
	created: function() {
		this.getCurrentlyPlaying().catch( ( err ) => {
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
		// TODO: should these be in the store itself? Probably yes, and you just commit a 'refresh' or 'play random' mutation/action
		async getCurrentlyPlaying() {
			console.log( 'in component playing get' );

			try {
				const playing = await rsrStore.state().api.getMyCurrentPlaybackState();

				if ( playing.item ) {
					const album = await rsrStore.state().api.getAlbum( playing.item.album.id );
					albumsStore.commitCurrentlyPlaying( album );
				} else {
					albumsStore.commitCurrentlyPlaying( null );
				}
			} catch ( err ) {
				console.error( err );
				albumsStore.commitCurrentlyPlaying( null );
			}
		},
		async playRandomAlbum() {
			const album = sample( albumsStore.state().albums );

			if ( album ) {
				// TODO: why doesn't this pick the right type overide?
				await ( rsrStore.state().api as any ).play( {
					context_uri: album.uri,
				} );

				await this.getCurrentlyPlaying();
			}
		},
	},
	components: {
		'rsr-album': Album,
		'rsr-button': Button,
	},
	template: `
		<div>
			<rsr-album v-bind:album='currentlyPlaying' v-bind:imageSize='imageSize'></rsr-album>
			<p>Playing on {{ currentDevice }}</p>
			<rsr-button v-on:clicked='playRandomAlbum' color='green'>Play Random Album</rsr-button>
		</div>
	`,
} );
