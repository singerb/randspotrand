import { RootState } from './store';
import rsrStore from './rsr';
import { getStoreBuilder } from 'vuex-typex';

import { sample } from 'lodash';
import delay from '../delay';

// state
export interface AlbumState {
	albums: SpotifyApi.AlbumObjectFull[];
	currentlyPlaying: SpotifyApi.AlbumObjectFull | null;
}

// builder
const builder = getStoreBuilder<RootState>() .module<AlbumState>( 'albums', { albums: [], currentlyPlaying: null } );

// mutations plus any wrappers for later actions
function setAlbums( state: AlbumState, newAlbums: SpotifyApi.AlbumObjectFull[] ) {
	state.albums = newAlbums;
}

function setCurrentlyPlaying( state: AlbumState, newPlayback: SpotifyApi.AlbumObjectFull | null ) {
	state.currentlyPlaying = newPlayback;
}

const setAlbumsWrapper = builder.commit( setAlbums );
const setPlayingWrapper = builder.commit( setCurrentlyPlaying );

// actions
async function getAlbums() {
	console.log( 'in store action album get' );

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

	setAlbumsWrapper( newAlbums );
}

async function getCurrentlyPlaying() {
	console.log( 'in store action playing get' );

	try {
		const playing = await rsrStore.state().api.getMyCurrentPlaybackState();

		if ( playing.item ) {
			const album = await rsrStore.state().api.getAlbum( playing.item.album.id );
			setPlayingWrapper( album );
		} else {
			setPlayingWrapper( null );
		}
	} catch ( err ) {
		console.error( err );
		setPlayingWrapper( null );
	}
}

const getCurrentlyPlayingWrapper = builder.dispatch( getCurrentlyPlaying );

async function playRandomAlbum() {
	const album = sample( builder.state()().albums );

	if ( album ) {
		// TODO: why doesn't this pick the right type overide?
		await ( rsrStore.state().api as any ).play( {
			context_uri: album.uri,
		} );

		// janky: wait a bit to give us move chance to actually get the new album
		await delay( 2000 );
		await getCurrentlyPlayingWrapper();
	}
}

// useful functions for consumers
export default {
	get state() { return builder.state(); },

	retrieveAlbums: builder.dispatch( getAlbums ),
	retrieveCurrentlyPlaying: getCurrentlyPlayingWrapper,
	playRandom: builder.dispatch( playRandomAlbum ),

	commitAlbums: setAlbumsWrapper,
	commitCurrentlyPlaying: setPlayingWrapper,
};
