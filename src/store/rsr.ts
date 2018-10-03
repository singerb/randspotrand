import SpotifyWebApi from 'spotify-web-api-js';
import { RootState } from './store';
import { getStoreBuilder } from 'vuex-typex';

// TODO: typing this is hard for some reason due to the library design
const api = new SpotifyWebApi();

export interface RSRState {
	state: string;
	api: typeof api;
}

function changeState( state: RSRState, newState: string ) {
	state.state = newState;
}

function setAccessToken( state: RSRState, token: string ) {
	state.api.setAccessToken( token );
}

const builder = getStoreBuilder<RootState>() .module<RSRState>( 'rsr', { state: 'initial', api: new SpotifyWebApi() } );

export default {
	get state() { return builder.state(); },

	commitChangeState: builder.commit( changeState ),
	commitAccessToken: builder.commit( setAccessToken ),
};
