declare module 'geojson' {
  export interface Point {
    type: 'Point'
    coordinates: number[]
  }

  export interface Feature<G = Point, P = Record<string, unknown> | null> {
    type: 'Feature'
    id?: string | number
    geometry: G
    properties: P
  }

  export interface FeatureCollection<G = Point, P = Record<string, unknown> | null> {
    type: 'FeatureCollection'
    features: Array<Feature<G, P>>
  }
}
