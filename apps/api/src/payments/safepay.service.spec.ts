import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SafepayService } from './safepay.service';

describe('SafepayService', () => {
  let service: SafepayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SafepayService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(''),
          },
        },
      ],
    }).compile();

    service = module.get<SafepayService>(SafepayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyWebhookSignature', () => {
    it('should return false when webhook secret is not configured', () => {
      expect(
        service.verifyWebhookSignature(
          Buffer.from('{"tracker":"track_xxx"}'),
          'sig',
        ),
      ).toBe(false);
    });
  });
});
