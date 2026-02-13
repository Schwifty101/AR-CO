/**
 * ServiceRegistrationsPaymentService Unit Tests
 *
 * Tests payment initiation flow:
 * - Creating Safepay checkout sessions
 * - Handling already-paid registrations
 * - Error handling for Safepay failures
 *
 * @module ServiceRegistrationsPaymentServiceSpec
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ServiceRegistrationsPaymentService } from './service-registrations-payment.service';
import { SupabaseService } from '../database/supabase.service';
import { SafepayService } from '../payments/safepay.service';
import { ServiceRegistrationPaymentStatus } from '@repo/shared';

describe('ServiceRegistrationsPaymentService', () => {
  let service: ServiceRegistrationsPaymentService;

  const mockAdminClient = {
    from: jest.fn(),
  };

  const mockSafepayService = {
    createCheckoutSession: jest.fn(),
  };

  const mockRegistrationRow = {
    id: 'registration-uuid-1',
    payment_status: ServiceRegistrationPaymentStatus.PENDING,
    services: { registration_fee: 50000 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceRegistrationsPaymentService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
        {
          provide: SafepayService,
          useValue: mockSafepayService,
        },
      ],
    }).compile();

    service = module.get<ServiceRegistrationsPaymentService>(
      ServiceRegistrationsPaymentService,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiatePayment', () => {
    it('should create checkout session and update tracker ID', async () => {
      // Mock fetch registration
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockRegistrationRow,
              error: null,
            }),
          }),
        }),
      });

      // Mock Safepay checkout creation
      mockSafepayService.createCheckoutSession.mockResolvedValue({
        checkoutUrl: 'https://sandbox.api.getsafepay.com/checkout/test',
        token: 'tracker_123456',
      });

      // Mock update tracker ID
      mockAdminClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      const result = await service.initiatePayment(
        'registration-uuid-1',
        'https://arco.pk/success',
        'https://arco.pk/cancel',
      );

      expect(mockSafepayService.createCheckoutSession).toHaveBeenCalledWith({
        amount: 50000,
        currency: 'PKR',
        orderId: 'registration-uuid-1',
        metadata: {
          type: 'service',
          referenceId: 'registration-uuid-1',
        },
        returnUrl: 'https://arco.pk/success',
        cancelUrl: 'https://arco.pk/cancel',
      });

      expect(result.checkoutUrl).toBe(
        'https://sandbox.api.getsafepay.com/checkout/test',
      );
      expect(result.registrationId).toBe('registration-uuid-1');
    });

    it('should throw NotFoundException when registration not found', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      await expect(
        service.initiatePayment(
          'non-existent-id',
          'https://arco.pk/success',
          'https://arco.pk/cancel',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when already paid', async () => {
      const paidRegistration = {
        ...mockRegistrationRow,
        payment_status: ServiceRegistrationPaymentStatus.PAID,
      };

      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: paidRegistration,
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.initiatePayment(
          'registration-uuid-1',
          'https://arco.pk/success',
          'https://arco.pk/cancel',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on Safepay failure', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockRegistrationRow,
              error: null,
            }),
          }),
        }),
      });

      mockSafepayService.createCheckoutSession.mockRejectedValue(
        new Error('Safepay error'),
      );

      await expect(
        service.initiatePayment(
          'registration-uuid-1',
          'https://arco.pk/success',
          'https://arco.pk/cancel',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
