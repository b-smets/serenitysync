jest.unmock('../revisions');
jest.mock('../crypto', () => ({
  sha256: jest.fn().mockReturnValue('hash'),
}));

import { sha256 } from '../crypto';
import { calculateRevisionId } from '../revisions';

describe('revisions', () => {

  const documentBody = JSON.stringify({
    one: 'alpha',
    two: 'beta',
    three: 'gamma',
  });

  test('calculates the hash of the body', () => {
    calculateRevisionId(documentBody, '5-abc');
    expect(sha256).toBeCalledWith(documentBody);
  });

  test('calculates the next revision if the current revision ID is provided', () => {
    expect(calculateRevisionId(documentBody, '5-abc')).toBe('6-hash');
  });

  test('calculates the next revision id for documents with an empty body', () => {
    expect(calculateRevisionId('', '5-abc')).toBe('6-hash');
  });

  test('calculates the initial revision id for the document', () => {
    expect(calculateRevisionId(documentBody)).toBe('1-hash');
  });

  test('calculates the initial revision id for documents with empty body', () => {
    expect(calculateRevisionId('')).toBe('1-hash');
  });

});