/**
 * AssetLocationMap Component
 * 
 * Purpose: Displays interactive map interface for asset/project locations.
 * Uses OpenStreetMap via Nominatim for geocoding (address to coordinates).
 * 
 * SECURITY: Geocoding requests go directly to Nominatim's public API.
 * Rate limiting may apply for heavy usage. Consider using a private geocoding
 * service in production for better reliability and privacy.
 */

import { useState } from "react";
import { MapPin, Map as MapIcon, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * AssetLocation type representing a geographic location with address and coordinates.
 */
interface AssetLocation {
  address: string;
  lat: number;
  lng: number;
}

/**
 * Props for the AssetLocationMap component.
 * 
 * @param initialLocation - Pre-populated location to display
 * @param onChange - Callback fired when user selects a new location
 * @param readOnly - If true, hides input controls (view-only mode)
 */
interface AssetLocationMapProps {
  initialLocation?: AssetLocation;
  onChange?: (location: AssetLocation) => void;
  readOnly?: boolean;
}

/**
 * AssetLocationMap Component
 * 
 * Renders a location picker/display card with:
 * - Address search using Nominatim geocoding API
 * - Coordinates display (latitude/longitude)
 * - Links to view location in OpenStreetMap and Google Maps
 * - Read-only mode for displaying locations without editing
 */
export function AssetLocationMap({ 
  initialLocation, 
  onChange, 
  readOnly = false 
}: AssetLocationMapProps) {
  // Current location state - initialized from props
  const [location, setLocation] = useState<AssetLocation | undefined>(initialLocation);
  
  // Address input text for search field
  const [addressInput, setAddressInput] = useState(initialLocation?.address || "");

  /**
   * Handle address search using Nominatim geocoding service.
   * 
   * Takes the addressInput string and queries Nominatim's search API
   * to convert it to latitude/longitude coordinates. On success,
   * updates local state and calls onChange callback.
   * 
   * NOTE: Nominatim is a free, public API with rate limits.
   * For production, consider a paid geocoding service.
   */
  const handleSearch = () => {
    // Don't search if input is empty
    if (!addressInput.trim()) return;

    // Build Nominatim search URL with address encoded for URL safety
    // Nominatim is OpenStreetMap's free geocoding service
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}`;

    // Fetch geocoding results from Nominatim
    fetch(geocodeUrl)
      .then((res) => res.json())
      .then((data) => {
        // Nominatim returns array of matches - take first result
        if (data && data.length > 0) {
          // Parse latitude and longitude from first result as floats
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          
          // Create location object with original address and coordinates
          const newLocation = { address: addressInput, lat, lng };
          
          // Update local state to reflect new location
          setLocation(newLocation);
          
          // Notify parent component of the change via callback
          if (onChange) {
            onChange(newLocation);
          }
        }
      })
      .catch((err) => {
        // Log geocoding errors to console for debugging
        // In production, this should be handled more gracefully
        console.error("Geocoding failed:", err);
      });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with title and clear button */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapIcon className="h-5 w-5" />
              Asset Location
            </h3>
            
            {/* Clear button to remove location - hidden in readOnly mode */}
            {!readOnly && (
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                onClick={() => setLocation(undefined)}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Search input - hidden in readOnly mode */}
          {!readOnly && (
            <div className="flex gap-2">
              <Input
                placeholder="Search address (e.g. 123 Main St, Austin, TX)"
                value={addressInput}
                // Update local state as user types
                onChange={(e) => setAddressInput(e.target.value)}
                // Allow pressing Enter to trigger search
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleSearch} 
                disabled={!addressInput.trim()}
              >
                <MapPin className="h-4 w-4 mr-1" />
                Find
              </Button>
            </div>
          )}

          {/* Location display or empty state */}
          {location && typeof location === 'object' && 'address' in location ? (
            // === LOCATION DISPLAY MODE ===
            <div className="space-y-3">
              {/* Location details card */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    {/* Display the full address */}
                    <p className="text-sm font-medium truncate">{String(location.address)}</p>
                    {/* Display coordinates with 5 decimal places */}
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      <span>Lat: {Number(location.lat).toFixed(5)}</span>
                      <span>Lng: {Number(location.lng).toFixed(5)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map preview placeholder with links */}
              {/* Note: Actual map rendering would require Leaflet integration */}
              <div 
                className="aspect-video w-full bg-muted rounded-lg overflow-hidden relative flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHN0cm9rZSB3aWR0aD0iMSIgc3Ryb2tlPSIjMDAwIiB4YXNjYWdlPSIxMCIgc2hhcGU9InJvdW5kIi8+PHN0cm9rZSB3aWR0aD0iMSIgc3Ryb2tlPSIjMDAwIiB4YXNjYWdlPSIxMCIgeD0iNTAlIiB5PSI1MCUiLz48c3Ryb2tlIHdpZHRoPSIxIiBzdHJva2U9IiMwMDAiIHhhc2FnZT0iMTAiIHg9IjUwJSIgeT0iNTAlIi8+PC9zdmc+')]"
              >
                {/* Centered location indicator */}
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-chart-2 mx-auto mb-2" />
                  <p className="text-sm font-medium">{String(location.address)}</p>
                  {/* Show coordinates below address */}
                  <p className="text-xs text-muted-foreground mt-1">
                    {Number(location.lat).toFixed(5)}, {Number(location.lng).toFixed(5)}
                  </p>
                </div>
              </div>

              {/* External map links */}
              <div className="flex gap-2">
                {/* OpenStreetMap link - uses osm.org with lat/lng params */}
                <a
                  href={`https://www.openstreetmap.org/?mlon=${Number(location.lng)}&mlat=${Number(location.lat)}&zoom=15`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-chart-2 hover:underline flex items-center gap-1"
                >
                  <MapPin className="h-3 w-3" />
                  OpenStreetMap
                </a>
                {/* Google Maps link - uses lat/lng query format */}
                <a
                  href={`https://www.google.com/maps?q=${Number(location.lat)},${Number(location.lng)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-chart-2 hover:underline flex items-center gap-1"
                >
                  <MapIcon className="h-3 w-3" />
                  Google Maps
                </a>
              </div>
            </div>
          ) : (
            // === EMPTY STATE ===
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No location selected</p>
              {/* Hint text - hidden in readOnly mode */}
              {!readOnly && (
                <p className="text-xs text-muted-foreground mt-2">
                  Search an address to pin the asset location
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
