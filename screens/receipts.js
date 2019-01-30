import React, { Component } from 'react';
import { Container, Text, Content, Body, Title, Header, Button, } from 'native-base';
import BluetoothSerial from 'react-native-bluetooth-serial-next'
import { Subscribe } from 'unstated';
import { DeviceContainer } from '../containers';

export default class Receipts extends Component {
  constructor(props) {
    super(props);

    this.print = this.print.bind(this);
  }

  async print(device) {
    await BluetoothSerial.device(device.id).write("PLOP\n");
  }

  render() {
    return (
      <Subscribe to={[DeviceContainer]}>
        {(device) => (
          <Container>
            <Header>
              <Body>
                <Title>Receipts</Title>
              </Body>
            </Header>
            <Content>
              <Button
                onPress={() => this.print(device.state.current)}
              >
                 <Text>Test print</Text>
              </Button>
            </Content>
          </Container>
	)}
      </Subscribe>
    )
  }
}
