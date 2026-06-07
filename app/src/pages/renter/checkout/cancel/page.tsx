import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RouteKey } from '@/navigation/route';
import { ArrowLeft, LayoutGrid, XCircle } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';

export default function RenterCheckoutCancelPage(): React.ReactNode {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postingId = searchParams.get('posting_id');

  useEffect(() => {
    toast.message('Checkout was cancelled. No charge was made.');
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
            <XCircle className="h-9 w-9 text-amber-600 dark:text-amber-400" aria-hidden />
          </div>
          <CardTitle className="text-2xl">Payment cancelled</CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You left Stripe Checkout before completing payment. Your application was not charged. You can return
            to the listing and try again when you are ready.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            {postingId ? (
              <Button
                variant="default"
                className="w-full sm:w-auto"
                onClick={() => navigate(RouteKey.Renter.Application.parse(postingId))}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to application
              </Button>
            ) : null}
            <Button
              variant={postingId ? 'outline' : 'default'}
              className="w-full sm:w-auto"
              onClick={() => navigate(RouteKey.Renter.Browse.parse())}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Browse cars
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
