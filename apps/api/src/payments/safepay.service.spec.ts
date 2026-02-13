import { Test, TestingModule } from '@nestjs/testing';
import { SafepayService } from './safepay.service';

describe('SafepayService', () => {
  let service: SafepayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SafepayService],
    }).compile();

    service = module.get<SafepayService>(SafepayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('should return a checkout URL and token', async () => {
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
  });

  describe('createSubscriptionCheckout', () => {
    it('should return a checkout URL', async () => {
      const result = await service.createSubscriptionCheckout({
        planId: 'civic_retainer',
        reference: 'client-uuid',
        customerEmail: 'test@example.com',
        returnUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });

      expect(result.checkoutUrl).toContain('client-uuid');
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should return true (stub)', () => {
      expect(service.verifyWebhookSignature({}, 'sig')).toBe(true);
    });
  });

  describe('getPaymentStatus', () => {
    it('should return completed status (stub)', async () => {
      const result = await service.getPaymentStatus('tracker-123');
      expect(result.status).toBe('completed');
    });
  });

  describe('cancelSubscription', () => {
    it('should return success (stub)', async () => {
      const result = await service.cancelSubscription('sub-123');
      expect(result.success).toBe(true);
    });
  });
});
