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
    var match = this.matchFirstRegex(str, re);
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

};

module.exports = RegexHelper;
