export function findMatchingSlab(
  slabs = [],
  value = 0
) {

  if (!Array.isArray(slabs)) {
    return null;
  }

  const numericValue =
    Number(value || 0);

  /*
  -----------------------------------
  SORT SLABS
  -----------------------------------
  */

  const sortedSlabs =
    [...slabs].sort(
      (a, b) => {

        return (
          Number(a.lower_limit || 0) -
          Number(b.lower_limit || 0)
        );

      }
    );

  /*
  -----------------------------------
  MATCH
  -----------------------------------
  */

  for (const slab of sortedSlabs) {

    const lower =
      Number(
        slab.lower_limit || 0
      );

    /*
    -----------------------------------
    IMPORTANT
    BLANK UPPER = INFINITY
    -----------------------------------
    */

    const upper =
      slab.upper_limit === null ||
      slab.upper_limit === '' ||
      slab.upper_limit === undefined

        ? Infinity

        : Number(
            slab.upper_limit
          );

    if (
      numericValue >= lower &&
      numericValue <= upper
    ) {

      return slab;

    }

  }

  /*
  -----------------------------------
  FALLBACK
  RETURN LAST SLAB
  -----------------------------------
  */

  if (sortedSlabs.length) {

    return sortedSlabs[
      sortedSlabs.length - 1
    ];

  }

  return null;
}