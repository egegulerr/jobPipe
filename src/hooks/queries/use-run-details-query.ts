"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/api/http-client";
import { ACTIVE_RUN_STATUSES } from "@/lib/runs/active-run-statuses";
import {
  MANUAL_DOCUMENT_POLL_INTERVAL_MS,
  MANUAL_DOCUMENT_TIMEOUT_CHECK_INTERVAL_MS,
  countOtherAwaitingManualDocumentJobs,
  pruneAwaitingManualDocumentJobs,
  resolveActiveAwaitingManualDocumentJobs,
  shouldPollRunDetailsForManualDocuments,
} from "@/lib/runs/manual-document-generation";
import { queryKeys } from "@/lib/query/query-keys";
import type { RunDetailsDocumentDto, RunDetailsResponseDto } from "@/types/output/runs.dto";

const ACTIVE_RUN_POLL_INTERVAL_MS = 5_000;
const EMPTY_DOCUMENTS: RunDetailsDocumentDto[] = [];

export type UseRunDetailsQueryOptions = {
  initialData?: RunDetailsResponseDto;
};

export function useRunDetailsQuery(runId: string, options: UseRunDetailsQueryOptions = {}) {
  const { initialData } = options;
  const [awaitingByJobId, setAwaitingByJobId] = useState<Map<string, number>>(() => new Map());
  const [, setTimeoutTick] = useState(0);

  const trackManualDocumentGeneration = useCallback((jobId: string) => {
    setAwaitingByJobId((current) => {
      const next = new Map(current);
      next.set(jobId, Date.now());
      return next;
    });
  }, []);

  const query = useQuery({
    queryKey: queryKeys.runs.details(runId),
    queryFn: () => fetchJson<RunDetailsResponseDto>(`/api/runs/${runId}`),
    initialData,
    refetchOnMount: "always",
    refetchInterval: (queryState) => {
      const data = queryState.state.data;
      if (!data) {
        return false;
      }

      if (ACTIVE_RUN_STATUSES.has(data.run.status)) {
        return ACTIVE_RUN_POLL_INTERVAL_MS;
      }

      if (shouldPollRunDetailsForManualDocuments(awaitingByJobId, data.documents)) {
        return MANUAL_DOCUMENT_POLL_INTERVAL_MS;
      }

      return false;
    },
  });

  const resolvedDocuments = query.data?.documents ?? initialData?.documents ?? EMPTY_DOCUMENTS;
  const documentsRef = useRef(resolvedDocuments);

  useEffect(() => {
    documentsRef.current = resolvedDocuments;
  }, [resolvedDocuments]);

  const activeAwaitingByJobId = resolveActiveAwaitingManualDocumentJobs(awaitingByJobId, resolvedDocuments);

  const isJobAwaitingManualDocuments = useCallback(
    (jobId: string | undefined) => {
      if (!jobId) {
        return false;
      }

      return activeAwaitingByJobId.has(jobId);
    },
    [activeAwaitingByJobId],
  );

  const countOtherAwaitingJobs = useCallback(
    (selectedJobId: string | undefined) => countOtherAwaitingManualDocumentJobs(activeAwaitingByJobId, selectedJobId),
    [activeAwaitingByJobId],
  );

  useEffect(() => {
    if (awaitingByJobId.size === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimeoutTick((value) => value + 1);
      setAwaitingByJobId((current) => pruneAwaitingManualDocumentJobs(current, documentsRef.current) ?? current);
    }, MANUAL_DOCUMENT_TIMEOUT_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [awaitingByJobId.size]);

  return {
    ...query,
    trackManualDocumentGeneration,
    isJobAwaitingManualDocuments,
    countOtherAwaitingManualDocumentJobs: countOtherAwaitingJobs,
    awaitingManualDocumentJobCount: activeAwaitingByJobId.size,
  };
}
