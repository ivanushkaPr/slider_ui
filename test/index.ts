function sayHi(str: string):void {
  console.log(str);
}


sayHi('hello ts node')
module.exports = {
  hi: sayHi,
};
