/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Backend has no dedicated available-dates endpoint.
 * Previously this probed GET /business/available-times/ once per day
 * for ~60 days (N+1), which caused rate limits and invented green days.
 *
 * Calendar uses free date pick; slots load only for the chosen date+service.
 * When backend adds a real endpoint, implement it here.
 */
export const getAvailableDatesForService = async (
  _serviceId: number,
  _daysAhead = 60,
): Promise<string[]> => {
  return [];
};
