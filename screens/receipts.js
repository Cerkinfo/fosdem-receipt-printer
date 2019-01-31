import React, { Component } from 'react';
import { Container, Header, Title, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right } from 'native-base';
import BluetoothSerial from 'react-native-bluetooth-serial-next'
import { Subscribe } from 'unstated';
import { DeviceContainer } from '../containers';
import moment from 'moment';
// import EscPosEncoder from 'esc-pos-encoder';
// import { TextDecoder } from 'text-encoding';
// import { Buffer } from "buffer";

// const encoder = new EscPosEncoder();

const TEST = [{
   "transaction_data":{
      "transaction_code":"TYVC9CM79T",
      "amount":"6.0",
      "vat_amount":"0.0",
      "tip_amount":"0.0",
      "currency":"EUR",
      "timestamp":"2019-01-27T17:15:48.212Z",
      "status":"SUCCESSFUL",
      "payment_type":"CASH",
      "entry_mode":"none",
      "verification_method":"none",
      "installments_count":1,
      "products":[
         {
            "name":"Leffe Blonde",
            "description":"",
            "price":"3.0",
            "vat_rate":"0.0",
            "single_vat_amount":"0.0",
            "price_with_vat":"3.0",
            "vat_amount":"0.0",
            "quantity":1,
            "total_price":"3.0",
            "total_with_vat":"3.0"
         },
         {
            "name":"Ginette Fruitee",
            "description":"",
            "price":"3.0",
            "vat_rate":"0.0",
            "single_vat_amount":"0.0",
            "price_with_vat":"3.0",
            "vat_amount":"0.0",
            "quantity":1,
            "total_price":"3.0",
            "total_with_vat":"3.0"
         }
      ],
      "vat_rates":[
         {
            "rate":0.0,
            "net":6.0,
            "vat":0.0,
            "gross":6.0
         }
      ],
      "location":{
         "lat":50.8977515,
         "lon":4.3932198,
         "horizontal_accuracy":"14.15"
      },
      "events":[

      ],
      "receipt_no":"S20190000125"
   },
   "merchant_data":{
   },
   "emv_data":{ }
}];

// const template = ({timestamp, products, amount}) => {
//   let result = encoder
//     .initialize()
//     .codepage('windows1252')
//     .line("Cercle Informatique de l'ULB")
//     .line("Boulevard du Triomphe, CP 206")
//     .line("1050 Bruxelles")
//     .line("Belgium")
//     .line(moment(timestamp).format("hh:mm DD/MM/YYYY"))
//     .newline();
//
//   result = products.reduce((acc, { name, quantity, total_price, }) => acc.line(`${Number(quantity).toString()}x ${name}${"".padStart(32 - (4 + name.length + Number.parseFloat(total_price).toFixed(2).length), ' ')}${Number.parseFloat(total_price).toFixed(2)}€`, 31), result);
//
//   result
//     .line("--------------------------------")
//     .align('right')
//     .line(`${amount}€`)
//     .align('left')
//     .newline();
//
//   // return new TextDecoder("windows-1252").decode(result.encode());
//   return Buffer.from(result.encode(), 'base64');
// }

const template = ({timestamp, products, amount}) => {
  const MAX_LENGTH = 32;

  const structured_products = products.map(({ name, quantity, total_price, }) => ({
    quantity: Number(quantity).toString(),
    name,
    total_price: Number.parseFloat(total_price).toFixed(2),
  }));

  return (`

Cercle Informatique de l'ULB
Boulevard du Triomphe, CP 206
1050 Bruxelles
Belgium
${moment(timestamp).format("hh:mm DD/MM/YYYY")}

${structured_products.reduce((acc, { name, quantity, total_price, }) => (acc + `${quantity}x ${name}${"".padStart(MAX_LENGTH - (5 + name.length + total_price.length), ' ')}${total_price}e\n`), "")}

-------------------------------
TOTAL: ${amount}e


  `);
}

class Transaction extends Component {
  constructor(props) {
    super(props);

    this.print = this.print.bind(this);
  }

  async print(device) {
    await BluetoothSerial.device(device.id).write(template(this.props));
  }

  render() {
    return (
      <Container>
        <Card>
          <CardItem>
            <Left>
              <Body>
                <Text>Receipt from {moment(this.props.timestamp).format("hh:mm DD/MM/YYYY")}</Text>
                <Text note>for a total {this.props.amount}€</Text>
              </Body>
            </Left>
          </CardItem>
          {this.props.products.map(x => (
            <CardItem key={x.name}>
              <Left>
                <Icon active name="beer"/>
                <Text>{x.quantity}x{x.name}</Text>
              </Left>
              <Right>
                <Text>{x.total_price}€</Text>
              </Right>
            </CardItem>
          ))}
          <CardItem>
            <Left>
              <Button
                onPress={() => this.print(this.props.device)}
                transparent
              >
                <Icon active name="ios-copy"/>
                <Text>Print</Text>
              </Button>
            </Left>
          </CardItem>
        </Card>
      </Container>
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
          <Content>
            {TEST.map(x => (<Transaction key={x.transaction_data.transaction_code} device={device.state.current} {...x.transaction_data}/>)) }
          </Content>
	      )}
      </Subscribe>
    )
  }
}
