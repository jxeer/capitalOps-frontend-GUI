import { useState } from "react";
import { MapPin, Map as MapIcon, Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AssetLocation {
  address: string;
  lat: number;
  lng: number;
}

interface AssetLocationMapProps {
  initialLocation?: AssetLocation;
  onChange?: (location: AssetLocation) => void;
  readOnly?: boolean;
}

export function AssetLocationMap({ initialLocation, onChange, readOnly = false }: AssetLocationMapProps) {
  const [location, setLocation] = useState<AssetLocation | undefined>(initialLocation);
  const [addressInput, setAddressInput] = useState(initialLocation?.address || "");

  const handleSearch = () => {
    if (!addressInput.trim()) return;

    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}`;
    
    fetch(geocodeUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const newLocation = { address: addressInput, lat, lng };
          setLocation(newLocation);
          if (onChange) {
            onChange(newLocation);
          }
        }
      })
      .catch((err) => {
        console.error("Geocoding failed:", err);
      });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapIcon className="h-5 w-5" />
              Asset Location
            </h3>
            {!readOnly && (
              <Button size="sm" variant="outline" onClick={() => setLocation(undefined)}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {!readOnly && (
            <div className="flex gap-2">
              <Input
                placeholder="Search address (e.g. 123 Main St, Austin, TX)"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={!addressInput.trim()}>
                <MapPin className="h-4 w-4 mr-1" />
                Find
              </Button>
            </div>
          )}

          {location ? (
            <div className="space-y-3">
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{location.address}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      <span>Lat: {location.lat.toFixed(5)}</span>
                      <span>Lng: {location.lng.toFixed(5)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.openstreetmap.org/?lat=${location.lat}&lon=${location.lng}&zoom=15`}
                  title="Asset Location"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No location selected</p>
              {!readOnly && <p className="text-xs text-muted-foreground mt-2">Search an address to pin the asset location</p>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
