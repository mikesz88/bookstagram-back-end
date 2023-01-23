const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const prismaQueries = async (req, model) => {
  const reqQuery = { ...req.query };
  reqQuery['limit'] = reqQuery['limit'] ? reqQuery['limit'] : 25;
  reqQuery['page'] = reqQuery['page'] ? reqQuery['page'] : 0;
  const filter = Object.keys(reqQuery).reduce((acc, cur) => {
    let prismaFormatted = {};
    prismaFormatted['take'] = acc['take'] ? acc['take'] : 25;
    prismaFormatted['skip'] = acc['skip'] ? acc['skip'] : 0;
    if (cur === 'limit') {
      prismaFormatted['take'] = +reqQuery[cur];
    }
    if (cur === 'page') {
      if (+reqQuery[cur] < 1) {
        prismaFormatted['skip'] = acc['skip'] ? acc['skip'] : 0;
      } else {
        prismaFormatted['skip'] =
          (+reqQuery[cur] - 1) * +(prismaFormatted['take'] || 25);
      }
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
    if (!Object.keys(acc).length) {
      return prismaFormatted;
    }
    return { ...acc, ...prismaFormatted };
  }, {});

  const count = await prisma[model].count({ where: filter.where });
  const data = await prisma[model].findMany(filter);
  const page = +reqQuery['page'] >= 1 ? +reqQuery['page'] : 1;

  const startIndex = (page - 1) * filter.take;
  const endIndex = page * filter.take;
  const pagination = {
    page,
    limit: filter.take,
  };
  if (endIndex < count) {
    pagination.next = { page: page + 1, limit: filter.take };
  }

  if (startIndex > 0) {
    pagination.previous = { page: page - 1, limit: filter.take };
  }

  return { count, pagination, data };
};

module.exports = prismaQueries;
