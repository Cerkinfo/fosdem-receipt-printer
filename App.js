/**
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, PermissionsAndroid, AsyncStorage } from 'react-native';
import { Container, Content, Body, Title, Header, Button, } from 'native-base';
import BluetoothSerial from 'react-native-bluetooth-serial-next'
import { Provider, Subscribe } from 'unstated';

import { PairingScreen, ReceiptsScreen } from './screens';
import { ScreensContainer } from './containers';

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      permission: false,
      connectedDevice: null,
    }

    this.requestCoarseLocationPermission = this.requestCoarseLocationPermission.bind(this);

    this.requestCoarseLocationPermission();
  }

  async componentWillMount() {
    const paired = await AsyncStorage.getItem("pairedDevice");
    if (paired === null) {

    } else {

    }
  }

  async requestCoarseLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: "Asking for permission",
          message: "plop",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.setState({ permission: true, });
      } else {
        this.setState({ permission: false, });
      }
    } catch (err) {
      console.warn(err);
    }
  }

  render() {
    return (
      <Subscribe to={[ScreensContainer]}>
        {(screens) => (
          (!this.state.permission) ?
            <Container>
              <Text>Enable coarse location</Text>
              <Button
                onPress={this.requestCoarseLocationPermission}
                title="Ask for permission"
              />
            </Container>
          : screens.state.name === "screen_pairing" ?
            <PairingScreen />
          :
            <ReceiptsScreen />
        )}
      </Subscribe>
    );
  }
}

export default class App extends Component {
  render() {
    return (
      <Provider>
        <Main/>
      </Provider>
    );
  }
}
