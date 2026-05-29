import { type GridRecord, type DecoratedModel } from "./types.js";
import { type DecoratedSiteModel } from "./SiteModel.js";

export const calculateRushHour = (
  model: DecoratedModel,
  site: DecoratedSiteModel,
  stableBurn: number,
  burndownTokens: number,
  realUserFloor: number,
  recoveryRate: number,
) => {
  const rushHourTokenData = {
    debtStack: [0],
    tokenBurn: 0,
    recoveryOffset: 0,
    reserveTokens: model.tokenBucketSize,
    recoveryTime: 0,
    stacking: false,

    getTokenData() {
      const {
        recoveryOffset,
        reserveTokens,
        debtStack,
        stacking,
        recoveryTime,
        tokenBurn,
      } = rushHourTokenData;
      const accumulatedTokenDebt = debtStack.reduce(
        (a: number, b: number) => a + b,
        0,
      );

      return {
        tokenBurn,
        recoveryOffset,
        accumulatedTokenDebt,
        reserveTokens,
        stacking,
        recoveryTime,
      };
    },

    setStacking() {
      this.stacking = this.debtStack.length > 0 ? true : false;
    },
    addTotal(tokens: number) {
      this.tokenBurn += tokens;
      this.recoveryOffset += model.perMinute;
    },

    updateRecoveryTime() {
      this.recoveryTime = Math.abs(
        Math.ceil((model.tokenBucketSize - this.reserveTokens) / recoveryRate),
      );
    },

    recoverReserve() {
      const reserve = this.reserveTokens + model.perMinute;
      this.reserveTokens = Math.min(reserve, model.tokenBucketSize);
    },
    burnReserve(tokens: number) {
      this.reserveTokens -= tokens;
      if (this.reserveTokens <= 0) throw Error("Out of Tokens");
      this.updateRecoveryTime();
    },

    stackCalc(data: { tokens: number }) {
      this.recoverReserve();
      const minuteDebt = data.tokens - model.perMinute;
      this.addTotal(data.tokens);
      if (minuteDebt > 0) {
        this.debtStack.push(minuteDebt);
        this.setStacking();
      }
      try {
        this.burnReserve(minuteDebt);
      } catch (err) {
        console.log(err);
      } finally {
        return this.getTokenData();
      }
    },
  };

  const minuteGrid: Record<number, GridRecord> = {};
  let rushHourData;

  for (let i = 1; i <= site.rushDaily - realUserFloor; i++) {
    const activeUsers = realUserFloor + i;
    const minuteBurn = stableBurn + i * burndownTokens;
    rushHourData = rushHourTokenData.stackCalc({ tokens: minuteBurn });

    const key = i;
    const gridRecord: GridRecord = {
      activeUsers,
      minuteBurn,
      ...rushHourData,
    };
    minuteGrid[key] = gridRecord;

    if (rushHourData.reserveTokens <= 0) {
      break;
    }
  }
  return { minuteGrid, rushHourData };
};
