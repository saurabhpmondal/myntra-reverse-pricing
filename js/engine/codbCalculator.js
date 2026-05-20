import {
  BUSINESS_RULES
} from '../config/businessRules.js';

export function calculateCODB({
  fixedFee,
  returnFee
}) {

  const baseReturnCost =
    Number(fixedFee) +
    Number(returnFee);

  const returnCost =
    baseReturnCost *
    BUSINESS_RULES.GST_MULTIPLIER;

  const rtvPercent =
    BUSINESS_RULES.RTV_PERCENT;

  const rtvCodb =
    (
      returnCost * rtvPercent
    ) /
    (
      100 - rtvPercent
    );

  return {
    baseReturnCost,

    returnCost,

    rtvPercent,

    rtvCodb
  };
}