import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { prisma } from '@/lib/prisma';
import { applyMonthlyDeduction, getRank } from '@/services/pointsCalculator';

const typeDefs = /* GraphQL */ `
  type LeaderboardEntry {
    rank: Int!
    displayName: String!
    points: Float!
    rankName: String!
  }

  type MatchRecord {
    id: ID!
    agent: String
    won: Boolean!
    kills: Int!
    deaths: Int!
    assists: Int!
    wasMvp: Boolean!
    wasTeamMvp: Boolean!
    aces: Int!
    pointsEarned: Float!
    matchPlayedAt: String!
  }

  type Query {
    leaderboard(limit: Int): [LeaderboardEntry!]!
  }
`;

const resolvers = {
  Query: {
    leaderboard: async (_: unknown, { limit = 20 }: { limit?: number }) => {
      const profiles = await prisma.userProfile.findMany();
      const allRecords = await prisma.matchRecord.findMany();
      const entries = [];

      for (const p of profiles) {
        const recs = allRecords.filter(
          (r) => r.userId === p.userId && r.puuid === p.puuid && r.matchPlayedAt >= p.linkedAt
        );
        const pts = applyMonthlyDeduction(recs.map((r) => ({ pointsEarned: r.pointsEarned, matchPlayedAt: r.matchPlayedAt })));
        const rank = getRank(pts);
        entries.push({ displayName: `${p.riotName}#${p.riotTag}`, points: pts, rankName: rank.name });
      }

      return entries
        .sort((a, b) => b.points - a.points)
        .slice(0, limit)
        .map((e, i) => ({ ...e, rank: i + 1 }));
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
const { handleRequest } = createYoga({ schema, graphqlEndpoint: '/api/graphql' });

export { handleRequest as GET, handleRequest as POST };
