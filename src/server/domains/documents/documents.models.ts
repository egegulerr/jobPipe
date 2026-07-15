export { documentsStoragePolicy } from "@/lib/documents/documents-storage-policy";

export type UserDocumentSummary = {
  id: string;
  runId: string;
  runName: string | null;
  type: string;
  title: string;
  createdAt: string;
  jobTitle: string | null;
  companyName: string | null;
  applyUrl: string | null;
  jobLink: string | null;
};
