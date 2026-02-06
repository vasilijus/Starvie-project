import { Enemy } from "./Enemy.js";

export const EN_TYPES = 2;

export class Wolf extends Enemy{
  constructor(x, y) {
    super(x, y);
    this.hp = this.hpMax = 55;
    this.color = '#444444'
    this.xpWorth = 2;
  }
}

export class Bear extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.hp = this.hpMax = 75;
    this.color = '#4a1500'
    this.xpWorth = 2;
  }
}