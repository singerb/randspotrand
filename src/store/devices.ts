import { RootState } from './store';
import { getStoreBuilder } from 'vuex-typex';

export interface DeviceState {
	devices: string[]; // TODO: real type
	currentDevice: string | null;
}

function setCurrentDevice( state: DeviceState, newDevice: string | null ) {
	state.currentDevice = newDevice;
}

const builder = getStoreBuilder<RootState>() .module<DeviceState>( 'devices', { devices: [], currentDevice: null } );

export default {
	get state() { return builder.state(); },

	commitCurrentDevice: builder.commit( setCurrentDevice ),
};
