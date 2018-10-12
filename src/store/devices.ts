import { RootState } from './store';
import { getStoreBuilder } from 'vuex-typex';
import rsrStore from './rsr';

// state
export interface DeviceState {
	devices: string[]; // TODO: real type
	currentDevice: string | null;
}

// builder
const builder = getStoreBuilder<RootState>() .module<DeviceState>( 'devices', { devices: [], currentDevice: null } );

// mutations plus wrappers
function setCurrentDevice( state: DeviceState, newDevice: string | null ) {
	state.currentDevice = newDevice;
}

const setCurrentDeviceWrapper = builder.commit( setCurrentDevice );

// actions
async function getCurrentDevice() {
	console.log( 'in store get device' );
	const playback = await rsrStore.state().api.getMyCurrentPlaybackState();
	if ( playback && playback.device ) {
		setCurrentDeviceWrapper( playback.device.type + ' ' + playback.device.name );
	} else {
		setCurrentDeviceWrapper( 'Unknown' );
	}
}

// for consumers
export default {
	get state() { return builder.state(); },

	retrieveCurrentDevice: builder.dispatch( getCurrentDevice ),
	commitCurrentDevice: setCurrentDeviceWrapper,
};
