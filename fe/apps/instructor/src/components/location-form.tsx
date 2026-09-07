import { useEffect, useState } from "react";
import type { City, Country } from "@fe/api/location";
import { locationService } from "@/shared/service/location.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";

interface LocationFormProps {
  country: string;
  city: string;
  onCountryChange: (value: string) => void;
  onCityChange: (value: string) => void;
}

export function LocationForm({
  country,
  city,
  onCountryChange,
  onCityChange,
}: LocationFormProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    locationService.getCountries().then(setCountries).catch(console.error);
  }, []);

  useEffect(() => {
    if (!country) {
      setCities([]);
      return;
    }
    locationService.getCities(country).then(setCities).catch(console.error);
  }, [country]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Quốc gia</label>
        <Select value={country} onValueChange={(v) => v && onCountryChange(v)}>
          <SelectTrigger className="w-full" >
            <SelectValue placeholder="Chọn quốc gia" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.id} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Thành phố</label>
        <Select value={city} onValueChange={(v) => v && onCityChange(v)} disabled={!country}>
          <SelectTrigger className="w-full" >
            <SelectValue placeholder="Chọn thành phố" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
