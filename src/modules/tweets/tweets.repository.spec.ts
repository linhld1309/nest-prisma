import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { TweetsRepository } from './tweets.repository';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe(`TweetsRepository`, () => {
  let tweetsRepository: TweetsRepository;
  let prismaService: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TweetsRepository, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    tweetsRepository = moduleRef.get(TweetsRepository);
    prismaService = moduleRef.get(PrismaService);
  });

  describe(`createTweet`, () => {
    it(`should create a new tweet`, async () => {
      // Arrange
      const mockedTweet = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        content: `Hello world, this is a tweets.`,
        userId: 1234,
      };
      prismaService.tweet.create.mockResolvedValue(mockedTweet);

      // Act
      const createTweet = () =>
        tweetsRepository.createTweet({
          data: {
            content: mockedTweet.content,
            user: {
              connect: {
                id: mockedTweet.userId,
              },
            },
          },
        });

      // Assert
      await expect(createTweet()).resolves.toBe(mockedTweet);
    });

    it(`should not be over 80 characters`, async () => {
      // Arrange
      const payload = {
        content: `This is a super long tweet over 80 characters`,
        userId: 1234,
      };

      // Act
      const createTweet = () =>
        tweetsRepository.createTweet({
          data: {
            content: payload.content,
            user: {
              connect: {
                id: payload.userId,
              },
            },
          },
        });

      // Assert
      await expect(createTweet()).rejects.toBeInstanceOf(Error);
    });
  });
});
