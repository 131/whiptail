'use strict';

const cp = require('child_process');

const sprintf = require('nyks/string/format');
const defer   = require('nyks/promise/defer');
const drain   = require('nyks/stream/drain');
const humanDiff = require('nyks/date/humanDiff');
const repeat = require('nyks/string/repeat');

const splitArgs  = require('nyks/process/splitArgs');
const formatArgs = require('nyks/process/formatArgs');


const bin = "whiptail";

class whiptail {


  constructor(options) {
    this.options = formatArgs(options, true);
    this.sync    = false;


    //notags is not working as it should
    //https://bugzilla.redhat.com/show_bug.cgi?id=1215239
    var rekey = function(choices) {
      var out = {map : {}, rmap : {}};
      var i = 0;
      for(var k in choices) {
        out.map[sprintf('%d)', ++i)] = choices[k];
        out.rmap[sprintf('%d)', i)]  = k;
      }
      return out;
    };

    if(options && options.notags) {
      var checklist = this.checklist;
      this.checklist = async (title, choices) => {
        var tmp = rekey(choices);
        var results = await checklist.call(this, title, tmp.map);
        if(Array.isArray(results)) {
          for(var k in results)
            results[k] = tmp.rmap[results[k]];
        } else {
          results = tmp.rmap[results];
        }
        return results;
      };
    }

  }

  async inputbox(title, init) {
    var args = ['--inputbox', title];
    args.push(0, 0, init || '');

    try {
      return await this._run(args);
    } catch(err) {
      return null;
    }
  }

  async msgbox(text) {
    var args = ['--msgbox', text];
    args.push(0, 0);

    try {
      return await this._run(args);
    } catch(err) {
      return null;
    }
  }

  async  menu(title, choices, def) {
    var args = ['--menu', title];
    if(typeof def == "string" || typeof def == "number")
      args.push("--default-item", def);
    else if(def)
      args.push(...def);

    args.push(0, 0, 0);
    for(var k in choices)
      args.push(k, choices[k]);

    try {
      return await this._run(args);
    } catch(err) {
      return null;
    }
  }

  async  radiolist(title, choices) {
    var args = ['--radiolist', title];
    args.push(0, 0, 0);
    for(var k in choices)
      args.push(k, choices[k].value || choices[k], !!choices[k].active | 0);

    try {
      return await this._run(args);
    } catch(err) {
      return null;
    }
  }

  async  yesno(title) {
    var args = ['--yesno', title];
    args.push(0, 0);

    try {
      return await this._run(args);
    } catch(err) {
      return null;
    }
  }

  progress(title, max, init = "Please wait") {
    let i = 0, ended = false;
    let start;
    let ctrlc = function(chunk) {
      if(chunk[0] == 3 || chunk[0] == 4 || chunk[0] == 26)
        end();
    };

    process.stdin.on("data", ctrlc);

    let args = ["--title", title, "--gauge", init, 6, 60, 0];

    var child = cp.spawn(bin, args, {
      stdio : ['pipe', 'inherit', 'inherit'],
    });

    let blink = i =>  "." + ("...".substr(0, i % 3)) + ("  ".substr(0, 2 - i % 3));
    let lastline;
    let tick = function(step, title = "downloading:blink :right (eta :eta)") {
      if(ended)
        return;
      if(!start)
        start = new Date;

      let elapsed = new Date - start;
      let eta = (i == max) ? 0 : elapsed * (max / i - 1);
      title = title
        .replace(':eta', humanDiff(eta / 1000))
        .replace(':blink', blink(Math.floor(elapsed / 1000)));
      title = title.replace(':right', repeat(' ', 60 - title.length + 2));
      i += step;
      let line = `XXX\n${Math.floor(i / max * 100)}\n${title}\nXXX\n`;
      if(line !== lastline)
        child.stdin.write(line);
      lastline = line;
    };

    let end = function() {
      if(ended)
        return;

      ended = true;
      child.stdin.end();
      process.stderr.write("\r\n");

      process.stdin.removeListener('data', ctrlc);
    };

    return {tick, end};
  }


  async  checklist(title, choices) {
    var args = ['--checklist', title];
    args.push(0, 0, 0);
    for(var k in choices)
      args.push(k, choices[k].value || choices[k], !!choices[k].active | 0);

    try {
      var response = await this._run(args);
      return splitArgs(response);
    } catch(err) {
      return null;
    }
  }

  _run(cmd) {

    var next = defer();
    var args = [].concat(this.options).concat(cmd);

    if(this.sync) {
      let child = cp.spawnSync(bin, args, {
        stdio : ['inherit', 'inherit', 'pipe'],
      });

      if(child.status !== 0)
        next.reject(`Bad exit code ${child.status}`);
      else
        next.resolve('' + child.stderr);

    } else {
      let child = cp.spawn(bin, args, {
        stdio : ['inherit', 'inherit', 'pipe'],
      });

      child.on('error', next.reject);
      child.on('exit', async function(code) {
        if(code !== 0)
          return next.reject(`Bad exit code ${code}`);
        var body = await drain(child.stderr);
        next.resolve('' + body);
      });
    }

    return next;
  }


}


module.exports = whiptail;
