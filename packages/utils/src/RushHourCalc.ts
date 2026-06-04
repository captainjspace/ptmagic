/**
 * RushHourCalc.ts
 *
 * Site x User capacity crossover — ramp simulation and peak hour burst model.
 *
 * @author joshlandman@google.com
 */

import type {DecoratedGSUModel}     from "./GSUmodels.js";
import type {DecoratedSiteModel} from "./SiteModel.js";
import type {AdjustedTokenInputs} from "./TokenCruncher.js";
import type {UserCapacity} from "./UserCapacityCalcs.js";
export type {TokenCalculatorConfig} from "./TokenCalculatorConfig.js";
import { getErrorCode, SeverityKeys, SubjectKeys } from "./ErrorCodes.js";

const severityKey = SeverityKeys.info ;
const subjectKey = SubjectKeys.TOKEN_RESERVE;



export interface GridRecord {
  activeUsers: number;
  tokenBurn: number;
  recoveryOffset: number;
  accumulatedTokenDebt: number;
  reserveTokens: number;
  stacking: boolean;
  recoveryTime: number;
  minuteBurn: number;
  isPeak: boolean;
}

export interface RushHourCapacity {
  minuteGrid: Record<number,GridRecord>;
  hourGrid: Record<number, GridRecord>;
  peakStart: number;
}

/* shared simulation engine — returns a fresh stateful object */
function makeSimulator(tokenBucketSize: number, perMinute: number, recoveryRate: number) {
  return {
    _debtStack: [] as number[],
    tokenBurn: 0,
    recoveryOffset: 0,
    accumulatedTokenDebt: 0,
    reserveTokens: tokenBucketSize,
    recoveryTime: 0,
    stacking: false,
    activeUsers: 0,
    minuteBurn: 0,
    isPeak: false,

    getTokenData(): GridRecord {
      const { activeUsers, minuteBurn, accumulatedTokenDebt, reserveTokens,
        stacking, recoveryTime, tokenBurn, recoveryOffset, isPeak } = this;
        return { activeUsers, minuteBurn, tokenBurn, recoveryOffset,
          accumulatedTokenDebt, reserveTokens, stacking, recoveryTime, isPeak };
    },

    setStacking() { this.stacking = this._debtStack.length > 0; },

      addTotal(tokens: number) {
      this.tokenBurn += tokens;
      this.recoveryOffset += perMinute;
    },

    updateRecoveryTime() {
      this.recoveryTime = Math.abs(
        Math.ceil((tokenBucketSize - this.reserveTokens) / recoveryRate),
      );
    },

    recoverReserve() {
      this.reserveTokens = Math.min(this.reserveTokens + perMinute, tokenBucketSize);
    },

    burnReserve(tokens: number) {
      this.reserveTokens -= tokens;
      if (this.reserveTokens <= 0) throw Error(getErrorCode(severityKey, subjectKey));
      this.updateRecoveryTime();
    },

    stackCalc(data: { tokens: number; activeUsers: number; isPeak: boolean }): GridRecord {
      this.activeUsers = data.activeUsers;
      this.minuteBurn = data.tokens;
      this.isPeak = data.isPeak;
      this.recoverReserve();
      const minuteDebt = data.tokens - perMinute;
      this.addTotal(data.tokens);
      if (minuteDebt > 0) {
        this._debtStack.push(minuteDebt);
        this.accumulatedTokenDebt = this._debtStack.reduce((a, b) => a + b, 0);
        this.setStacking();
      }
      try {
        this.burnReserve(minuteDebt);
      } catch (err) {
        console.log(err);
        /* reserve went negative — Paygo/spillover covers the overage */
      } finally {
        this.updateRecoveryTime();
      }
      const gridRecord:GridRecord = this.getTokenData();
      return gridRecord ;

    },
  };
}

export const calculateRushHour = ( 
                                  data: { 
                                    decoratedSiteModel: DecoratedSiteModel,
                                     decoratedGSUModel: DecoratedGSUModel,
                                    userCapacity: UserCapacity, 
                                    adjustedTokens: AdjustedTokenInputs
                                  }
                                 ):RushHourCapacity  => {

                                   /* Large Block of required inputs */
                                   const { decoratedGSUModel, decoratedSiteModel, userCapacity, adjustedTokens} = data;
                                   const { tokenBucketSize, perMinute } = decoratedGSUModel.gsuModelCalcs; 
                                   const { stableBurn, realUserFloor, recoveryRate, peakTokenBurner, timeFactors } = userCapacity;
                                   const turnsPerMinute = timeFactors.turnsPerMinute;
                                   const burndownTokens = adjustedTokens.burndownTokens;
                                   const peakStableBurn = peakTokenBurner.peakStableBurn;
                                   const siteCalcs = decoratedSiteModel.siteCalcs;
                                   const rushDaily = siteCalcs.rushDaily


                                   /* 
                                    * ── Ramp simulation: +1 user per minute until bucket drains ── 
                                    * stableBurn is what an average user burns per minute
                                    *
                                    */
                                   let maxStableUsers:number=realUserFloor;
                                   const rampSim = makeSimulator(tokenBucketSize, perMinute, recoveryRate);
                                   const minuteGrid: Record<number, GridRecord> = {};
                                   /*** grid engine **/
                                   for (let i = 1; i <= rushDaily - realUserFloor; i++) {
                                     const activeUsers = realUserFloor + i;
                                     const minuteBurn = stableBurn + (i * burndownTokens * turnsPerMinute);
                                     minuteGrid[i] = rampSim.stackCalc({ tokens: minuteBurn, activeUsers, isPeak: false });
                                     if (minuteGrid[i]!.reserveTokens>tokenBucketSize/2) maxStableUsers=activeUsers; 
                                     if (minuteGrid[i]!.reserveTokens <= 0) break;

                                   }

                                   /* ── Hour simulation: 60-min base run + 3-min peak burst ── */
                                   const hourSim = makeSimulator(tokenBucketSize, perMinute, recoveryRate);
                                   const hourGrid: Record<number, GridRecord> = {};

                                   /* 
                                    *
                                    * p95 user: 1 extra user arrives at a random minute, burns at p95 rate for 3 turns/3 min.
                                    * Statistically this happens ~once per hour. 
                                    * The 42-user ramp in minuteGrid handles holiday/BlackFriday overflow 
                                    * — wire inputConfig overrides to that path. 
                                    *  
                                    */

                                   const p95AdditionalBurn = peakStableBurn - stableBurn;
                                   const peakDuration = 3;
                                   const peakStart = Math.floor(Math.random() * (60 - peakDuration)) + 1;

                                   for (let min = 1; min <= 60; min++) {
                                     const isPeak = (min >= peakStart && min < peakStart + peakDuration)? true: false;
                                     const activeUsers = Math.min(realUserFloor + min, maxStableUsers);

                                     const minuteBurn = (activeUsers * burndownTokens * turnsPerMinute)+ ( (isPeak)?p95AdditionalBurn:0) ; 
                                     hourGrid[min] = hourSim.stackCalc({ tokens: minuteBurn, activeUsers, isPeak });
                                     if (hourGrid[min]!.reserveTokens <= 0) break;

                                   }

                                   return {
                                     minuteGrid,
                                     hourGrid,
                                     peakStart
                                   }
                                 };
