/**
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, PermissionsAndroid } from 'react-native';
import { Container, Content, Body, Title, Header, Button, List, ListItem } from 'native-base';
import BluetoothSerial from 'react-native-bluetooth-serial-next'

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEnabled: true,
      devices: [],
      connectedDevice: null,
      services: [],

      discovering: false,
    }

    this.requestCoarseLocationPermission = this.requestCoarseLocationPermission.bind(this);
    this.pair = this.pair.bind(this);
    this.plop = this.plop.bind(this);
    this.requestCoarseLocationPermission();
  }

  async discover() {
    if (this.state.discovering) {
      return false
    } else {
      try {
        this.setState({ discovering: true })
        const devices = await BluetoothSerial.discoverUnpairedDevices()
        this.setState({ devices, discovering: false })
      } catch (err) {
        console.warn(err.message);
        this.setState({ discovering: false })
      }
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
        this.setState({permission: true});
        this.discover();
      } else {
        this.setState({permission: false});
      }
    } catch (err) {
      console.warn(err);
    }
  }

  async pair(device) {
    const paired = await BluetoothSerial.device(device.id).connect();
    this.setState({
      connectedDevice: {
        ...device,
        ...paired,
      }
    });
  }

  async plop() {
    await BluetoothSerial.device(this.state.connectedDevice.id).write("PLOP\n");
  }

  render() {
    if (!this.state.isEnabled) {
      return (
        <Container>
          <Text>Enable coarse location</Text>
          <Button
            onPress={this.requestCoarseLocationPermission}
            title="Ask for permission"
          />
        </Container>
      );
    } else if (!this.state.connectedDevice) {
      return (
        <Container>
          <Header>
            <Body>
              <Title>Connect to printer</Title>
            </Body>
          </Header>
          <Content>
            <List>
              {this.state.devices.map(x => (
                <ListItem thumbnail key={x.id} onPress={() => this.pair(x)}>
                  <Body>
                    <Text>{x.name}</Text>
                    <Text note numberOfLines={1}>{x.id}</Text>
                  </Body>
                </ListItem>
              ))}
            </List>
          </Content>
        </Container>
      );
    }

    return (
      <Container>
        <Header>
          <Body>
            <Title>Receipts</Title>
          </Body>
        </Header>
        <Content>
          <Button
            onPress={() => this.plop()}
          >
            <Text>TEST</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}
