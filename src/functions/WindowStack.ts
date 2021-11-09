import { WindowTypes } from "../pages/index/IndexPage";

const availableZClassnames = [
  "z1",
  "z2",
  "z3",
  "z4",
  "z5",
  "z6",
  "z7",
  "z8",
  "z9",
  "z10",
];
export class WindowStack {
  stack: { stackIndex: number; type: WindowTypes }[];
  constructor() {
    this.stack = [];
  }
  selectWindow(window: WindowTypes) {
    if (this.stack && this.stack[this.stack.length - 1]?.type === window)
      return;
    const oldVal = this.stack.find((i) => i.type === window)?.stackIndex;
    // Först så kolla vilken som har den största zIndex.

    this.stack = this.stack.filter((i) => i.type !== window);

    let biggestIndex = -1;
    let biggestVal = 0;
    for (let i = 0; i < this.stack.length; i++) {
      if (this.stack[i].stackIndex >= biggestVal) {
        biggestIndex = i;
        biggestVal = this.stack[i].stackIndex;
      }
    }
    console.log(oldVal);
    if (oldVal !== undefined) {
      this.stack = this.stack.map((i) =>
        i.stackIndex >= oldVal
          ? { type: i.type, stackIndex: i.stackIndex - 1 }
          : i
      );
    }
    // Nu när vi har det största värdet så ska vi lägga till ett värde.

    this.stack.push({
      stackIndex: oldVal === undefined ? biggestVal + 1 : biggestVal,
      type: window,
    });

    console.log(this.stack);
  }
  getClass(window: WindowTypes) {
    const item = this.stack.find((i) => i.type === window)?.stackIndex;
    console.log(this.stack);
    return item ? "z" + item : "z1";
  }
}
