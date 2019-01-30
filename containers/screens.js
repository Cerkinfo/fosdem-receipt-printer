// @flow
import React from 'react';
import { Container } from 'unstated';

export const SCREEN_PAIRING = "screen_pairing";
export const SCREEN_RECEIPT = "screen_receipt";

export default class ScreensContainer extends Container {
  state = {
    name: SCREEN_PAIRING,
  };

  pairing() {
    this.setState({ name: SCREEN_PAIRING, });
  }

  receipt() {
    this.setState({ name: SCREEN_RECEIPT, });
  }
}
