cheerio = require('cheerio');
request = require('request');
var querystring = require("querystring");

// what is the best lg phone among to buy for a specific budgetx
//

// var domains = ['com', 'ac', 'ad', 'ae', 'com.af', 'com.ag', 'com.ai', 'al', 'am', 'co.ao'
//   , 'com.ar', 'as', 'at', 'com.au', 'az', 'ba', 'com.bd', 'be', 'bf', 'bg', 'com.bh', 'bi',
//   'bj', 'com.bo', 'br', 'bs', 'bt', 'co.bw', 'by', 'com.bz', 'ca', 'com.kh', 'cc', 'cd',
//   'cf', 'cat', 'cg', 'ch', 'ci', 'co.ck', 'cl', 'cm', 'com.co', 'ng'
// ];

domains = ['com', 'ng', 'com.ng', 'rw', 'co.uk'];

pairs = function pairs(str) {
  var pairs = []
    , length = str.length - 1
    , pair;
  str = str.toLowerCase();
  for (var i = 0; i < length; i++) {
    pair = str.substr(i, 2);
    if (!/\s/.test(pair)) {
      pairs.push(pair);
    }
  }
  return pairs;
};

similarity = function (pairs1, pairs2) {
  var union = pairs1.length + pairs2.length
    , hits = 0;

  for (var i = 0; i < pairs1.length; i++) {
    for (var j = 0; j < pairs1.length; j++) {
      if (pairs1[i] == pairs2[j]) {
        pairs2.splice(j--, 1);
        hits++;
        break;
      }
    }
  }
  return 2 * hits / union || 0;
};


module.exports =
  {
    fuzzy: function (check, strings, floor) {
      var str1 = check
        , pairs1 = pairs(check);

      floor = typeof floor == 'number' ? floor : default_floor;

      if (typeof (strings) == 'string') {
        return str1.length > 1 && strings.length > 1 && similarity(pairs1, pairs(strings)) >= floor || str1.toLowerCase() == strings.toLowerCase();
      } else if (strings instanceof Array) {
        var scores = {};

        strings.map(function (str2) {
          scores[str2] = str1.length > 1 ? similarity(pairs1, pairs(str2)) : 1 * (str1.toLowerCase() == str2.toLowerCase());
        });

        return strings.filter(function (str) {
          return scores[str] >= floor;
        }).sort(function (a, b) {
          return scores[b] - scores[a];
        });
      }
    },
    //konga
    sprintf: function () {
      var args = arguments,
        string = args[0],
        i = 1;
      return string.replace(/%((%)|s|d)/g, function (m) {
        // m is the matched format, e.g. %s, %d
        var val = null;
        if (m[2]) {
          val = m[2];
        } else {
          val = args[i];
          // A switch statement so that the formatter can be extended. Default is %s
          switch (m) {
            case '%d':
              val = parseFloat(val);
              if (isNaN(val)) {
                val = 0;
              }
              break;
          }
          i++;
        }
        return val;
      });
    },
    scrap: function (query, site, callback) {

    
      if (site == 'konga')
        querystr = querystring.escape('site:konga.com ' + query).toString();
      else if (site == 'jumia')
        querystr = querystring.escape('site:jumia.com.ng ' + query).toString();

      var rand = Math.round(Math.random() * (domains.length));

      console.log(domains[rand]);

      add = domains[rand];

      url = 'https://www.google.' + add + '/search?q=' + querystr + '&safe=off'
      
      request(url, function (error, response, html) {
        //console.log(query);
        // First we'll check to make sure no errors occurred when making the request
        var fs = require('fs');

        if (!error) {
          // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

          var $ = cheerio.load(html);
          len = $('.g').length;
          if (len > 10)
            len = 10;

          if (len == 0) {
            callback(0);
          }

          $('.g').filter(function () {

            var result = $(this).children().filter('.r').children().prop('href');

            if (result != undefined) {

              result = result.toString();
              htp = result.indexOf('http');
              and = result.indexOf('&');

              if (htp != -1) {
                if (and != -1)
                  link = result.substring(htp, and);
                else
                  link = result.substring(htp);
              }

              request(link, callback(len));
              console.log(link);
            }

          });

        }

        else
        {
          console.log(error);
        }
      })
    },

  }