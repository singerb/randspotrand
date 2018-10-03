import { RootState } from './store';
import { getStoreBuilder } from 'vuex-typex';

export interface AlbumState {
	albums: SpotifyApi.AlbumObjectFull[];
	currentlyPlaying: SpotifyApi.AlbumObjectFull | null;
}

const builder = getStoreBuilder<RootState>() .module<AlbumState>( 'albums', { albums: [], currentlyPlaying: null } );

function setAlbums( state: AlbumState, newAlbums: SpotifyApi.AlbumObjectFull[] ) {
	state.albums = newAlbums;
}

function setCurrentlyPlaying( state: AlbumState, newPlayback: SpotifyApi.AlbumObjectFull | null ) {
	state.currentlyPlaying = newPlayback;
}

export default {
	get state() { return builder.state(); },

	commitAlbums: builder.commit( setAlbums ),
	commitCurrentlyPlaying: builder.commit( setCurrentlyPlaying ),
};
