import { AttachedResultsSheet } from './attached-results-sheet';
import { LabLinkSheet } from './lab-link-sheet';
import { UploadResultsSheet } from './upload-results-sheet';

// The sheets behind the Upload, View result and Lab upload link buttons. Mount once next to the care plan.
export function CarePlanSheets() {
  return (
    <>
      <UploadResultsSheet />
      <AttachedResultsSheet />
      <LabLinkSheet />
    </>
  );
}
