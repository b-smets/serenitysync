import { MockFirebase, MockFirebaseSdk } from 'firebase-mock';

interface MockFirebaseSdkExt extends MockFirebaseSdk {
  credential: {
    cert: () => void;
  };
  __setMockData: (data: any) => void;
  __clear: () => void;
}

const createDatabase = (data: any) => {
  const newDatabase = new MockFirebase(undefined, data);
  newDatabase.autoFlush(true);
  return newDatabase;
};

let database: MockFirebase = createDatabase(undefined);

const firebase = new MockFirebaseSdk(() => database) as MockFirebaseSdkExt;
firebase.credential = {
  cert: jest.fn(),
};
firebase.__setMockData = (data: any) => {
  database = createDatabase(data);
};
firebase.__clear = () => {
  database = createDatabase(undefined);
};

export = firebase;
