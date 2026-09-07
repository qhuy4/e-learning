import { createLocationService } from "@fe/api/location";
import { api } from "@fe/lib/axios";

export const locationService = createLocationService(api);
