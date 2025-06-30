import { useQueryClient, useMutation } from "@tanstack/react-query";

import { SessionService } from "@/database/services/sessionService";
import { Session } from "@/validation/session";

export const sessionKeys = {
  sessions: () => ["sessions"] as const,
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (session: Session) => SessionService.createSession(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.sessions() });
    },
  });
};
