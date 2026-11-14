import type { FeatureCollection, Point, Polygon, LineString } from 'geojson';

export interface AncillaryGeoData {
  population: FeatureCollection<Point>;
  agriculture: FeatureCollection<Polygon>;
  infrastructure: FeatureCollection<LineString>;
}

export const ANCILLARY_DATA_BY_AREA: Record<string, AncillaryGeoData> = {
  kerala: {
    population: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Kochi Metropolis', population: '2.1M', tier: 'metropolis' },
          geometry: { type: 'Point', coordinates: [76.2673, 9.9312] },
        },
        {
          type: 'Feature',
          properties: { name: 'Alappuzha (Venice of the East)', population: '174k', tier: 'city' },
          geometry: { type: 'Point', coordinates: [76.3388, 9.4981] },
        },
        {
          type: 'Feature',
          properties: { name: 'Kottayam Midland Hub', population: '136k', tier: 'city' },
          geometry: { type: 'Point', coordinates: [76.5222, 9.5916] },
        },
        {
          type: 'Feature',
          properties: { name: 'Cherthala Coastal Town', population: '45k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [76.3283, 9.6847] },
        },
        {
          type: 'Feature',
          properties: { name: 'Vaikom Temple Town', population: '23k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [76.3963, 9.7495] },
        },
        {
          type: 'Feature',
          properties: { name: 'Changanassery Gateway', population: '47k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [76.5369, 9.4442] },
        },
        {
          type: 'Feature',
          properties: { name: 'Muvattupuzha River Junction', population: '30k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [76.5779, 9.9884] },
        },
        {
          type: 'Feature',
          properties: { name: 'Pala Meenachil Hub', population: '22k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [76.6833, 9.7083] },
        },
      ],
    },
    agriculture: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Lower Kuttanad Below-Sea-Level Polder Belt', type: 'paddy' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [76.35, 9.38],
                [76.48, 9.38],
                [76.50, 9.52],
                [76.43, 9.56],
                [76.36, 9.50],
                [76.35, 9.38],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: 'Upper Kuttanad Pampa-Manimala Alluvial Basin', type: 'paddy' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [76.46, 9.30],
                [76.60, 9.32],
                [76.58, 9.42],
                [76.48, 9.40],
                [76.46, 9.30],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: 'Vaikom-Kumarakom Wetland Agriculture', type: 'wetland_crop' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [76.38, 9.58],
                [76.47, 9.60],
                [76.46, 9.72],
                [76.39, 9.71],
                [76.38, 9.58],
              ],
            ],
          },
        },
      ],
    },
    infrastructure: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'NH-66 Coastal Highway Corridor (Kochi-Alappuzha)', type: 'highway' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [76.28, 9.98],
              [76.30, 9.85],
              [76.33, 9.69],
              [76.33, 9.50],
              [76.34, 9.35],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: 'AC Road (Alappuzha-Changanassery Elevated Floodway)', type: 'bund_road' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [76.34, 9.50],
              [76.39, 9.48],
              [76.46, 9.46],
              [76.54, 9.44],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: 'Thanneermukkom Salt Water Barrier Bund', type: 'barrier' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [76.39, 9.68],
              [76.42, 9.69],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: 'MC Road (State Highway 1: Kottayam-Changanassery)', type: 'highway' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [76.58, 9.99],
              [76.56, 9.82],
              [76.52, 9.59],
              [76.54, 9.44],
              [76.55, 9.32],
            ],
          },
        },
      ],
    },
  },
  amazon: {
    population: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Manaus Metropolis', population: '2.2M', tier: 'metropolis' },
          geometry: { type: 'Point', coordinates: [-60.0217, -3.119] },
        },
        {
          type: 'Feature',
          properties: { name: 'Iranduba River Port', population: '49k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [-60.1867, -3.2844] },
        },
        {
          type: 'Feature',
          properties: { name: 'Careiro Castanho Hub', population: '38k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [-59.85, -3.38] },
        },
      ],
    },
    agriculture: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Careiro Agricultural Clearing Frontier', type: 'clearing' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-59.95, -3.42],
                [-59.75, -3.40],
                [-59.78, -3.25],
                [-59.92, -3.28],
                [-59.95, -3.42],
              ],
            ],
          },
        },
      ],
    },
    infrastructure: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Ponte Rio Negro Cable Bridge', type: 'bridge' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [-60.05, -3.13],
              [-60.10, -3.16],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: 'BR-319 Trans-Amazon Corridor', type: 'highway' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [-59.98, -3.15],
              [-59.90, -3.35],
              [-59.85, -3.45],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: 'BR-174 Manaus-Boa Vista Highway', type: 'highway' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [-60.02, -3.05],
              [-60.02, -2.75],
            ],
          },
        },
      ],
    },
  },
  turkey: {
    population: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Kahramanmaraş Epicenter Hub', population: '570k', tier: 'city' },
          geometry: { type: 'Point', coordinates: [36.9372, 37.5858] },
        },
        {
          type: 'Feature',
          properties: { name: 'Pazarcık Rupture Epicenter', population: '68k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [37.2917, 37.485] },
        },
        {
          type: 'Feature',
          properties: { name: 'Türkoğlu Fault Town', population: '78k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [36.85, 37.38] },
        },
      ],
    },
    agriculture: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Kahramanmaraş Alluvial Basin', type: 'alluvial_crop' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [36.80, 37.42],
                [37.10, 37.40],
                [37.15, 37.55],
                [36.85, 37.54],
                [36.80, 37.42],
              ],
            ],
          },
        },
      ],
    },
    infrastructure: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'D-835 Highway Across East Anatolian Fault', type: 'highway' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [36.80, 37.30],
              [36.94, 37.58],
              [37.15, 37.75],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: 'Anatolian Railway Fault Rupture Zone', type: 'railway' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [36.85, 37.35],
              [37.05, 37.48],
              [37.28, 37.52],
            ],
          },
        },
      ],
    },
  },
  punjab: {
    population: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Ludhiana Industrial Hub', population: '1.6M', tier: 'metropolis' },
          geometry: { type: 'Point', coordinates: [75.8573, 30.901] },
        },
        {
          type: 'Feature',
          properties: { name: 'Jalandhar Doaba Center', population: '860k', tier: 'city' },
          geometry: { type: 'Point', coordinates: [75.5762, 31.326] },
        },
        {
          type: 'Feature',
          properties: { name: 'Phagwara Junction', population: '120k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [75.77, 31.22] },
        },
      ],
    },
    agriculture: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Indo-Gangetic Intensive Wheat-Paddy Belt', type: 'canal_colony' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [75.20, 30.50],
                [75.80, 30.50],
                [75.85, 31.10],
                [75.25, 31.10],
                [75.20, 30.50],
              ],
            ],
          },
        },
      ],
    },
    infrastructure: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Grand Trunk Road (NH-44)', type: 'highway' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [75.95, 30.75],
              [75.85, 30.90],
              [75.77, 31.22],
              [75.58, 31.32],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: 'Sirhind Canal Irrigation Aqueduct', type: 'canal' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [75.30, 30.60],
              [75.60, 30.75],
              [75.80, 30.82],
            ],
          },
        },
      ],
    },
  },
  himalayas: {
    population: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Namche Bazaar (Sherpa Capital)', population: '1.6k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [86.714, 27.8069] },
        },
        {
          type: 'Feature',
          properties: { name: 'Lukla Airfield Hub', population: '1.2k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [86.7297, 27.6869] },
        },
        {
          type: 'Feature',
          properties: { name: 'Dingboche High Valley', population: '500', tier: 'town' },
          geometry: { type: 'Point', coordinates: [86.83, 27.89] },
        },
      ],
    },
    agriculture: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Imja Khola Terraced Barley Valley', type: 'alpine_farm' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [86.75, 27.82],
                [86.85, 27.86],
                [86.83, 27.91],
                [86.73, 27.86],
                [86.75, 27.82],
              ],
            ],
          },
        },
      ],
    },
    infrastructure: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Khumbu Classic Mountaineering Corridor', type: 'trek' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [86.73, 27.69],
              [86.71, 27.81],
              [86.81, 27.89],
              [86.85, 27.98],
            ],
          },
        },
      ],
    },
  },
  indonesia: {
    population: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Pekanbaru Provincial Capital', population: '980k', tier: 'city' },
          geometry: { type: 'Point', coordinates: [101.4478, 0.5071] },
        },
        {
          type: 'Feature',
          properties: { name: 'Pangkalan Kerinci Pulp Hub', population: '95k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [101.85, 0.40] },
        },
        {
          type: 'Feature',
          properties: { name: 'Siak Sri Indrapura Historic Port', population: '42k', tier: 'town' },
          geometry: { type: 'Point', coordinates: [102.05, 0.79] },
        },
      ],
    },
    agriculture: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Kampar Peatland Agricultural Concession', type: 'plantation' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [101.70, 0.20],
                [102.30, 0.20],
                [102.35, 0.70],
                [101.75, 0.70],
                [101.70, 0.20],
              ],
            ],
          },
        },
      ],
    },
    infrastructure: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Trans-Sumatra East Corridor (Jalan Lintas Timur)', type: 'highway' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [101.60, 0.25],
              [101.85, 0.40],
              [102.10, 0.58],
              [102.35, 0.80],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: 'Kampar River Navigation & Industrial Channel', type: 'river_canal' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [101.65, 0.35],
              [101.90, 0.38],
              [102.20, 0.50],
              [102.40, 0.65],
            ],
          },
        },
      ],
    },
  },
};

