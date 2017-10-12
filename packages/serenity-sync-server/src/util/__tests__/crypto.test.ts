jest.unmock('../crypto');
jest.unmock('sha.js');

import { sha256 } from '../crypto';

describe('crypto', () => {
  test('creates the correct sha256 hash for a string', () => {
    expect(sha256('This is a very cool string'))
      .toBe('f1d71e36919729484af8634f273444c651e10322eafbd0784acedb434b8e7cd9');
  });

  test('creates the correct sha256 hash for the empty string', () => {
    expect(sha256(''))
      .toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});
