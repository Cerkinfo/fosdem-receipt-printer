import React, { Component } from 'react';
import { Container, Header, Title, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right } from 'native-base';
import BluetoothSerial from 'react-native-bluetooth-serial-next'
import { Subscribe } from 'unstated';
import { DeviceContainer } from '../containers';

class Transaction extends Component {
  constructor(props) {
    super(props);

    this.print = this.print.bind(this);
  }

  async print(device) {
    await BluetoothSerial.device(device.id).write("PLOP\n");
  }

  render() {
    return (
      <Card>
        <CardItem>
          <Left>
            <Body>
              <Text>Receipt from {this.props.datetime}</Text>
              <Text note>made by {this.props.author}</Text>
            </Body>
          </Left>
        </CardItem>
        <CardItem cardBody>
          {this.props.products.map(x => (<Text>{x.quantity} {x.name} for {x.total_price}€</Text>))}
        </CardItem>
        <CardItem>
          <Left>
            <Button
              onPress={() => this.print(this.props.device)}
              transparent
            >
              <Icon active name="thumbs-up" />
              <Text>Print</Text>
            </Button>
          </Left>
        </CardItem>
      </Card>
    );
  }
}

export default class Receipts extends Component {
  constructor(props) {
    super(props);
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
              <Transaction device={device.state.current} author="plop" datetime="yoyo" products={[{"name": "Jupiler", "price": 3, "quantity": 2, "total_price": 6},]}/>
            </Content>
          </Container>
	)}
      </Subscribe>
    )
  }
}
