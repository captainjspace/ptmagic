/**
 * SiteModel.tx
 * Defines interface, validation and functions to calclulate site user of the gsu
 */

import { 
  SubjectKeys,
  SeverityKeys, 
  getErrorCode 
}  from "./ErrorCodes.ts";

//Error Codes
const exits=SeverityKeys.exits
const SITE_MODEL=SubjectKeys.SITE_MODEL
const SITE_VALUE=SubjectKeys.SITE_VALUE

//JSON
export interface SiteModel {
  dailyUsers: number;
  canary: number;
  rush: number;
}

export interface DecoratedSiteModel extends SiteModel{
  canarySize :number;
  canaryHour:number;
  canaryMinute :number;
  rushSize :number;
  rushDaily :number;
}

export const siteCalc = (siteConf:SiteModel): DecoratedSiteModel => {
  const site=siteConf;
  const siteMsg:any[][] = [];

//original check
  const checkRequired = () => {
    const requiredKeys:string[] = ["dailyUsers","canary","rush"];
    const allPresent = requiredKeys.every(prop => prop in site);
    if (!allPresent) {
      const missing = requiredKeys.filter(prop => !(prop in site));
      siteMsg.push([getErrorCode(exits,SITE_MODEL)??"",...missing]);
    }
  }
  checkRequired();

  // thorough check
  const isValidSiteModel = (site: any): site is SiteModel => {
    // 1. Structural and type check
    if (!site || typeof site !== 'object') return false;
    const { dailyUsers, canary, rush } = site;
    // 2. Verify all required properties are numeric
    if (typeof dailyUsers !== 'number' || typeof canary !== 'number' || typeof rush !== 'number') {
      siteMsg.push([getErrorCode(exits,SITE_VALUE),  {dailyUsers,canary, rush } , "- not a number -"]);
      return false;
    }

    // 3. Verify all properties are positive (> 0)
    if (dailyUsers <= 0 || canary <= 0 || rush <= 0) {
      siteMsg.push([getErrorCode(exits,SITE_VALUE), { dailyUsers, canary, rush }, "> than 0"]);
      return false;
    }

    // 4. Verify canary and rush for percentages is specifically between 0 and 1
    if (canary > 1 || rush > 1) {
      siteMsg.push(["% must be between 0 and 1", getErrorCode(exits,SITE_VALUE), { canary, rush }]);
      return false;
    }

    return true
  }

  const isValid = isValidSiteModel(site);
  if (!isValid || siteMsg.length!=0) {
    siteMsg.forEach((m) => console.error(m));
    process.exit(-1);
  }

  const getSiteCalcs = () => { 
    const canarySize = site.dailyUsers * site.canary;
    const canaryHour = canarySize / 24;
    const canaryMinute = Math.ceil(canaryHour / 60);
    const rushSize = canarySize * site.rush;
    const rushDaily = Math.ceil(rushSize / 60);
    return {canarySize, canaryHour, canaryMinute, rushSize, rushDaily }
  } 
  const siteCalc:DecoratedSiteModel = {...site,...(getSiteCalcs())}; 
  return siteCalc;
}


