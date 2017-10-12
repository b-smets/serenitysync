import { sha256 } from './crypto';

export const calculateRevisionId = (body: string, currentRevisionId?: string) => {
  const hash = sha256(body);
  if (currentRevisionId) {
    const seq = parseInt(currentRevisionId.substring(0, currentRevisionId.indexOf('-')), 10);
    return (seq + 1) + '-' + hash;
  }
  return '1-' + hash;
};