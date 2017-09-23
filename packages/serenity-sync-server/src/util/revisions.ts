import { sha256 } from './crypto';

export const calculateRevisionID = (body: string, currentRevisionID?: string) => {
  const hash = sha256(body);
  if (currentRevisionID) {
    const seq = parseInt(currentRevisionID.substring(0, currentRevisionID.indexOf('-')), 10);
    return (seq + 1) + '-' + hash;
  }
  return '1-' + hash;
};