whiptail wrapper for nodejs

[![Build Status](https://github.com/131/whiptail/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/131/whiptail/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/131/whiptail/badge.svg?branch=master)](https://coveralls.io/github/131/whiptail?branch=master)
[![Version](https://img.shields.io/npm/v/whiptail.svg)](https://www.npmjs.com/package/whiptail)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)
![Available platform](https://img.shields.io/badge/platform-linux-blue.svg)

# Installation

```
npm install whiptail
# have whiptail binary installed (apt-get install whiptail)
```

# API

``` 
const Whiptail = require('whiptail');

var whiptail = new Whiptail(); //some options
(async function(){


  var choices = {
    "abc" : "this is a foo",
    "bar" : "this is a bar",
  };

  await whiptail.msgbox("Are you okay");


  var name = await whiptail.inputbox("Enter your name");
  console.log({name});

  var res = await whiptail.menu("Choose a stuff", choices);
  console.log({res});

  res = await whiptail.checklist("Choose anoter stuff", choices);
  console.log({res});

  res = await whiptail.checklist("Choose the last stuff", choices);
  console.log({res});

})();

```


# Credits
* [131](https://github.com/131)
