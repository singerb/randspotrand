import SpotifyWebApi from 'spotify-web-api-js';
import * as $ from 'jquery';
import Vue from 'vue';
import { sample } from 'lodash';

interface VueData {
	state: string;
	albums: Array<{ uri: string, name: string, artists: string[] }>;
	devices: string[]; // TODO: real type
	currentDevice: string | null;
	currentlyPlaying: { uri: string, name: string, artists: string[] } | null;
}

class RSR {
	protected spotify = new SpotifyWebApi();
	// TODO: move this to a config file
	protected readonly clientId = '2301b293ab694a37851af06e2ab262cb';

	protected app: Vue;
	protected data: VueData = {
		state: 'initial',
		albums: [],
		devices: [],
		currentDevice: null,
		currentlyPlaying: null,
	};

	constructor() {
		this.app = new Vue( {
			el: '#app',
			data: this.data,
			computed: {
				currentlyPlayingText: () => {
					if ( this.data.currentlyPlaying ) {
						return this.data.currentlyPlaying.name + ' - ' + this.data.currentlyPlaying.artists.join( ', ' );
					}

					return 'Unknown';
				},
			},
			methods: {
				login: () => {
					this.loginWithSpotify();
				},
				playRandom: () => {
					this.playRandomAlbum().then( () => undefined ).catch( ( err ) => { console.error( err ); } );
				},
				refreshAlbums: () => {
					this.getAlbums().then( () => undefined ).catch( ( err ) => { console.error( err ); } );
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
			this.data.state = 'logged-out';

			return;
		}

		console.log( 'access token retrieved and set to ' + token );
		this.spotify.setAccessToken( token );

		// try and retrieve the user's albums; if that fails, maybe we need to re-auth?
		await this.getAlbums();
		await this.getCurrentlyPlaying();

		// retrieve the users's playback info
		const playback = await this.spotify.getMyCurrentPlaybackState();
		this.data.currentDevice = playback.device.type + ' ' + playback.device.name;

		// populate the UI with this data including event handlers
		this.data.state = 'main';
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

	private getArtistsFromAlbum( album: SpotifyApi.AlbumObjectFull ) {
		return album.artists.map( ( artist ) => artist.name );
	}

	private async getAlbums() {
		let offset = 0;
		const limit = 20;

		this.data.albums = [];

		while ( true ) {
			const albums = await this.spotify.getMySavedAlbums( { offset: offset, limit: limit } );

			for ( const album of albums.items ) {
				this.data.albums.push( {
					uri: album.album.uri,
					name: album.album.name,
					artists: this.getArtistsFromAlbum( album.album ),
				} );
			}

			if ( albums.next ) {
				offset += limit;
			} else {
				break;
			}
		}
	}

	private async playRandomAlbum() {
		const album = sample( this.data.albums );

		if ( album ) {
			// TODO: why doesn't this pick the right type overide?
			await ( this.spotify as any ).play( {
				context_uri: album.uri,
			} );

			await this.getCurrentlyPlaying();
		}
	}

	private async getCurrentlyPlaying() {
		try {
			const playing = await this.spotify.getMyCurrentPlaybackState();

			if ( playing.item ) {
				const album = await this.spotify.getAlbum( playing.item.album.id );
				this.data.currentlyPlaying = { uri: album.uri, name: album.name, artists: this.getArtistsFromAlbum( album ) };
			} else {
				this.data.currentlyPlaying = null;
			}
		} catch ( err ) {
			console.error( err );
			this.data.currentlyPlaying = null;
		}
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
