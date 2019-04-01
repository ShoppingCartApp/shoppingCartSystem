
var sha256 = require("./index"),
  tester = require("testing"),
	fs = require('fs'),
  utf8 = require('utf8'),
  FORMAT_MAX_MSG_LEN = 40,
  tests = [],
  testData = [
  
    [
      "",
      "E3B0C442 98FC1C14 9AFBF4C8 996FB924 27AE41E4 649B934C A495991B 7852B855"
    ],

    [
      "abc",
      "BA7816BF 8F01CFEA 414140DE 5DAE2223 B00361A3 96177A9C B410FF61 F20015AD"
    ],

    [
      "í",
      "127035A8 FF26256E A0541B5A DD6DCC3E CDAEEA60 3E606F84 E0FD6349 2FBAB2C5"
    ],

    [
      "Jeffrey David Allen",
      "33F9383A 82D3ADE9 B4BD7BEB 43691ACA 9DFD2102 3D3102AD 5B02DA94 6BDF11E3"
    ],

    [
      "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq",
      "248D6A61 D20638B8 E5C02693 0C3E6039 A33CE459 64FF2167 F6ECEDD4 19DB06C1"
    ],
    [
      fs.readFileSync("./data/5k.txt", 'utf8'),
      "82FF26C4 0E394578 2B37ECB7 CA844E60 E850C8B9 B1B5FBE3 4486AF29 FE8B612E"
    ],
    
  
    [
      fs.readFileSync("./data/a_1m.dat.txt", 'utf8'),
      "CDC76E5C 9914FB92 81A1C7E2 84D73E67 F1809A48 A497200E 046D39CC C7112CD0"
    ]
  
  ];

function testFormat(msg, max) {
  var quote = "'",
    max = max | 0,
    len = msg.length,
    result;
  if (max && len > max) {
    result = quote + msg.slice(0, max) + "..." + quote + " [+" + (len - max) + " more characters]";
  } else {
    result = quote + msg + quote;
  }
  return result;
}

testData.forEach(function(tdat) {
  
  var message = tdat[0],
    expected = tdat[1].split(' ').join('').toLowerCase();

  tests["sync test sha256() for " + testFormat(message, FORMAT_MAX_MSG_LEN)] = function(test) {
    test.startTime();
    var result = sha256(
      utf8.encode(message)
    );
    test.endTime();
    test.assert.identical(result, expected);
    test.done();
  };
});

// run tests
tester.run(tests);
