'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = React.ComponentProps<typeof Button> & { loading?: boolean };

export function LoadingButton({
  loading,
  children,
  disabled,
  ...props
}: Props) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}