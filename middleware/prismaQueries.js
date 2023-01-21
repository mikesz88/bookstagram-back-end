const filteredResults = async (req) => {
  const reqQuery = { ...req.query };
  const filteredQuery = Object.keys(reqQuery).reduce((acc, cur) => {
    let prismaFormatted = {};
    prismaFormatted['take'] = acc['take'] ? acc['take'] : 25;
    prismaFormatted['skip'] = acc['skip'] ? acc['skip'] : 0;
    if (cur === 'limit') {
      prismaFormatted['take'] = +reqQuery[cur];
    }
    if (cur === 'page') {
      prismaFormatted['skip'] =
        (+reqQuery[cur] - 1) * +(prismaFormatted['limit'] || 25);
    }
    if (cur === 'select') {
      const selectBy = reqQuery[cur].split(',').reduce((original, current) => {
        if (!Object.keys(original).length) {
          return { [current]: true };
        }
        return { ...original, [current]: true };
      }, {});
      prismaFormatted[cur] = selectBy;
    }
    if (cur === 'sort') {
      const sortBy = reqQuery[cur].split(',');
      prismaFormatted['orderBy'] = {
        [sortBy[0]]: sortBy[1],
      };
    } else {
      prismaFormatted['orderBy'] = {
        createdAt: 'asc',
      };
    }
    if (
      cur === 'id' ||
      cur === 'title' ||
      cur === 'photoUrl' ||
      cur === 's3Key' ||
      cur === 'slug' ||
      cur === 'userId'
    ) {
      prismaFormatted['where'] = {
        ...acc['where'],
        [cur]: reqQuery[cur],
      };
    }
    if (!Object.keys(acc).length) {
      return prismaFormatted;
    }
    return { ...acc, ...prismaFormatted };
  }, {});

  return filteredQuery;
};

module.exports = filteredResults;
