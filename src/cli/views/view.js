import { UIProxy } from '../ui';

export class View extends UIProxy {
  constructor(ui, controller) {
    super(ui);
    this.controller = controller;
  }
}

export default View;
