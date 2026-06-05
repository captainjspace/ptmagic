/**
 * SiteModel.tx
 * Defines interface, validation and functions to calclulate site user of the gsu
 */

import { SubjectKeys, SeverityKeys, getErrorCode } from "./ErrorCodes.js";
//import type { TokenCalculatorConfig } from "./TokenCalculatorConfig.js";
//Error Codes
const exits = SeverityKeys.exits;
const SITE_MODEL = SubjectKeys.SITE_MODEL;
const SITE_VALUE = SubjectKeys.SITE_VALUE;

//JSON
export interface SiteModel {
  dailyUsers: number;
  canary: number;
  rush: number;
}

export interface SiteCalcs {
  canarySize: number;
  canaryHour: number;
  canaryMinute: number;
  rushSize: number;
  rushDaily: number;
}

export interface DecoratedSiteModel {
  siteModel: SiteModel;
  siteCalcs: SiteCalcs;
}

export interface GridRecord {
  activeUsers: number;
  tokenBurn: number;
  recoveryOffset: number;
  accumulatedTokenDebt: number;
  reserveTokens: number;
  stacking: boolean;
  recoveryTime: number;
  minuteBurn: number;
}

export const siteCalc = (siteConfig: SiteModel): DecoratedSiteModel => {
  const siteModel = { ...siteConfig };
  const siteMsg: Array<string>[] = [];

  //original check
  const checkRequired = () => {
    const requiredKeys: string[] = ["dailyUsers", "canary", "rush"];
    const allPresent = requiredKeys.every((prop) => prop in siteModel);
    if (!allPresent) {
      const missing = requiredKeys.filter((prop) => !(prop in siteModel));
      siteMsg.push([getErrorCode(exits, SITE_MODEL) ?? "", ...missing]);
    }
  };
  checkRequired();

  // thorough check
  const isValidSiteModel = (siteModel: SiteModel): siteModel is SiteModel => {
    // 1. Structural and type check
    if (!siteModel || typeof siteModel !== "object") return false;
    const { dailyUsers, canary, rush } = siteModel;
    // 2. Verify all required properties are numeric
    if (
      typeof dailyUsers !== "number" ||
      typeof canary !== "number" ||
      typeof rush !== "number"
    ) {
      siteMsg.push([getErrorCode(exits, SITE_VALUE) ?? "", "- not a number -"]);
      return false;
    }

    // 3. Verify all properties are positive (> 0)
    if (dailyUsers <= 0 || canary <= 0 || rush <= 0) {
      siteMsg.push([
        getErrorCode(exits, SITE_VALUE),
        //{ dailyUsers, canary, rush },
        "> than 0",
      ]);
      return false;
    }

    // 4. Verify canary and rush for percentages is specifically between 0 and 1
    if (canary > 1 || rush > 1) {
      siteMsg.push([
        "% must be between 0 and 1",
        getErrorCode(exits, SITE_VALUE),
        //       { canary, rush },
      ]);
      return false;
    }

    return true;
  };

  const isValid = isValidSiteModel(siteModel);
  if (!isValid || siteMsg.length != 0) {
    siteMsg.forEach((m) => console.error(m));
    throw new Error("Invalid Site Configuration");
  }

  /* create Site Calcs */
  const getSiteCalcs = (): SiteCalcs => {
    const canarySize = siteModel.dailyUsers * siteModel.canary;
    const canaryHour = canarySize / 24;
    const canaryMinute = Math.ceil(canaryHour / 60);
    const rushSize = canarySize * siteModel.rush;
    const rushDaily = Math.ceil(rushSize / 60);
    return { canarySize, canaryHour, canaryMinute, rushSize, rushDaily };
  };

  /* decorate the model */
  const siteCalcs: SiteCalcs = getSiteCalcs();
  const decoratedSiteModel = { siteModel, siteCalcs };
  return decoratedSiteModel;
};
