import { Test, TestingModule } from '@nestjs/testing';
import { FriendshipGateway } from './friendship.gateway';

describe('FriendshipGateway', () => {
  let gateway: FriendshipGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FriendshipGateway],
    }).compile();

    gateway = module.get<FriendshipGateway>(FriendshipGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should be able to handle login', async () => {
    const user = {
      userId: 1,
      email: 'user@example.com',
    };
    const data = {
      email: user.email,
    };
    const response = await gateway.handleLogin(null, data);
    expect(response).toBe(undefined);
  });

  it('should be able to handle friend request', async () => {
    const user1 = {
      userId: 1,
      email: 'user1@example.com',
    };
    const user2 = {
      userId: 2,
      email: 'user2@example.com',
    };
    const data = {
      user1: user1.email,
      user2: user2.email,
    };
    const response = await gateway.handleFriendRequest(null, data);
    expect(response).toBe(undefined);
  });

  it('should be able to handle accept friend request', async () => {
    const user1 = {
      userId: 1,
      email: 'user1@example.com',
    };
    const user2 = {
      userId: 2,
      email: 'user2@example.com',
    };
    const data = {
      user1: user1.email,
      user2: user2.email,
      isFriends: true,
    };
    const response = await gateway.handleAcceptFriendRequest(null, data);
    expect(response).toBe(undefined);
  });
});
