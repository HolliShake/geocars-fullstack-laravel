import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RouteKey } from '@/navigation/route';
import { api } from '@rest/axios';
import { CheckCircle2, LayoutGrid, Loader2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

export default function RenterCheckoutSuccessPage(): React.ReactNode {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [confirmState, setConfirmState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  useEffect(() => {
    if (!sessionId) {
      toast.message('Returned from checkout. If you finished paying, your rental should appear shortly.');
      return;
    }

    let cancelled = false;
    setConfirmState('loading');

    (async () => {
      try {
        await api.post('/api/Stripe/checkout/confirm', { session_id: sessionId });
        if (!cancelled) {
          setConfirmState('ok');
          toast.success('Payment recorded. Your rental application is on file.');
        }
      } catch (err: unknown) {
        if (cancelled) return;
        setConfirmState('error');
        const msg = isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined;
        toast.error(msg || 'Could not record payment. If you were charged, contact support with your session id.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-9 w-9 text-emerald-600 dark:text-emerald-400" aria-hidden />
          </div>
          <CardTitle className="text-2xl">Payment successful</CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {confirmState === 'loading' && sessionId ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving your payment to your account…
              </span>
            ) : (
              <>Thank you. Stripe has confirmed your payment for this rental application.</>
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {sessionId && (
            <div className="rounded-lg bg-muted/60 px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground mb-1">Checkout session</p>
              <p className="font-mono text-xs break-all">{sessionId}</p>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              className="w-full sm:w-auto"
              onClick={() => navigate(RouteKey.Renter.Browse.parse())}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Back to browse
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
