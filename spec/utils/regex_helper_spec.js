import h from 'spec/spec_helper';
import { removeLine, removeAllLinesByRegex } from 'azk/utils/regex_helper';

describe('RegexHelper:', function() {

  it('should remove a line from text', function () {
    var text_array = [
      'abc',
      '123',
      '456',
    ];

    var result = removeLine(text_array.join('\n'), 4, 7);
    h.expect(result.split('\n')).to.eql(
      [
        'abc',
        '456',
      ]
    );
  });

  it('should remove all matches from text', function () {
    var text_array = [
      '890',
      'abc0',
      '123',
      'abc1',
      '456',
      'abc2',
      '789',
      'abc3',
      '012',
      'abc4',
      '345',
    ];

    var result = removeAllLinesByRegex(text_array.join('\n'), /^\d\d\d$/gm);
    h.expect(result.split('\n')).to.eql(
      [
        'abc0',
        'abc1',
        'abc2',
        'abc3',
        'abc4',
      ]
    );
  });

  it('should remove all matches from text', function () {
    var text_array = [
      '',
      '',
      '',
      'abc1',
      '',
      'abc2',
      '',
      'abc3',
      '',
      '',
      '',
    ];

    var result = removeAllLinesByRegex(text_array.join('\n'), /^$/gm);
    h.expect(result.split('\n')).to.eql(
      [
        'abc1',
        'abc2',
        'abc3',
      ]
    );
  });

});
