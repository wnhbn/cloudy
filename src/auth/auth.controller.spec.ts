import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let res: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    res = new Response();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be able to get auth page', async () => {
    const response = await controller.auth();
    expect(response).toEqual({
      isAuthPage: true,
    });
  });

  it('should be able to register user', async () => {
    const user = {
      id: 1,
      email: 'user@example.com',
      password: 'password',
      fullName: 'John Doe',
    };
    const response = await controller.register(user, res);
    expect(response).toEqual({
      success: true,
    });
  });

  it('should be able to login user', async () => {
    const user = {
      id: 1,
      email: 'user@example.com',
      password: 'password',
      fullName: 'John Doe',
    };
    const response = await controller.login(user, res);
    expect(response).toEqual({
      success: true,
    });
  });
});
