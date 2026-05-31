import type {
  IncidentDetailResponse,
  IncidentListResponse,
  IncidentTimelineResponse,
} from "@workspace/api-client-react";
import {
  mapIncidentDetailResponse,
  mapIncidentListResponse,
  mapIncidentTimelineResponse,
  type IncidentDetailViewModel,
  type IncidentListViewModel,
  type IncidentTimelineViewModel,
} from "@/lib/api/mappers/incidents";

function memoizeByReference<TInput extends object, TOutput>(
  mapper: (input: TInput) => TOutput,
): (input: TInput) => TOutput {
  const cache = new WeakMap<TInput, TOutput>();
  return (input: TInput): TOutput => {
    const cached = cache.get(input);
    if (cached) {
      return cached;
    }
    const computed = mapper(input);
    cache.set(input, computed);
    return computed;
  };
}

export const selectIncidentListViewModel: (data: IncidentListResponse) => IncidentListViewModel =
  memoizeByReference(mapIncidentListResponse);

export const selectIncidentDetailViewModel: (data: IncidentDetailResponse) => IncidentDetailViewModel =
  memoizeByReference(mapIncidentDetailResponse);

export const selectIncidentTimelineViewModel: (data: IncidentTimelineResponse) => IncidentTimelineViewModel =
  memoizeByReference(mapIncidentTimelineResponse);