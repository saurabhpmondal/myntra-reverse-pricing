export function getFinalDispatchCost({
  defaultDispatchCost,
  customDispatchCost
}) {

  if (
    customDispatchCost !== null &&
    customDispatchCost !== undefined &&
    !Number.isNaN(customDispatchCost)
  ) {

    return Number(
      customDispatchCost
    );

  }

  return defaultDispatchCost;

}

export function getFinalReturnPercent({
  defaultReturnPercent,
  customReturnPercent
}) {

  if (
    customReturnPercent !== null &&
    customReturnPercent !== undefined &&
    !Number.isNaN(customReturnPercent)
  ) {

    return Number(
      customReturnPercent
    );

  }

  return defaultReturnPercent;

}