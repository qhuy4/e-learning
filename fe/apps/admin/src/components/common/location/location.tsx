import { useEffect, useState } from "react"
import type { City, Country } from "@fe/api/location"

import { locationService } from "@/shared/service/location.service.ts"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@fe/components/ui/select.tsx"

export function LocationForm() {
    const [countries, setCountries] = useState<Country[]>([])
    const [cities, setCities] = useState<City[]>([])
    const [countryCode, setCountryCode] = useState("")

    useEffect(() => {
        locationService
            .getCountries()
            .then(setCountries)
            .catch(console.error)
    }, [])

    useEffect(() => {
        if (!countryCode) {
            setCities([])
            return
        }

        locationService
            .getCities(countryCode)
            .then(setCities)
            .catch(console.error)
    }, [countryCode])

    return (
        <div className="space-y-4">
            {/* Country */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Country
                </label>

                <Select
                    value={countryCode}
                    onValueChange={setCountryCode}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                    </SelectTrigger>

                    <SelectContent>
                        {countries.map((country) => (
                            <SelectItem
                                key={country.id}
                                value={country.code}
                            >
                                {country.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* City */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    City
                </label>

                <Select disabled={!countryCode}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                    </SelectTrigger>

                    <SelectContent>
                        {cities.map((city) => (
                            <SelectItem
                                key={city.id}
                                value={String(city.id)}
                            >
                                {city.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}