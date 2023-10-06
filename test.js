"use strict";

var sleep  = require('nyks/async/sleep');
var Whiptail = require('./');

const Progress = require('progress');
class foo {

  async run() {


    let designs = [];
    designs.push([Progress, "downloading file :file [:bar] (eta :eta)"]);
    designs.push([Whiptail.progress, "downloading file :file:blink  :right (eta :eta)"]);


    for(let design of designs) {
      let [Progress, format] = design;

      let bar = new Progress(format, {title : "Downloading file", total : 100, incomplete : ' ', clear : true, width : 80});

      let i = 0;
      do {
        bar.tick(1, {file :  "输入帮助密"});
        await sleep(50);
      } while(i++ < 100);

      bar.terminate();
      console.log("All done");
    }

  }

}



module.exports = foo;
