import { generateGUID } from "../util/GUID.js";
export class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.hp = 50;
    // this.setHp();
  }
  // setHp() {
  //   this.hpMax = this.hp;
  // }
}
