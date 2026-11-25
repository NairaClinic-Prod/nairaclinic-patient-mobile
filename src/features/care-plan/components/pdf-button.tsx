import { ActionButton } from '@/components/shared/action-button';
import { usePdfPending } from '@/lib/documents';
import type { ComponentProps } from 'react';

type PdfButtonProps = ComponentProps<typeof ActionButton> & { pdfKey: string };

// A download button that says "Preparing…" and ignores taps while its file is being made.
export function PdfButton({ pdfKey, label, disabled, ...props }: PdfButtonProps) {
  const pending = usePdfPending(pdfKey);
  return (
    <ActionButton
      {...props}
      label={pending ? 'Preparing…' : label}
      disabled={disabled || pending}
    />
  );
}
