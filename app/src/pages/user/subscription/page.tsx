/* eslint-disable react-hooks/exhaustive-deps */
import PageLayout from '@/components/layout/page.layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useCancelSubscription,
  useConfirmRenewal,
  useConfirmSubscription,
  useGetMySubscription,
  useGetSubscriptionPlans,
  useRenewSubscription,
  useSubscribe,
  type SubscriptionPlan,
  type SubscriptionTransaction,
  type UserSubscription,
} from '@rest/user-subscription.custom';
import {
  LucideAlertCircle,
  LucideCheckCircle,
  LucideCreditCard,
  LucideRefreshCw,
  LucideXCircle,
} from 'lucide-react';
import React, { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-600 hover:bg-green-600 text-white gap-1">
          <LucideCheckCircle className="h-3 w-3" /> Active
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="destructive" className="gap-1">
          <LucideXCircle className="h-3 w-3" /> Cancelled
        </Badge>
      );
    default:
      return <Badge variant="secondary">Inactive</Badge>;
  }
}

function transactionTypeBadge(type: string) {
  switch (type) {
    case 'payment':
      return <Badge className="bg-blue-600 hover:bg-blue-600 text-white">Payment</Badge>;
    case 'renewal':
      return <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white">Renewal</Badge>;
    case 'refund':
      return <Badge className="bg-orange-500 hover:bg-orange-500 text-white">Refund</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  onSubscribe: (planId: number) => void;
  isLoading: boolean;
}

function PlanCard({ plan, isCurrentPlan, onSubscribe, isLoading }: PlanCardProps) {
  return (
    <Card className={isCurrentPlan ? 'border-primary border-2' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {plan.name}
          {isCurrentPlan && (
            <Badge className="bg-primary text-primary-foreground text-xs">Current Plan</Badge>
          )}
        </CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">
          ₱{Number(plan.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          <span className="text-sm font-normal text-muted-foreground"> / 30 days</span>
        </p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={isCurrentPlan || isLoading}
          onClick={() => onSubscribe(plan.id)}
        >
          <LucideCreditCard className="h-4 w-4 mr-2" />
          {isCurrentPlan ? 'Subscribed' : 'Subscribe'}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Active Subscription Card ─────────────────────────────────────────────────

interface ActiveSubscriptionCardProps {
  subscription: UserSubscription;
  onRenew: () => void;
  onCancel: () => void;
  isRenewing: boolean;
  isCancelling: boolean;
}

function ActiveSubscriptionCard({
  subscription,
  onRenew,
  onCancel,
  isRenewing,
  isCancelling,
}: ActiveSubscriptionCardProps) {
  const expiresAt = subscription.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>My Subscription</span>
          {statusBadge(subscription.status)}
        </CardTitle>
        <CardDescription>
          Plan: <strong>{subscription.plan?.name}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Price</span>
          <span className="font-medium">
            ₱
            {Number(subscription.plan?.price ?? 0).toLocaleString('en-PH', {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Expires</span>
          <span className="font-medium">{expiresAt}</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        {subscription.status !== 'cancelled' && (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onRenew}
              disabled={isRenewing || isCancelling}
            >
              <LucideRefreshCw className="h-4 w-4 mr-2" />
              {isRenewing ? 'Redirecting…' : 'Renew'}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={onCancel}
              disabled={isCancelling || isRenewing}
            >
              <LucideXCircle className="h-4 w-4 mr-2" />
              {isCancelling ? 'Cancelling…' : 'Cancel'}
            </Button>
          </>
        )}
        {subscription.status === 'cancelled' && (
          <p className="text-sm text-muted-foreground w-full text-center">
            <LucideAlertCircle className="inline h-4 w-4 mr-1 text-orange-500" />
            Subscription cancelled. You may subscribe to a new plan below.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

// ─── Transactions Table ───────────────────────────────────────────────────────

function TransactionTable({ transactions }: { transactions: SubscriptionTransaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>{tx.id}</TableCell>
            <TableCell>{transactionTypeBadge(tx.type)}</TableCell>
            <TableCell className="text-right font-medium">
              ₱{Number(tx.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {new Date(tx.created_at).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserSubscriptionPage(): React.ReactElement {
  const origin = window.location.origin;
  const successUrl = `${origin}/user/subscription?status=success`;
  const cancelUrl = `${origin}/user/subscription`;

  const {
    data: subscriptionData,
    isPending: isSubscriptionLoading,
    refetch: refetchSubscription,
  } = useGetMySubscription({
    query: { retry: false },
  });

  const { data: plansData, isPending: isPlansLoading } = useGetSubscriptionPlans();

  const { mutateAsync: subscribeAsync, isPending: isSubscribing } = useSubscribe();
  const { mutateAsync: renewAsync, isPending: isRenewing } = useRenewSubscription();
  const { mutateAsync: cancelAsync, isPending: isCancelling } = useCancelSubscription();
  const { mutateAsync: confirmAsync } = useConfirmSubscription();
  const { mutateAsync: confirmRenewalAsync } = useConfirmRenewal();

  // Handle post-checkout redirect confirmation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const sessionId = params.get('session_id');
    const subscriptionId = params.get('subscription_id');
    const action = params.get('action');

    if (status !== 'success' || !sessionId || !subscriptionId) return;

    // Clean URL
    window.history.replaceState({}, '', '/user/subscription');

    const id = Number(subscriptionId);

    if (action === 'renew') {
      confirmRenewalAsync({ id, session_id: sessionId })
        .then(() => {
          toast.success('Subscription renewed successfully!');
          refetchSubscription();
        })
        .catch(() => toast.error('Could not confirm renewal. Please contact support.'));
    } else {
      confirmAsync({ session_id: sessionId, subscription_id: id })
        .then(() => {
          toast.success('Subscription activated successfully!');
          refetchSubscription();
        })
        .catch(() => toast.error('Could not confirm payment. Please contact support.'));
    }
  }, []);

  const subscription = subscriptionData?.data ?? null;
  const plans = plansData?.data ?? [];

  const handleSubscribe = useCallback(
    async (planId: number) => {
      try {
        const res = await subscribeAsync({
          plan_id: planId,
          success_url: successUrl,
          cancel_url: cancelUrl,
        });
        if (res.data.activated) {
          toast.success('Subscription activated (free plan)!');
          refetchSubscription();
          return;
        }
        if (res.data.checkout_url) {
          window.location.href = res.data.checkout_url;
        }
      } catch {
        toast.error('Could not initiate checkout. Please try again.');
      }
    },
    [subscribeAsync, successUrl, cancelUrl, refetchSubscription]
  );

  const handleRenew = useCallback(async () => {
    if (!subscription) return;
    try {
      const res = await renewAsync({
        id: subscription.id,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      if (res.data.activated) {
        toast.success('Subscription renewed (free plan)!');
        refetchSubscription();
        return;
      }
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch {
      toast.error('Could not initiate renewal. Please try again.');
    }
  }, [subscription, renewAsync, successUrl, cancelUrl, refetchSubscription]);

  const handleCancel = useCallback(async () => {
    if (!subscription) return;
    try {
      await cancelAsync(subscription.id);
      toast.success('Subscription cancelled.');
      refetchSubscription();
    } catch {
      toast.error('Could not cancel subscription. Please try again.');
    }
  }, [subscription, cancelAsync, refetchSubscription]);

  const transactions = subscription?.transactions ?? [];

  return (
    <PageLayout title="Subscription">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* ── Current Subscription ───────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Current Subscription</h2>
          {isSubscriptionLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : subscription ? (
            <ActiveSubscriptionCard
              subscription={subscription}
              onRenew={handleRenew}
              onCancel={handleCancel}
              isRenewing={isRenewing}
              isCancelling={isCancelling}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <LucideAlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                <p>You don't have an active subscription yet.</p>
                <p className="text-sm mt-1">Choose a plan below to get started.</p>
              </CardContent>
            </Card>
          )}
        </section>

        <Separator />

        {/* ── Transactions ────────────────────────────────────────────────── */}
        {subscription && (
          <>
            <section>
              <h2 className="text-lg font-semibold mb-3">Transaction History</h2>
              <Card>
                <CardContent className="pt-4">
                  <TransactionTable transactions={transactions} />
                </CardContent>
              </Card>
            </section>

            <Separator />
          </>
        )}

        {/* ── Available Plans ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Available Plans</h2>
          {isPlansLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-52 rounded-xl" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <p className="text-muted-foreground text-sm">No plans available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={
                    subscription?.plan_id === plan.id && subscription?.status === 'active'
                  }
                  onSubscribe={handleSubscribe}
                  isLoading={isSubscribing}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
