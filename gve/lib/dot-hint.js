// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var WORD = /[\w$]+/, RANGE = 500;
  const COMPLETIONS = ["node", "fontname"]
  CodeMirror.registerHelper("hint", "dot", function(editor, options) {
    var word = options && options.word || WORD;
    var range = options && options.range || RANGE;
    var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
    var end = cur.ch, start = end;
    var tokens = []
    for(var lineno=editor.firstLine(); lineno<editor.lastLine(); lineno++){
      tokens = tokens.concat(editor.getLineTokens(lineno))
    }
    const variables = tokens.filter(token => token.type.startsWith("variable")).map(token => token.string.trim())
    while (start && word.test(curLine.charAt(start - 1))) --start;
    var curWord = start != end && curLine.slice(start, end);
    console.log(curWord)
    const candidates = variables.concat(COMPLETIONS)
    const uniqueCompletions = [...new Set(candidates)];
    const list = uniqueCompletions.filter((token) => token.startsWith(curWord))
    return {list: list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
  });
});
