import React, { Component } from 'react';
import { Container, Title, Body, Header, Content, Spinner, Button, Text, List, ListItem, } from 'native-base';
import BluetoothSerial from 'react-native-bluetooth-serial-next';
import { Subscribe } from 'unstated';

import { ScreensContainer, DeviceContainer } from '../containers';

const DISCOVERING = 1;
const SUCCESS = 2;
const FAILED = 3;
const PENDING = 4;

export default class Pairing extends Component {
  constructor(props) {
    super(props);


    this.state = {
      status: PENDING,
      devices: [],
    };

    this.discover = this.discover.bind(this);
    this.pair = this.pair.bind(this);
  }

  componentDidMount() {
    this.discover();
  }

  async discover() {
    if (this.state.status !== DISCOVERING) {
      this.setState({
        status: DISCOVERING,
      });

      try {
        const devices = await BluetoothSerial.discoverUnpairedDevices()
        this.setState({
          devices,
          status: SUCCESS,
        });
      } catch (err) {
        console.warn(err);
        this.setState({
          status: FAILED,
        });
      }
    }
  }

  async pair(device, container, screens) {
    try {
      const paired = await BluetoothSerial.device(device.id).connect();
      container.set(paired);
      screens.receipt();
    } catch (err) {
      return console.warn(container.state.current);
    }
  }

  render() {
    return (
      <Subscribe to={[ScreensContainer, DeviceContainer]}>
        {(screens, device) => (
          <Container>
            <Header>
              <Body>
                <Title>Connect to printer</Title>
              </Body>
            </Header>
            <Content>
              {
                (this.state.status === DISCOVERING) || (this.state.status === PENDING) ?
                  <Spinner />
                : this.state.status === FAILED ?
                  <Content>
                    <Text>The bluetooth discover failed.</Text>
                    <Button primary onPress={() => this.discover()}>
                      <Text>
                        Retry
                      </Text>
                    </Button>
                  </Content>
                :
                  <List>
                    {this.state.devices.map(x => (
                      <ListItem thumbnail key={x.id} onPress={() => this.pair(x, device, screens)}>
                        <Body>
                          <Text>{x.name}</Text>
                          <Text note numberOfLines={1}>{x.id}</Text>
                        </Body>
                      </ListItem>
                    ))}
                  </List>
              }
            </Content>
          </Container>
        )}
      </Subscribe>
    );
  }
}
