"use client";

import { useState, useCallback, useEffect } from 'react';
import Map, { Marker, Popup, MapRef } from 'react-map-gl';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MapPin, Users, TrendingUp, Award } from 'lucide-react';
import { AnimatedStat } from './animated-stat';
import { LOCATIONS, GLOBAL_STATS, MAP_STYLE, INITIAL_VIEWPORT } from './constants';
import type { Location, MapViewport } from './types';
import { useMap } from './map-context';

export function GlobalPresenceMap() {
  const router = useRouter();
  const { setMap } = useMap();
  const [mapRef, setMapRef] = useState<MapRef | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [viewport, setViewport] = useState<MapViewport>(INITIAL_VIEWPORT);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setMapError('Mapbox token is missing. Please check your environment configuration.');
    }
    
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (mapRef) {
        mapRef.getMap().remove();
      }
    };
  }, [mapRef]);

  const handleMapLoad = useCallback((event: any) => {
    setMapRef(event.target);
    setMap(event.target.getMap());
    setIsLoading(false);
  }, [setMap]);

  const handleMarkerClick = useCallback((location: Location) => {
    setSelectedLocation(location);
    
    mapRef?.flyTo({
      center: location.coordinates,
      zoom: viewport.zoom + 1,
      duration: 1500,
      essential: true // This animation will play even when reduce motion is enabled
    });
  }, [mapRef, viewport.zoom]);

  if (mapError) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-muted rounded-lg">
        <p className="text-destructive">{mapError}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-muted rounded-lg">
        <div className="animate-pulse text-primary">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] relative rounded-lg overflow-hidden">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        onLoad={handleMapLoad}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        maxZoom={INITIAL_VIEWPORT.maxZoom}
        minZoom={INITIAL_VIEWPORT.minZoom}
        attributionControl={true}
        reuseMaps
        renderWorldCopies={true}
      >
        <AnimatePresence>
          {LOCATIONS.map((location, index) => (
            <Marker
              key={location.id}
              latitude={location.coordinates[1]}
              longitude={location.coordinates[0]}
              anchor="bottom"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleMarkerClick(location)}
                className="cursor-pointer transform-gpu hover:scale-110 transition-transform"
                aria-label={`${location.city} office marker`}
              >
                <MapPin className="h-8 w-8 text-primary" />
              </motion.div>
            </Marker>
          ))}

          {selectedLocation && (
            <Popup
              latitude={selectedLocation.coordinates[1]}
              longitude={selectedLocation.coordinates[0]}
              onClose={() => setSelectedLocation(null)}
              closeButton={true}
              closeOnClick={false}
              className="w-80"
              maxWidth="320px"
            >
              <Card className="border-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedLocation.city}, {selectedLocation.country}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedLocation.type}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm">{selectedLocation.impact.clients} Clients</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm">{selectedLocation.impact.revenue}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        Success Story
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedLocation.successStories[0].title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedLocation.successStories[0].metrics}
                      </p>
                    </div>

                    <Button 
                      className="w-full"
                      onClick={() => router.push('/contact')}
                    >
                      Contact This Office
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Popup>
          )}
        </AnimatePresence>
      </Map>

      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(GLOBAL_STATS).map(([key, value], index) => (
          <AnimatedStat
            key={key}
            label={key}
            value={value}
            delay={index * 0.1}
          />
        ))}
      </div>
    </div>
  );
}