const jsonc = require("tree-sitter-jsonc/grammar");

module.exports = grammar(jsonc, {
  name: "hjson",

  rules: {
    _value: (_, original) => original,

    pair: (_, original) => original,

    object: ($) => seq("{", lineBreakOrComma($.pair), "}"),

    string: ($, original) =>
      choice($.quoted_string, $.multiline_string, $.quoteless_string),

    array: ($) => seq("[", lineBreakOrComma($._value), "]"),

    quoted_string: ($) =>
      choice(
        seq('"', '"'),
        seq("'", "'"),
        seq('"', $._quoted_string_content, '"'),
        seq("'", $._quoted_string_content, "'")
      ),

    //  Use repeat1 here instead of repeat, as treesitter doesn't support matching with empty string
    _quoted_string_content: ($) =>
      repeat1(choice(token.immediate(/[^\\"\'\n]+/), $.escape_sequence)),

    quoteless_string: ($) =>
      prec(-1, /[^ \t\n\r{}\[\],:'"#][^\n\r,:}\]]*/),

    multiline_string: ($) =>
      choice(seq("'''", "'''"), seq("'''", repeat1(/[^\\"\'\n]+/), "'''")),

    escape_sequence: ($) =>
      token.immediate(
        seq("\\", choice(/['"\\\/bfnrt]/, /u[0-9a-fA-F]{4}/))
      ),

    comment: ($, original) => token(choice(original, seq("#", /.*/))),
  },
});

function lineBreakOrComma1(rule) {
  return seq(rule, repeat(seq(/,|\n/, optional(rule))));
}

function lineBreakOrComma(rule) {
  return optional(lineBreakOrComma1(rule));
}
