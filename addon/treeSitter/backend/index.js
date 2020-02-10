const Parser = require('tree-sitter');
const JavaScript = require('tree-sitter-javascript');
 
const parser = new Parser();
parser.setLanguage(JavaScript);

