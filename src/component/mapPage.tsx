import {
  Map,
  AdvancedMarker,
  Pin,
  MapMouseEvent,
  useMap,
  useMapsLibrary,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type {Marker} from '@googlemaps/markerclusterer';
import { useState, useEffect, useRef } from "react";
import SearchBox from "./searchbox";

export const MapPage = () => {
  const center = {
    lat: 13.78,
    lng: 100.56,
  };

  const map = useMap();
  const placesLib = useMapsLibrary("places");

  const [autoComplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete>();
  const placeAutoCompleteRef = useRef<HTMLInputElement>(null);
  const [selectedPlaces, setSelectedPlaces] = useState<
    google.maps.places.PlaceResult[]
  >([]);

  {
    /* keep pin array */
  }
  const [morePin, setMorePin] = useState<google.maps.LatLngLiteral[]>([]);
  {
    /* current position of user */
  }
  const [currentPosition, setCurrentPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  {
    /* temporary pin from search */
  }
  const [searchPin, setSearchPin] = useState<google.maps.LatLngLiteral | null>(
    null
  );
  const [IsopenInfoWindow, setOpenInfoWindow] = useState(true);
  const [isSearch, setIsSearch] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();

  type Poi = { key: string; location: google.maps.LatLngLiteral };
  const locations: Poi[] = [
    { key: "operaHouse", location: { lat: -33.8567844, lng: 151.213108 } },
    { key: "tarongaZoo", location: { lat: -33.8472767, lng: 151.2188164 } },
    { key: "manlyBeach", location: { lat: -33.8209738, lng: 151.2563253 } },
    { key: "hyderPark", location: { lat: -33.8690081, lng: 151.2052393 } },
    { key: "theRocks", location: { lat: -33.8587568, lng: 151.2058246 } },
    { key: "circularQuay", location: { lat: -33.858761, lng: 151.2055688 } },
    { key: "harbourBridge", location: { lat: -33.852228, lng: 151.2038374 } },
    { key: "kingsCross", location: { lat: -33.8737375, lng: 151.222569 } },
    { key: "botanicGardens", location: { lat: -33.864167, lng: 151.216387 } },
    { key: "museumOfSydney", location: { lat: -33.8636005, lng: 151.2092542 } },
    { key: "maritimeMuseum", location: { lat: -33.869395, lng: 151.198648 } },
    { key: "kingStreetWharf", location: { lat: -33.8665445, lng: 151.1989808 },},
    { key: "aquarium", location: { lat: -33.869627, lng: 151.202146 } },
    { key: "darlingHarbour", location: { lat: -33.87488, lng: 151.1987113 } },
    { key: "barangaroo", location: { lat: -33.8605523, lng: 151.1972205 } },
  ];

  //   const handleopenWindow = () => {
  //     setOpenInfoWindow(!IsopenInfoWindow);
  //     console.log(IsopenInfoWindow)
  //   };

  {
    /* Searchbox from autoComplete */
  }
  useEffect(() => {
    if (!placesLib || !map) return;
    setAutocomplete(
      new placesLib.Autocomplete(
        placeAutoCompleteRef.current as HTMLInputElement
        // { componentRestrictions: { country: ['th'] }, }
      )
    );
  }, [placesLib, map]);

  {
    /* show pin from search */
  }
  useEffect(() => {
    if (!autoComplete || !map) {
      return;
    } else {
      autoComplete.addListener("place_changed", () => {
        const place = autoComplete.getPlace();
        const pos = place.geometry?.location;

        if (pos) {
          setSelectedPlaces([...selectedPlaces, place]);
          map?.panTo(pos); // Use panTo to smoothly move the map to the current position
          map?.setZoom(18); // Optionally, set a zoom level
          //   console.log(pos.lat(), pos.lng());
          setSearchPin({ lat: pos.lat(), lng: pos.lng() });
        }
        setIsSearch(true);
        setOpenInfoWindow(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoComplete]);

  {
    /* Track current Location of user */
  }
  useEffect(() => {
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentPosition(pos);
            map?.panTo(pos); // Use panTo to smoothly move the map to the current position
            map?.setZoom(15);
          },
          (error) => {
            console.error('Error watching position: ', error);
          },
          {
            enableHighAccuracy: true, // Use high accuracy for better position tracking
            maximumAge: 0, // Disable caching of location data
            timeout: 5000, // Timeout for each position request
          }
        );
        // Clean up the watcher on component unmount
        return () => {
          navigator.geolocation.clearWatch(watchId);
        };
      }
    }, [map]);

  {
    /* Go to current location */
  }
  const handlePanToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPosition(pos);
          map?.panTo(pos); // Use panTo to smoothly move the map to the current position
          map?.setZoom(15); // Optionally, set a zoom level
          console.log("check");
        },
        () => {
          console.log("Navigator not allow to get location");
        }
      );
    }
  };

  useEffect(() => {
    handlePanToCurrentLocation();
  }, []);

  {
    /* Add pin OnClick */
  }
  const onClickMap = (e: MapMouseEvent) => {
    const newPos = e.detail.latLng;
    if (newPos != null) {
      // console.log(newPos);
      setMorePin([...morePin, newPos]); // correctly update state with new pin
    }
  };

  const handleAddToPath = () => {
    if (searchPin) {
      setMorePin([...morePin, searchPin]);
      setOpenInfoWindow(false);
    }
  };

  const PoiMarkers = (props: { pois: Poi[] }) => {
    const map = useMap();
    const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
    const clusterer = useRef<MarkerClusterer | null>(null);

    // Initialize MarkerClusterer, if the map has changed
    useEffect(() => {
      if (!map) return;
      if (!clusterer.current) {
        clusterer.current = new MarkerClusterer({ map });
      }
    }, [map]);

    // Update markers, if the markers array has changed
    useEffect(() => {
      clusterer.current?.clearMarkers();
      clusterer.current?.addMarkers(Object.values(markers));
    }, [markers]);

    const setMarkerRef = (marker: Marker | null, key: string) => {
      if (marker && markers[key]) return;
      if (!marker && !markers[key]) return;

      setMarkers((prev) => {
        if (marker) {
          return { ...prev, [key]: marker };
        } else {
          const newMarkers = { ...prev };
          delete newMarkers[key];
          return newMarkers;
        }
      });
    };

    return (
      <>
        {props.pois.map((poi: Poi) => (
          <AdvancedMarker
            key={poi.key}
            position={poi.location}
            ref={(marker) => setMarkerRef(marker, poi.key)}
          >
            <Pin
              background={"#FBBC04"}
              glyphColor={"#000"}
              borderColor={"#000"}
            />
          </AdvancedMarker>
        ))}
      </>
    );
  };

  return (
    <>
      <div className="w-full h-full bg-rose-200 flex flex-col items-center gap-3 p-4 shadow border border-rose-300 rounded-md">
        <SearchBox ref={placeAutoCompleteRef} />
        <div className="rounded-md w-full h-full shadow overflow-hidden">
          <Map
            className="w-full h-full relative"
            defaultCenter={center}
            defaultZoom={10}
            mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
            onClick={(e) => onClickMap(e)}
          >
            {/* Current location */}
            <AdvancedMarker position={currentPosition}>
              <div className="rounded-full bg-rose-600 border-2 border-rose-200 size-6 shadow shadow-white"></div>
            </AdvancedMarker>

            <div
              className="absolute right-2.5 top-16 bg-white text-gray-600 text-center size-10 content-center rounded-sm shadow cursor-pointer"
              onClick={handlePanToCurrentLocation}
            >
              Home
            </div>

            <div>home</div>

            {/* <AdvancedMarker position={{ lat: 13.78, lng: 100.56 }}>
              <Pin
                background={"#e11d48"}
                glyphColor={"#ffe4e6"}
                borderColor={"#ffe4e6"}
              />
            </AdvancedMarker> */}

            <PoiMarkers pois={locations} />

            {/* Click to mark */}
            {morePin.map((pos, index) => {
              return (
                <AdvancedMarker key={index} position={pos}>
                  <Pin
                    background={"#e11d48"}
                    glyphColor={"#ffe4e6"}
                    borderColor={"#ffe4e6"}
                  />
                </AdvancedMarker>
              );
            })}

            {isSearch && (
              <>
                <AdvancedMarker
                  position={searchPin}
                  ref={markerRef}
                  onClick={() => setOpenInfoWindow(true)}
                  onDragEnd={(e) => {
                    if (!e.latLng) {
                      return;
                    }
                    console.log(e.latLng.lat(), e.latLng.lng());
                    setSearchPin({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                    map?.panTo({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                    map?.setZoom(15);
                  }}
                  className="relative"
                >
                  <Pin
                    background={"#fb7185"}
                    glyphColor={"#ffe4e6"}
                    borderColor={"#ffe4e6"}
                  />
                  {IsopenInfoWindow && (
                    <>
                      <div className="bg-green-400 size-20 text-xl">test</div>
                      <InfoWindow
                        position={{
                          lat: searchPin?.lat ? searchPin.lat + 0.001 : 0,
                          lng: searchPin?.lng ? searchPin.lng : 0,
                        }}
                        className="flex items-center"
                        anchor={marker}
                        onClose={() => setOpenInfoWindow(false)}
                      >
                        The content of the info window is here.
                        <div
                          className="bg-rose-600 text-rose-50 text-center w-1/2 p-1 rounded-md cursor-pointer"
                          onClick={handleAddToPath}
                        >
                          click
                        </div>
                      </InfoWindow>
                    </>
                  )}
                </AdvancedMarker>
              </>
            )}
          </Map>
        </div>
      </div>
    </>
  );
};

export default MapPage;
