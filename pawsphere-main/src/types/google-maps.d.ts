// Google Maps JavaScript API ambient declarations for TypeScript compilation
declare namespace google.maps {
  export class Map {
    constructor(mapDiv: HTMLElement, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    getCenter(): LatLng;
    setZoom(zoom: number): void;
    getZoom(): number;
    panTo(latLng: LatLng | LatLngLiteral): void;
    fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral, padding?: number | Padding): void;
    addListener(eventName: string, handler: (...args: any[]) => void): MapsEventListener;
  }

  export interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    styles?: MapTypeStyle[];
    mapTypeId?: string;
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    mapTypeControl?: boolean;
    backgroundColor?: string;
  }

  export interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  export class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  export class LatLngBounds {
    constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
    extend(point: LatLng | LatLngLiteral): LatLngBounds;
    getCenter(): LatLng;
  }

  export interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  export interface Padding {
    bottom?: number;
    left?: number;
    right?: number;
    top?: number;
  }

  export interface MapTypeStyle {
    elementType?: string;
    featureType?: string;
    stylers: object[];
  }

  export class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(latLng: LatLng | LatLngLiteral | null): void;
    getPosition(): LatLng | undefined;
    setTitle(title: string): void;
    setIcon(icon: string | Icon | Symbol): void;
    addListener(eventName: string, handler: (...args: any[]) => void): MapsEventListener;
  }

  export interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: string | Icon | Symbol;
    animation?: number;
    zIndex?: number;
  }

  export interface Icon {
    url: string;
    scaledSize?: Size;
    size?: Size;
    origin?: Point;
    anchor?: Point;
  }

  export interface Symbol {
    path: any;
    fillColor?: string;
    fillOpacity?: number;
    scale?: number;
    strokeColor?: string;
    strokeWeight?: number;
    anchor?: Point;
  }

  export enum SymbolPath {
    CIRCLE = 0,
    FORWARD_CLOSED_ARROW = 1,
    FORWARD_OPEN_ARROW = 2,
    BACKWARD_CLOSED_ARROW = 3,
    BACKWARD_OPEN_ARROW = 4,
  }

  export class Size {
    constructor(width: number, height: number);
    width: number;
    height: number;
  }

  export class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }

  export class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    open(options?: InfoWindowOpenOptions | Map, anchor?: Marker): void;
    close(): void;
    setContent(content: string | Node): void;
    setPosition(position: LatLng | LatLngLiteral): void;
  }

  export interface InfoWindowOptions {
    content?: string | Node;
    position?: LatLng | LatLngLiteral;
    maxWidth?: number;
    pixelOffset?: Size;
  }

  export interface InfoWindowOpenOptions {
    anchor?: Marker;
    map?: Map;
    shouldFocus?: boolean;
  }

  export interface MapsEventListener {
    remove(): void;
  }

  export namespace places {
    export class PlacesService {
      constructor(attrContainer: HTMLDivElement | Map);
      nearbySearch(
        request: PlaceSearchRequest,
        callback: (
          results: PlaceResult[] | null,
          status: PlacesServiceStatus,
          pagination: PlaceSearchPagination | null
        ) => void
      ): void;
      getDetails(
        request: PlaceDetailsRequest,
        callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void
      ): void;
    }

    export interface PlaceSearchRequest {
      location?: LatLng | LatLngLiteral;
      radius?: number;
      keyword?: string;
      type?: string;
      types?: string[];
      name?: string;
      openNow?: boolean;
    }

    export interface PlaceDetailsRequest {
      placeId: string;
      fields?: string[];
      sessionToken?: any;
    }

    export interface PlaceResult {
      place_id?: string;
      name?: string;
      formatted_address?: string;
      vicinity?: string;
      formatted_phone_number?: string;
      international_phone_number?: string;
      website?: string;
      rating?: number;
      user_ratings_total?: number;
      geometry?: {
        location?: LatLng;
      };
      photos?: PlacePhoto[];
      opening_hours?: {
        isOpen?: (date?: Date) => boolean;
        open_now?: boolean;
        weekday_text?: string[];
      };
      types?: string[];
      price_level?: number;
      reviews?: PlaceReview[];
      business_status?: string;
    }

    export interface PlacePhoto {
      getUrl(opts?: { maxWidth?: number; maxHeight?: number }): string;
      height: number;
      width: number;
    }

    export interface PlaceReview {
      author_name: string;
      rating: number;
      relative_time_description: string;
      text: string;
      time: number;
    }

    export interface PlaceSearchPagination {
      hasNextPage: boolean;
      nextPage(): void;
    }

    export enum PlacesServiceStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR',
      NOT_FOUND = 'NOT_FOUND',
    }
  }

  export namespace event {
    export function addListener(instance: any, eventName: string, handler: (...args: any[]) => void): MapsEventListener;
    export function addListenerOnce(instance: any, eventName: string, handler: (...args: any[]) => void): MapsEventListener;
    export function removeListener(listener: MapsEventListener): void;
    export function clearListeners(instance: any, eventName: string): void;
    export function trigger(instance: any, eventName: string, ...args: any[]): void;
  }
}
