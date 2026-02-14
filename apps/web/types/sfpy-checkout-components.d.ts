/**
 * Type declarations for @sfpy/checkout-components
 *
 * The @sfpy/checkout-components package does not ship with TypeScript type definitions.
 * This declaration file provides type safety for the Safepay checkout component integration.
 *
 * The package uses zoid (a cross-domain component library) to create framework-agnostic
 * components that can be rendered via React, Angular, Vue, or vanilla JavaScript drivers.
 *
 * @module @sfpy/checkout-components
 * @see {@link https://safepay-docs.netlify.app/} - Official Safepay documentation
 * @see {@link https://github.com/krakenjs/zoid} - Zoid library documentation
 */

declare module '@sfpy/checkout-components' {
  import type React from 'react';

  /**
   * Main Safepay checkout object providing component factories.
   */
  export interface SafepayCheckout {
    /**
     * Button component factory with framework driver support.
     *
     * Provides a branded Safepay payment button that opens an embedded checkout
     * iframe when clicked. The button appearance and behavior can be customized
     * via props.
     */
    Button: {
      /**
       * Creates a framework-specific driver for the Safepay button component.
       *
       * @param framework - The framework to create a driver for (currently only 'react' supported)
       * @param deps - Framework dependencies required by the driver
       * @returns A React component that can be used in your application
       *
       * @example
       * ```typescript
       * import safepay from '@sfpy/checkout-components';
       * import React from 'react';
       * import ReactDOM from 'react-dom';
       *
       * const SafepayButton = safepay.Button.driver('react', {
       *   React,
       *   ReactDOM,
       * });
       * ```
       */
      driver(
        framework: 'react',
        deps: {
          React: typeof import('react');
          ReactDOM: typeof import('react-dom');
        },
      ): React.ComponentType<SafepayButtonProps>;
    };
  }

  /**
   * Props for the SafepayButton React component.
   *
   * These props control the button appearance, payment configuration,
   * and callback behavior.
   */
  export interface SafepayButtonProps {
    /**
     * Safepay environment to use.
     *
     * - "sandbox": For testing and development
     * - "production": For live payments
     *
     * @example "sandbox"
     */
    env: string;

    /**
     * Public API keys mapped by environment.
     *
     * Each environment requires its corresponding public key (starts with "pub_").
     *
     * @example
     * ```typescript
     * {
     *   sandbox: "pub_xxx_sandbox_key",
     *   production: "pub_yyy_production_key"
     * }
     * ```
     */
    client: Record<string, string>;

    /**
     * Optional button styling configuration.
     *
     * Controls the visual appearance of the payment button.
     */
    style?: {
      /**
       * Color mode for the button.
       * - "light": Light theme
       * - "dark": Dark theme
       *
       * @default "light"
       */
      mode?: 'light' | 'dark';

      /**
       * Button size.
       * - "small": Compact button
       * - "medium": Standard button
       * - "large": Large button
       *
       * @default "medium"
       */
      size?: 'small' | 'medium' | 'large';

      /**
       * Button variant/style.
       * - "primary": Primary brand color
       * - "dark": Dark variant
       *
       * @default "primary"
       */
      variant?: 'primary' | 'dark';
    };

    /**
     * Optional order/reference ID.
     *
     * Used to track the payment against your internal order/consultation system.
     * This ID will be included in webhook callbacks and can be queried via the Safepay API.
     *
     * @example "CON-2026-0001"
     */
    orderId?: string;

    /**
     * Optional source identifier for analytics.
     *
     * Helps track where payments are originating from in your application.
     *
     * @example "consultation_booking"
     * @example "website"
     */
    source?: string;

    /**
     * Payment configuration.
     *
     * Defines the amount and currency for the payment.
     */
    payment: {
      /**
       * Currency code (ISO 4217).
       *
       * @example "PKR" - Pakistani Rupee
       * @example "USD" - US Dollar
       */
      currency: string;

      /**
       * Payment amount in major currency unit.
       *
       * For PKR, this is in rupees (e.g., 50000 = PKR 50,000).
       * The Safepay frontend component handles conversion to smallest unit internally.
       *
       * @example 50000 // PKR 50,000
       */
      amount: number;
    };

    /**
     * Callback fired when payment is successful.
     *
     * Receives payment data including tracker ID, reference, and full payment details.
     * This callback should update your application state and proceed to the next step.
     *
     * @param data - Payment success data
     * @param data.payment - Full payment object with tracker, reference, and metadata
     *
     * @example
     * ```typescript
     * onPayment={(data) => {
     *   console.log('Payment tracker:', data.payment.tracker);
     *   console.log('Payment reference:', data.payment.reference);
     *   savePaymentData(data.payment);
     *   proceedToNextStep();
     * }}
     * ```
     */
    onPayment?: (data: { payment: Record<string, unknown> }) => void;

    /**
     * Callback fired when user cancels the payment.
     *
     * This allows you to handle the cancellation gracefully, such as showing
     * an error message or allowing the user to retry.
     *
     * @example
     * ```typescript
     * onCancel={() => {
     *   toast.error('Payment cancelled. Please try again.');
     *   // Optionally reset payment state
     * }}
     * ```
     */
    onCancel?: () => void;
  }

  /**
   * Default export: SafepayCheckout object.
   */
  const safepay: SafepayCheckout;
  export default safepay;
}
