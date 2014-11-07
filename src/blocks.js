var $ = require('jquery');
var Promise = require('promise-polyfill'); //TODO: ADD setimmediate
var Serializer = require("mousse").Serializer;
var lzstring = require('lz-string');
var errors = require('./errors');

exports.changeState = function(book, passage) {
  //Update Game State and change passage
  $(book.el).children('passage').hide();
  passage.el.show();
  book.state.history.push(passage.name);
  //Build hash and change url
  //We have to maintain and serialize the history.  Normal back will cause
  //speedrun like behaviour not go backwards like we want.
  //This way the link contains all history and functions as a save game.
  var hash = new Serializer().serializeObject(book.state);
  hash = lzstring.compressToBase64(hash);
  history.pushState(0, document.title,
      '#' + book.name + '/' + hash);
};

exports.clickExplore = function(book, passage) {
  exports.changeState(book, passage);
};

exports.buildExplore = function(book, i, el) {
  el = $(el);
  var link = el.attr('link');
  var passage = book.passages[link];
  if (!passage) {
    console.warn('missing package ' + link);
  } else {
    el.click(function() {
      exports.clickExplore(book, passage);
    });
  }
};

exports.buildPassage = function(book, i, el) {
  el = $(el);
  var name = el.attr('name');
  book.state.passages[name] = {};
  book.passages[name] = new exports.Passage(book, el);
};


exports.Passage = function(book, el) {
  this.book = book;
  this.name = el.attr('name');
  this.el = el;
  this.state = book.state.passages[this.name];
};


/// "initBook"
exports.Book = function(el) {
  this.el = el;
  this.name = $(this.el).attr('name');
  this.passages = {};
  this.state = {
    'history': [],
    'passages': {},
  };
  $(this.el).children('passage').each(exports.buildPassage.bind(null, this));
  $(this.el).find('explore').each(exports.buildExplore.bind(null, this));
};


/// "buildBooks"
exports.buildBooks = function() {
  window.books = {};
  $('book').each(function(i, el){
    var name = $(el).attr('name');
    var book = window.books[name] = new exports.Book(el);
  });
};
