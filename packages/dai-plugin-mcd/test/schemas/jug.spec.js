import { mcdMaker } from '../helpers';
import { takeSnapshot, restoreSnapshot } from '@makerdao/test-helpers';

import schemas, {
  ANNUAL_STABILITY_FEE,
  DATE_STABILITY_FEES_LAST_LEVIED
} from '../../src/schemas';

let maker, snapshotData;

beforeAll(async () => {
  maker = await mcdMaker({
    multicall: true
  });

  snapshotData = await takeSnapshot(maker);
  maker.service('multicall').createWatcher({ interval: 'block' });
  maker.service('multicall').registerSchemas(schemas);
  maker.service('multicall').start();
});

afterAll(async () => {
  await restoreSnapshot(snapshotData, maker);
});

test(ANNUAL_STABILITY_FEE, async () => {
  const expected = 0.04999999999989363;
  const annualStabilityFee = await maker.latest(ANNUAL_STABILITY_FEE, 'ETH-A');
  expect(annualStabilityFee).toEqual(expected);
});

test(DATE_STABILITY_FEES_LAST_LEVIED, async () => {
  var timestamp = Math.round(new Date().getTime() / 1000);
  const dateStabilityFeesLastLevied = await maker.latest(
    DATE_STABILITY_FEES_LAST_LEVIED,
    'ETH-A'
  );

  expect(dateStabilityFeesLastLevied instanceof Date).toEqual(true);
  expect(timestamp - dateStabilityFeesLastLevied).toBeLessThanOrEqual(10);
});
