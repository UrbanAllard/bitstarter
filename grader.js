#!/usr/bin/env node
/*
 Automatically grade files for the presence of specified HTML tags/attributes.
 Uses commander.js and cheerio. Teaches command line application development
 and basic DOM parsing.

 References:

 + cheerio
 - https://github.com/MatthewMueller/cheerio
 - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
 - http://maxogden.com/scraping-with-node.html

 + commander.js
 - https://github.com/visionmedia/commander.js
 - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
 - http://en.wikipedia.org/wiki/JSON
 - https://developer.mozilla.org/en-US/docs/JSON
 - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
 */

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://stormy-sands-2244.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var checkUrl = function(url, checksfile) {
    restler.get(url).on('complete', function(data) {
        $ = cheerio.load(data);
        var checks = loadchecks(checksfile).sort();
        var out = {};
        for(var ii in checks) {
            var present = $(checks[ii]).length > 0;
            out[checks[ii]] = present;
        }

        var outJson = JSON.stringify(out, null, 4);
        // return outJson;
        console.log(outJson);
    });

};

var validUrl = function(url) {
    restler.get(url).on('complete', function(result) {
        if (result instanceof Error) {
            console.log("NOT A VALIID URL . EXITING.", url);
            process.exit(1);
        }
        return url;
    });
};


var cheeriohtmlfile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadchecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheeriohtmlfile(htmlfile);
    var checks = loadchecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};                                                         //,clone(validUrl), URL_DEFAULT

if (require.main != module) {
} else {
    program
            .option('-c, --checks <check_file>', 'Path to checks.json')
            .option('-f, --file <html_file>', 'Path to index.html')
            .option('-u, --url <valid_url>', 'valid url to file')
            .parse(process.argv);
    if (!program.checks) {
    } else var check = true;
    if (!program.file) {
    } else var f_chosen = true;
    if (!program.url) {
    } else var u_chosen = true;
    console.log(check + " " + f_chosen + " " + u_chosen);
    if (check) {
        if (f_chosen) {
            var checkJson = checkHtmlFile(program.file, program.checks);
            var outJson = JSON.stringify(checkJson, null, 4);
            console.log(outJson);
        }else if(u_chosen){
            checkUrl(program.url,program.checks);
        }
    }
}


