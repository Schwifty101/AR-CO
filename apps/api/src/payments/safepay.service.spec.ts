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

  describe('legacy stubs', () => {
    it('createCheckoutSession should return a checkout URL and token', async () => {
      const result = await service.createCheckoutSession({
        amount: 50000,
        currency: 'PKR',
        orderId: 'test-order-123',
        metadata: { type: 'service', referenceId: 'ref-123' },
        returnUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });

      expect(result.checkoutUrl).toContain('test-order-123');
      expect(result.token).toContain('tracker_stub_');
    });

    it('createSubscriptionCheckout should return a checkout URL', async () => {
      const result = await service.createSubscriptionCheckout({
        planId: 'civic_retainer',
        reference: 'client-uuid',
        customerEmail: 'test@example.com',
        returnUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });

      expect(result.checkoutUrl).toContain('client-uuid');
    });

    it('getPaymentStatus should return completed status', async () => {
      const result = await service.getPaymentStatus('tracker-123');
      expect(result.status).toBe('completed');
    });

    it('cancelSubscription should return success', async () => {
      const result = await service.cancelSubscription('sub-123');
      expect(result.success).toBe(true);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should return false when webhook secret is not configured', () => {
      expect(service.verifyWebhookSignature({ tracker: 'track_xxx' }, 'sig')).toBe(false);
    });
  });
});
