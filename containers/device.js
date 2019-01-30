// @flow
import React from 'react';
// import { AsyncStorage } from 'react-native';
import { Container } from 'unstated';

export default class DeviceContainer extends Container {
  state = {
    current: null
  };

  set(device) {
    this.setState({ current: device, });
  }

  // async set(device) {
  //   await AsyncStorage.setItem("pairedDevice", device);
  //   this.setState({ current: device, });
  // }

  // async unset() {
  //   await AsyncStorage.setItem("pairedDevice", device);
  //   this.setState({ current: null, });
  // }
}
