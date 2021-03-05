"use strict";

const expect = require('expect.js');

const pty = require('node-pty');

const Whiptail = require('../');

console.log(process.argv);


if (process.argv[2] === 'child') {
    /* eslint-disable-next-line */
  return child(process.argv[3]);
}



async function child(mode) {

  if(mode == "menu") {    
    var whiptail = new Whiptail({notags:true});
    var choices = {"1" : "1", "2" : "2", "3" : "3"};
    var results = await whiptail.menu("Default will be 2, please choose 3", choices, 2);
    process.stderr.write(results);
  }

  if(mode == "inputbox") {    
    var whiptail = new Whiptail();
    var response = await whiptail.inputbox("Please type stuffs");
    process.stderr.write(response.toUpperCase());
  }

  if(mode == "checklist") {    
    var whiptail = new Whiptail({notags:true});
    var choices = {"1" : "1", "2" : "2", "3" : "3"};
    var results = await whiptail.checklist("Please choose 1 and 3", choices);
    process.stderr.write(JSON.stringify(results));
  }

  if(mode == "radiolist") {    
    var whiptail = new Whiptail();
    var choices = {"1" : "1", "2" : "2", "3" : "3"};
    var results = await whiptail.radiolist("Please choose 3", choices);
    process.stderr.write(JSON.stringify(results));
  }



  process.exit();
}



describe("Testing basics stuffs", function(){

  this.timeout(10 * 1000);


  it("should test menu", function(done){
    var output = ''

    var args = [];
    args.push(process.execPath, __filename, 'child', 'menu', '1>/dev/null');

    var child = pty.spawn("bash", ["-c", args.join(' ')])

    setTimeout(function(){
      child.on('data', function (c) { output += c })
      child.write('\x1b[B');//down
      child.write('\r\n');
    }, 8000);

    child.on('close', function () {
       expect(output).to.eql("3");
        done();
    })
  })



  it("should test radiolist", function(done){
    var output = ''

    var args = [];
    args.push(process.execPath, __filename, 'child', 'radiolist', '1>/dev/null');


    var child = pty.spawn("bash", ["-c", args.join(' ')])

    setTimeout(function(){
      child.on('data', function (c) { output += c })
      child.write(' '); //select
      child.write('\x1b[B');//down
      child.write('\x1b[B');//down
      child.write(' '); //select
      child.write('\r\n'); //enter
    }, 8000);

    child.on('close', function () {
       expect(output).to.eql('"3"');
        done();
    })
  })



  it("should test checklist", function(done){
    var output = ''

    var args = [];
    args.push(process.execPath, __filename, 'child', 'checklist', '1>/dev/null');

    var child = pty.spawn("bash", ["-c", args.join(' ')])

    setTimeout(function(){
      child.on('data', function (c) { output += c })
      child.write(' '); //select
      child.write('\x1b[B');//down
      child.write('\x1b[B');//down
      child.write(' '); //select
      child.write('\r\n'); //enter
    }, 8000);

    child.on('close', function () {
       expect(output).to.eql('["1","3"]');
        done();
    })
  })



  it("should test inputbox", function(done){
    var output = ''

    var args = [];
    args.push(process.execPath, __filename, 'child', 'inputbox', '1>/dev/null');

    var child = pty.spawn("bash", ["-c", args.join(' ')])

    setTimeout(function(){
      child.on('data', function (c) { output += c })
      child.write('melon');//lowercase
      child.write('\r\n');
    }, 8000);

    child.on('close', function () {
       expect(output).to.eql("MELON"); //uppercase
        done();
    })
  })






});
