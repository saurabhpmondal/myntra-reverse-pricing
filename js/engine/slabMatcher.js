export function findMatchingSlab(slabs = [], value = 0) {

  if (!Array.isArray(slabs)) {
    return null;
  }

  const numericValue = Number(value);

  for (const slab of slabs) {

    const lower = Number(slab.lower_limit);
    const upper = Number(slab.upper_limit);

    if (
      numericValue >= lower &&
      numericValue <= upper
    ) {
      return slab;
    }

  }

  return null;
}