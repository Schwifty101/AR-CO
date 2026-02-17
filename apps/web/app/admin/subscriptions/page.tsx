'use client';

/**
 * Admin Subscriptions List Page
 *
 * Placeholder - subscription service removed.
 *
 * @module AdminSubscriptionsPage
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">
          Subscription management is currently unavailable
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            The subscription service has been removed. This page will be updated when the feature is reimplemented.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            No subscription data available
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
