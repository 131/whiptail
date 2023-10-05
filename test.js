"use strict";

var sleep  =require('nyks/async/sleep');
var Whiptail = require('./');

class foo {

  async run() {

    var whip = new Whiptail();
    var progress = whip.progress("Downloading files", 100);

    let i = 0;
    do {
      progress.tick(1, "downloading file 输入帮助密 stuff:blink  :right (eta :eta)");
      await sleep(50);
    } while(i++<100);

    progress.end();
    console.log("All done");

  }

}



module.exports = foo;
