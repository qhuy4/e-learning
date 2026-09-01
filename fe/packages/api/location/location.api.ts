import type { AxiosInstance } from "axios"
import type { City, Country } from "./location.type"

export function createLocationService(api: AxiosInstance) {
    return {
        async getCountries(): Promise<Country[]> {
            const response = await api.get<Country[]>(
                "/locations/countries",
            )

            return response.data.data
        },

        async getCities(
            countryCode: string,
        ): Promise<City[]> {
            const response = await api.get<City[]>(
                `/locations/cities/${countryCode}`,
            )

            return response.data.data
        },
    }
}