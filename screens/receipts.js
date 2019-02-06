import React, { Component } from 'react';
import { RefreshControl, ScrollView, } from "react-native";
import { Spinner, Container, Header, Title, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right } from 'native-base';
import BluetoothSerial from 'react-native-bluetooth-serial-next'
import { Subscribe } from 'unstated';
import { DeviceContainer } from '../containers';
import moment from 'moment';
// import EscPosEncoder from 'esc-pos-encoder';
// import { TextDecoder } from 'text-encoding';

// const encoder = new EscPosEncoder();
import { authorize } from 'react-native-app-auth';
import { creds } from "../creds";
import axios from "axios";

const app_authorize = () => axios.get("https://api.sumup.com/authorize", {
  params: {
    response_type: "code",
    client_id: creds["client_id"],
    client_secret: creds["client_secret"],
    redirect_uri: creds["redirect_uris"][0],
    scopes: ["transactions.history", "user.profile", "user.profile_readonly", "user.subaccounts"],
  }
});

const authenticate = (res) => {
  const set_cookie = res.headers["set-cookie"]
  const x_xsrf_token = set_cookie[0].split("; ")[0].split("=")[1];
  const did = set_cookie[2].split("; ")[0];
  const cookie = "XSRF-TOKEN=" + x_xsrf_token + "; " + did;

  return axios.post("https://gateway.sumup.com/oauth", {
      username: creds["username"],
      password: creds["password"],
    },{
      headers: {
        "x-x_xsrf_token": x_xsrf_token,
        "Cookie": cookie,
      }
  });
};

const client_authorize = (res) => axios.post("https://gateway.sumup.com/authorizations", {}, {
  headers: res.config.headers,
});

const resolve_token = res => res.data.redirect_to.split("code=")[1];

const token = res => axios.post("https://api.sumup.com/token", {
    grant_type: "authorization_code",
    client_id: creds["client_id"],
    client_secret: creds["client_secret"],
    code: res.data.redirect_to.split("code=")[1],
});

const createSumUpClient = async () => {
  const res = await app_authorize()
    .then(authenticate)
    .then(client_authorize)
    .then(token)

  return axios.create({
    headers: {
      "Authorization": `Bearer ${res.data.access_token}`
    },
  });
}

const getTransations = access_token => axios.get("https://api.sumup.com/v0.1/me/transactions/history?limit=500", {
  headers: {
    "Authorization": `Bearer ${access_token}`
  }
});
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

    this.state = {
       detail: null,
    };

    this.print = this.print.bind(this);
  }

  async print(device) {
    await BluetoothSerial.device(device.id).write(template(this.props));
  }

  async getDetail() {
    const res = await this.props.session.get(`https://api.sumup.com/v1.0/receipts/${this.props.transaction_code}?mid=MECZ73KP`);
  }

  render() {
    return (
      <Container>
        <Card onClick={this.getDetail}>
          <CardItem>
            <Left>
              <Body>
                <Text>Transaction made by {this.props.user} @{moment(this.props.timestamp).format("hh:mm (DD/MM/YYYY)")}</Text>
                <Text note>{this.props.amount}€</Text>
                <Text note>{this.props.id}€</Text>
              </Body>
            </Left>
          </CardItem>
          {this.state.detail && this.state.detail.products.map(x => (
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

    this.state = {
      refreshing: false,
      transactions: []
    }

    this.session = null
  }

  async componentDidMount() {
    this.sesssion = await createSumUpClient();
    const response = await this.session.get("https://api.sumup.com/v0.1/me/transactions/history?limit=500");
    this.setState({
      transactions: response.data.items
    });
  }

  _onRefresh() {
    this.setState({ refreshing: true });
    this.setState({ refreshing: false });
  }

  render() {
    if (this.state.transactions.length) {
      return (
        <Subscribe to={[DeviceContainer]}>
          {(device) => (
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._onRefresh}
                />
              }
            >
              <Container>
                {transactions.map(x => (<Transaction key={x.id} device={device.state.current} {...x}/>)) }
              </Container>
            </ScrollView>
  	      )}
        </Subscribe>
      )
    } else {
      return (<Spinner/>)
    }
  }
}
