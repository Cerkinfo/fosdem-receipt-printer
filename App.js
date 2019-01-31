/**
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, { Component } from 'react';
import { Text, PermissionsAndroid, AsyncStorage, Image, StatusBar } from 'react-native';
import { Container, Content, Body, Left, Title, Header, Button, Drawer, Icon, List, ListItem } from 'native-base';
import BluetoothSerial from 'react-native-bluetooth-serial-next'
import { Provider, Subscribe } from 'unstated';

import { PairingScreen, ReceiptsScreen } from './screens';
import { ScreensContainer } from './containers';

class SideBar extends React.Component {
  render() {
    return (
      <Subscribe to={[ScreensContainer]}>
        {(screens) => (
          <Container>
            <Content>
              <List>
                <ListItem button onPress={() => screens.pairing()}>
                  <Text>Scan page</Text>
                </ListItem>
                <ListItem button onPress={() => screens.receipt()}>
                  <Text>Receipt page</Text>
                </ListItem>
              </List>
            </Content>
          </Container>
        )}
      </Subscribe>
    );
  }
}

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

  closeDrawer() {
    this.drawer._root.close()
  }

  openDrawer() {
    this.drawer._root.open()
  }

  render() {
    return (
      <Subscribe to={[ScreensContainer]}>
        {(screens) => (
          <Drawer
            ref={(ref) => { this.drawer = ref; }}
            content={<SideBar/>}
            onClose={() => this.closeDrawer()}
          >
            <Container>
              <Header>
                <Left>
                  <Button transparent onPress={this.openDrawer.bind(this)}>
                    <Icon name='menu'/>
                  </Button>
                </Left>
                <Body>
                  <Title>Receipt printer</Title>
                </Body>
              </Header>
              <Content>
                {
                  (!this.state.permission) ?
                    <Container>
                      <Text>Enable coarse location</Text>
                    </Container>
                  : screens.state.name === "screen_pairing" ?
                    <PairingScreen />
                  :
                    <ReceiptsScreen />
                }
              </Content>
            </Container>
          </Drawer>
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
