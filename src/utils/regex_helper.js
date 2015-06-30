var RegexHelper = {
  __esModule: true,

  removeLine(text, from, to) {
    var first_part = text.substring(0, from);
    if (to !== text.length) {
      return first_part + text.substring(to + 1, text.length);
    } else {
      return first_part.substring(0, first_part.length - 1);
    }
  },

  removeAllLinesByRegex(text, regex) {
    var matches = RegexHelper.matchAllRegex(text, regex);
    return RegexHelper.removeAllLines(text, matches);
  },

  removeAllLines(text, matches) {
    for (var i = matches.length - 1; i >= 0; i--) {
      var match = matches[i];
      var from_i = match.index;
      var to_i = from_i + match[0].length;
      text = RegexHelper.removeLine(text, from_i, to_i);
    }
    return text;
  },

  matchFirstRegex(str, re) {
    var m;
    while ((m = re.exec(str)) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      return m;
    }
  },

  getGroupStringFromRegex(str, re, groupIndex) {
    var match = RegexHelper.matchFirstRegex(str, re);
    return match[groupIndex];
  },

  matchAllRegex(str, re) {
    var m;
    var all_matches = [];
    while ((m = re.exec(str)) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      all_matches.push(m);
    }
    return all_matches;
  },

  trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
  },

  ltrim(str) {
    return str.replace(/^\s+/, '');
  },

  rtrim(str) {
    return str.replace(/\s+$/, '');
  },

  fulltrim(str) {
    return str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
  },

  trimEmptyBorderLines(str) {
    return str.replace(/^$\n/g, '');
  },

  RegexHelper,

};

module.exports = RegexHelper;
