import * as $ from 'jquery';
import Vue from 'vue';
import Vuex, { Store, mapState } from 'vuex';

// components
import Button from './components/button';
import AlbumList from './components/album-list';
import Controls from './components/controls';
import Loading from './components/loading';

// store
import store, { RootState } from './store/store';
import rsrStore, { RSRState } from './store/rsr';
import devicesStore from './store/devices';

class RSR {
	// TODO: move this to a config file
	protected readonly clientId = '2301b293ab694a37851af06e2ab262cb';

	protected app: Vue;
	protected store: Store<RootState>;

	constructor() {
		Vue.use( Vuex );

		this.store = store;

		this.app = new Vue( {
			el: '#app',
			store: this.store,
			components: {
				'rsr-button':     Button,
				'rsr-album-list': AlbumList,
				'rsr-controls':   Controls,
				'rsr-loading':    Loading,
			},
			computed: {
				...mapState( 'rsr', {
					state: ( state: RSRState ) => state.state,
				} ),
			},
			methods: {
				login: () => {
					this.loginWithSpotify();
				},
			},
		} );
	}

	public async run() {
		// handle redirects from spotify
		if ( this.handleSpotifyRedirect() ) {
			// we had a spotify redirect, nothing more to do here
			console.log( 'spotify redirect handled' );

			return;
		}

		// see if we still have a token
		const token = this.accessToken();

		if ( !token ) {
			// show login button
			console.log( 'no token, showing login button' );
			rsrStore.commitChangeState( 'logged-out' );

			return;
		}

		console.log( 'access token retrieved and set to ' + token );
		rsrStore.commitAccessToken( token );

		// retrieve the users's playback info
		// TODO: moves into controls component
		const playback = await rsrStore.state().api.getMyCurrentPlaybackState();
		devicesStore.commitCurrentDevice( playback.device.type + ' ' + playback.device.name );

		// populate the UI with this data including event handlers
		rsrStore.commitChangeState( 'main' );
	}

	private loginWithSpotify() {
		const params = new URLSearchParams( {
			client_id:     this.clientId,
			response_type: 'token',
			redirect_uri:  window.location.href,
			scope:         'user-library-read user-read-playback-state user-modify-playback-state',
			show_dialog:   'false',
		} );
		window.location.assign( 'https://accounts.spotify.com/authorize?' + params.toString() );
	}

	private handleSpotifyRedirect() {
		// check URL params to see if this is a redirect back from the login
		const url = new URL( window.location.href );

		// check for success
		if ( '' !== url.hash ) {
			console.log( 'checking hash string' );
			// this is actually a query string in the hash component, parse it as one
			const params = new URLSearchParams( '?' + url.hash.substring( 1 ) );

			const token = params.get( 'access_token' );
			const expires = params.get( 'expires_in' );
			if ( token && params.has( 'token_type' ) && expires ) {
				// this is a success response
				// store everything in local storage and redirect to a clean URL
				window.localStorage.setItem( 'rsrToken', token );
				window.localStorage.setItem(
					'rsrTokenExpires',
					new Date( Date.now() + ( 1000 * parseInt( expires, 10 ) ) ).getTime() + '',
				);

				// clear off the hash and redirect to the same page
				window.location.assign( url.protocol + '//' + url.host + url.pathname );

				return true;
			}
		}

		// check for failure
		if ( '' !== url.search ) {
			console.log( 'checking query string' );
			const params = url.searchParams;

			if ( params.has( 'error' ) ) {
				console.error( params.get( 'error' ) );

				// clear off the query and redirect to the same page
				window.location.assign( url.protocol + '//' + url.host + url.pathname );

				return true;
			}
		}

		// didn't handle anything
		return false;
	}

	private accessToken() {
		// TODO: move these storage names to constants
		const token = window.localStorage.getItem( 'rsrToken' );
		const expires = window.localStorage.getItem( 'rsrTokenExpires' );

		if ( null === token || expires === token ) {
			console.log( 'no token in storage' );
			window.localStorage.removeItem( 'rsrToken' );
			window.localStorage.removeItem( 'rsrTokenExpires' );

			return false;
		}

		const expiresMs = parseInt( expires!, 10 );
		console.log( expiresMs );
		console.log( Date.now() );

		if ( expiresMs === 0 || expiresMs <= Date.now() ) {
			console.log( 'had token but expired' );
			window.localStorage.removeItem( 'rsrToken' );
			window.localStorage.removeItem( 'rsrTokenExpires' );

			return false;
		}

		return token;
	}
}

$.ready.then( () => {
	const app = new RSR();

	app.run().then( () => {
		console.log( 'done!' );
	} ).catch( ( err ) => {
		console.error( err );
	} );
} );
