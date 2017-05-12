// Salon Scraper - Scrapes data into /tests/salonScraper.csv file. Can be quickly imported into an excel spreadsheet. 

//https://docs.google.com/spreadsheets/d/1bqJeuEXeLKfTGfCgCcr3JOGjL0A_dp66BY5vdgVNJ9s/edit?usp=sharing

const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const fs = require('fs');

var curpage = 1;
var numPages = 1; // 219;
var mrBaseUrl = 'https://madison-reed.com';
var listBaseUrl = 'https://madison-reed.com/blog';

var listUrl = listBaseUrl 
request(listUrl, function(err, res, body) {
  var doc = cheerio.load(body);
  var blogList = doc('a');
  var urls = [];
  for (var key in blogList) {
    var value = blogList[key];
    if (value.attribs && value.attribs.href && value.attribs.href.match('\/blog\/')) {
      var ignoreList = [ '/blog/hairstyles', '/blog/hair-tutorials', '/blog/hair-color', '/blog/inspiration']
      var blogUrl = value.attribs.href;
      if (urls.indexOf(blogUrl) == -1 && ignoreList.indexOf(blogUrl) == -1) {
        urls.push(blogUrl);
      }
    }
  }

  blogList.each(function(i, blogLink) {
    urls.push({i: i, url: blogLink.attribs.href});
  });

  async.eachSeries(
    urls,
    function(blogInfo, eachCB) {
      request(mrBaseUrl + blogInfo, function(err, res, body) {
        if (err) {
          return eachCB(err);
        }
        var $ = cheerio.load(body);
        var name = $('h1').text() || " ";
        var authorStr = $('h1').next('p').text() || " ";
        var authorStr = authorStr.split('"');
        author = authorStr[0].split('{')[0];
        var publishDate = new Date(authorStr[1]).toUTCString().split(' ');
        publishDate = publishDate[2] + " " + publishDate[1] + ", " + publishDate[3];

        var body = $('.article').children().text() || " ";
        var blogPost = {
          title: name,
          author: author,
          publishDate: publishDate,
          body: body
        }
        console.log(blogPost);
        return;
        // eachCB();
      });
    return;
  });
});