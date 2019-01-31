// @flow
import React from 'react';
import { Container } from 'unstated';

export const SCREEN_PAIRING = {
  name: "screen_pairing",
  title: "Bluetooth device scan",
};

export const SCREEN_RECEIPT = {
  name: "screen_receipt",
  title: "Receipts feed",
};

export default class ScreensContainer extends Container {
  state = {
    ...SCREEN_PAIRING
  };

  pairing() {
    this.setState({ ...SCREEN_PAIRING, });
  }

  receipt() {
    this.setState({ ...SCREEN_RECEIPT, });
  }
}
