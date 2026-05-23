import process from 'node:process';
import {
  postMessageToThread,
  threadId,
  workerData,
  Worker,
} from 'node:worker_threads';

const channel = new BroadcastChannel('sync');
const level = workerData?.level ?? 0;

if (level < 10) {
  const worker = new Worker(new URL(import.meta.url), {
    workerData: { level: level + 1 },
  });
}

if (level === 0) {
  process.on('workerMessage', (value, source) => {
    console.log(`${source} -> ${threadId}:`, value);
    postMessageToThread(source, { message: 'pong' });
  });
} else if (level === 10) {
  process.on('workerMessage', (value, source) => {
    console.log(`${source} -> ${threadId}:`, value);
    channel.postMessage('done');
    channel.close();
  });

  await postMessageToThread(0, { message: 'ping' });
}

channel.onmessage = channel.close;

