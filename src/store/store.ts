import Vue from 'vue';
import Vuex from 'vuex';

import { getStoreBuilder } from 'vuex-typex';

// import for side-effects so that code doesn't get dropped
import './albums';
import './devices';
import './rsr';

import { AlbumState } from './albums';
import { DeviceState } from './devices';
import { RSRState } from './rsr';

export interface RootState {
	albums: AlbumState;
	devices: DeviceState;
	rsr: RSRState;
}

Vue.use( Vuex );

const builder = getStoreBuilder<RootState>();
export default builder.vuexStore();
