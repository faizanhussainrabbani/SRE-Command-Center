import { useQueryClient } from "@tanstack/react-query";
import {
  getGetIncidentByIdQueryKey,
  useSubmitRemediationDecision,
} from "@workspace/api-client-react";

type UseRemediationDecisionOptions = {
  incidentId: string;
};

export function useRemediationDecision({ incidentId }: UseRemediationDecisionOptions) {
  const queryClient = useQueryClient();

  return useSubmitRemediationDecision({
    mutation: {
      onSuccess: () => {
        // Invalidate the incident detail query so the panel re-fetches
        // with the updated action status.
        void queryClient.invalidateQueries({
          queryKey: getGetIncidentByIdQueryKey(incidentId),
        });
      },
    },
  });
}
