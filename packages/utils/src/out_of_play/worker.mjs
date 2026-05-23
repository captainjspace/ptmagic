import { MessageChannel, markAsUntransferable } from 'node:worker_threads';

const pooledBuffer = new ArrayBuffer(8);
const typedArray1 = new Uint8Array(pooledBuffer);
const typedArray2 = new Float64Array(pooledBuffer);

markAsUntransferable(pooledBuffer);

const { port1 } = new MessageChannel();
try {
  // This will throw an error, because pooledBuffer is not transferable.
  port1.postMessage(typedArray1, [ typedArray1.buffer ]);
} catch (error) {
  // error.name === 'DataCloneError'
}

// The following line prints the contents of typedArray1 -- it still owns
// its memory and has not been transferred. Without
// `markAsUntransferable()`, this would print an empty Uint8Array and the
// postMessage call would have succeeded.
// typedArray2 is intact as well.
console.log(typedArray1);
console.log(typedArray2);
