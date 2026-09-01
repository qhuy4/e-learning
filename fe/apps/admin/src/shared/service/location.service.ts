import {createLocationService} from "@fe/api/location";
import {api} from "@fe/lib/axios.ts";

export const locationService =
    createLocationService(api)