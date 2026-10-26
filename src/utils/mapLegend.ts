import type { Vehicle, VehicleStatus } from "../data/vehicles";

export type MapLegendMode = "status" | "metric";
export type FuelUnit = "percent" | "liter";
export type ClusterGroupingMode = "administrative" | "distance";

export interface ClusterZoomSettings {
  countryMaxZoom: number;
  regionMaxZoom: number;
  sectorMaxZoom: number;
  neighborhoodMaxZoom: number;
  distanceRanges: Array<{ maxZoom: number; radiusKm: number }>;
}

export interface MapColorRange {
  id: string;
  min: number;
  max: number;
  color: string;
  /** Auto ranges use the range-count palette; custom ranges keep the user's chosen color. */
  colorMode?: "auto" | "custom";
}

export interface EffectiveColorSegment {
  min: number;
  max: number;
  color: string;
}

export interface MetricOption {
  key: string;
  label: string;
  unit: string;
  source: "vehicle" | "gps" | "sensor";
  kind:
    | "percent"
    | "temperature"
    | "voltage"
    | "speed"
    | "distance"
    | "duration"
    | "count"
    | "number";
  min?: number;
  max?: number;
  step: number;
  displayStyle?: "gauge" | "bar";
  sourceKey?: string;
}

export interface CustomSensorDefinition {
  id: string;
  name: string;
  sourceKey: string;
  unit: string;
  min?: number;
  max?: number;
  displayStyle: "gauge" | "bar";
}

export interface CustomSensorBinding {
  key: string;
  label: string;
  source: "vehicle" | "gps" | "sensor";
  unit: string;
  min?: number;
  max?: number;
}

export interface MapLegendConfig {
  mode: MapLegendMode;
  metricKey: string;
  fuelUnit: FuelUnit;
  fuelTankCapacityLiters: number;
  fuelRangesByUnit: Record<FuelUnit, MapColorRange[]>;
  /** User-edited thresholds per metric; `ranges` remains the active metric's map-color ranges. */
  metricRangesByKey: Record<string, MapColorRange[]>;
  /** Editable upper end of each metric gauge. */
  metricScaleMaxByKey: Record<string, number>;
  /** Editable lower end of metrics whose operating range can extend below zero. */
  metricScaleMinByKey: Record<string, number>;
  customSensors: CustomSensorDefinition[];
  statusColors: Record<VehicleStatus | "towed", string>;
  ranges: MapColorRange[];
  noDataColor: string;
  clusterGrouping: ClusterGroupingMode;
  clusteringEnabled: boolean;
  clusterZoomSettings: ClusterZoomSettings;
}

const STORAGE_KEY = "fleet-map-legend-settings-v1";
export const DEFAULT_FUEL_TANK_CAPACITY_LITERS = 70;
export const DEFAULT_CLUSTER_ZOOM_SETTINGS: ClusterZoomSettings = {
  countryMaxZoom: 3,
  regionMaxZoom: 10,
  sectorMaxZoom: 11,
  neighborhoodMaxZoom: 12,
  distanceRanges: [
    { maxZoom: 6, radiusKm: 220 },
    { maxZoom: 8, radiusKm: 80 },
    { maxZoom: 10, radiusKm: 24 },
    { maxZoom: 12, radiusKm: 6 },
  ],
};

export const FUEL_RANGE_COLOR_PALETTE = [
  "#ef4444",
  "#f97316",
  "#facc15",
  "#16a34a",
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];
const COLD_TO_HOT_PALETTE = [
  "#3b82f6",
  "#06b6d4",
  "#16a34a",
  "#facc15",
  "#f97316",
  "#ef4444",
];

export function getMetricRangePalette(metricKey: string) {
  return metricKey === "weightLimitTons" ||
    metricKey === "refrigerator_temperature"
    ? COLD_TO_HOT_PALETTE
    : FUEL_RANGE_COLOR_PALETTE;
}

export function applyAutomaticRangeColors(
  ranges: MapColorRange[],
  palette = FUEL_RANGE_COLOR_PALETTE
): MapColorRange[] {
  return ranges.map((range, index) =>
    range.colorMode === "auto"
      ? { ...range, color: palette[index % palette.length] }
      : range
  );
}

const defaultFuelRanges = (
  unit: FuelUnit,
  capacity = DEFAULT_FUEL_TANK_CAPACITY_LITERS
): MapColorRange[] => {
  const scale = unit === "percent" ? 100 : capacity;
  const suffix = unit === "percent" ? "percent" : "liter";
  return [
    {
      id: `fuel-${suffix}-low`,
      min: 0,
      max: scale * 0.3,
      color: "#ef4444",
      colorMode: "auto",
    },
    {
      id: `fuel-${suffix}-medium`,
      min: scale * 0.3,
      max: scale * 0.7,
      color: "#f97316",
      colorMode: "auto",
    },
    {
      id: `fuel-${suffix}-high`,
      min: scale * 0.7,
      max: scale,
      color: "#16a34a",
      colorMode: "auto",
    },
  ];
};

export function getDefaultFuelRanges(
  unit: FuelUnit,
  capacity = DEFAULT_FUEL_TANK_CAPACITY_LITERS
) {
  return defaultFuelRanges(unit, capacity).map((range) => ({ ...range }));
}

export function normalizeFuelRanges(
  ranges: MapColorRange[],
  maximum: number,
  step = 1
) {
  const seen = new Set<string>();
  const upper = Math.max(step, maximum);
  const prepared = ranges
    .map((range, index) => {
      let min = Math.min(
        upper - step,
        Math.max(0, Number.isFinite(range.min) ? range.min : 0)
      );
      let max = Math.min(
        upper,
        Math.max(0, Number.isFinite(range.max) ? range.max : upper)
      );
      if (max - min < step) {
        min = Math.max(0, max - step);
        max = min + step;
      }
      return { ...range, id: range.id || `fuel-range-${index}`, min, max };
    })
    .sort((a, b) => a.min - b.min);
  const normalized: MapColorRange[] = [];

  return prepared.flatMap((range) => {
    const previous = normalized[normalized.length - 1];
    const min = Math.max(range.min, previous?.max ?? 0);
    const duplicateKey = `${min}:${range.max}`;
    if (range.max - min < step || seen.has(duplicateKey)) return [];
    seen.add(duplicateKey);
    const normalizedRange = { ...range, min };
    normalized.push(normalizedRange);
    return [normalizedRange];
  });
}

function findRangeForValue(value: number, orderedRanges: MapColorRange[]) {
  return orderedRanges.find(
    (item, index) =>
      Number.isFinite(item.min) &&
      Number.isFinite(item.max) &&
      item.min <= item.max &&
      value >= item.min &&
      (value < item.max ||
        (index === orderedRanges.length - 1 && value <= item.max))
  );
}

export function getEffectiveColorSegments(
  ranges: MapColorRange[],
  minimum: number,
  maximum: number,
  noDataColor: string
): EffectiveColorSegment[] {
  if (
    !Number.isFinite(minimum) ||
    !Number.isFinite(maximum) ||
    maximum <= minimum
  )
    return [];

  const orderedRanges = [...ranges]
    .filter(
      (range) =>
        Number.isFinite(range.min) &&
        Number.isFinite(range.max) &&
        range.min <= range.max
    )
    .sort((a, b) => a.min - b.min);
  const boundaries = [
    ...new Set([
      minimum,
      maximum,
      ...orderedRanges.flatMap((range) => [
        Math.max(minimum, Math.min(maximum, range.min)),
        Math.max(minimum, Math.min(maximum, range.max)),
      ]),
    ]),
  ].sort((a, b) => a - b);
  const segments: EffectiveColorSegment[] = [];

  for (let index = 0; index < boundaries.length - 1; index++) {
    const min = boundaries[index];
    const max = boundaries[index + 1];
    if (max <= min) continue;
    const midpoint = min + (max - min) / 2;
    const color =
      findRangeForValue(midpoint, orderedRanges)?.color ?? noDataColor;
    const previous = segments[segments.length - 1];
    if (previous && previous.max === min && previous.color === color)
      previous.max = max;
    else segments.push({ min, max, color });
  }

  return segments;
}

export const DEFAULT_MAP_LEGEND: MapLegendConfig = {
  mode: "status",
  metricKey: "speed",
  fuelUnit: "percent",
  fuelTankCapacityLiters: DEFAULT_FUEL_TANK_CAPACITY_LITERS,
  fuelRangesByUnit: { percent: [], liter: [] },
  metricRangesByKey: {},
  metricScaleMaxByKey: {},
  metricScaleMinByKey: {},
  customSensors: [],
  statusColors: {
    moving: "#16a34a",
    idle: "#ef4444",
    offline: "#6b7280",
    towed: "#f5993d",
  },
  ranges: [],
  noDataColor: "#94a3b8",
  clusterGrouping: "administrative",
  clusteringEnabled: true,
  clusterZoomSettings: DEFAULT_CLUSTER_ZOOM_SETTINGS,
};

export function getDefaultMetricRanges(option: MetricOption): MapColorRange[] {
  const presets: Record<string, Array<[number, number, string]>> = {
    batteryPercent: [
      [0, 20, "#ef4444"],
      [20, 50, "#f59e0b"],
      [50, 100, "#16a34a"],
    ],
    batteryVoltage: [
      [0, 12, "#ef4444"],
      [12, 12.6, "#f59e0b"],
      [12.6, 14.8, "#16a34a"],
      [14.8, 20, "#ef4444"],
    ],
    speed: [
      [0, 60, "#16a34a"],
      [60, 100, "#f59e0b"],
      [100, 200, "#ef4444"],
    ],
    satellites: [
      [0, 4, "#ef4444"],
      [4, 8, "#f59e0b"],
      [8, 50, "#16a34a"],
    ],
    refrigerator_temperature: [
      [-30, -18, "#3b82f6"],
      [-18, -10, "#16a34a"],
      [-10, -5, "#f59e0b"],
      [-5, 10, "#ef4444"],
    ],
  };
  if (option.key === "speed") {
    const maximum = option.max ?? 200;
    return [
      { id: "speed-low", min: 0, max: Math.min(60, maximum), color: "#16a34a" },
      {
        id: "speed-medium",
        min: Math.min(60, maximum),
        max: Math.min(100, maximum),
        color: "#f59e0b",
      },
      {
        id: "speed-high",
        min: Math.min(100, maximum),
        max: maximum,
        color: "#ef4444",
      },
    ].filter((range) => range.max > range.min);
  }
  if (option.key === "odometer") {
    const maximum = option.max ?? 150000;
    const first = Math.round(maximum / 3);
    const second = Math.round((maximum * 2) / 3);
    return [
      { id: "odometer-low", min: 0, max: first, color: "#16a34a" },
      { id: "odometer-medium", min: first, max: second, color: "#f59e0b" },
      { id: "odometer-high", min: second, max: maximum, color: "#ef4444" },
    ];
  }
  if (option.key === "weightLimitTons") {
    const min = option.min ?? 0;
    const max = option.max ?? 10;
    const step = (max - min) / 4;
    const palette = getMetricRangePalette(option.key);
    return palette.slice(0, 4).map((color, index) => ({
      id: `weight-limit-${index}`,
      min: min + step * index,
      max: index === 3 ? max : min + step * (index + 1),
      color,
    }));
  }
  const preset = presets[option.key];
  if (preset)
    return preset.map(([min, max, color], index) => ({
      id: `${option.key}-${index}`,
      min,
      max,
      color,
    }));

  if (option.kind === "temperature" && /engine/i.test(option.label)) {
    return [
      {
        id: `${option.key}-cool`,
        min: option.min ?? 0,
        max: 70,
        color: "#f59e0b",
      },
      { id: `${option.key}-normal`, min: 70, max: 100, color: "#16a34a" },
      {
        id: `${option.key}-hot`,
        min: 100,
        max: option.max ?? 120,
        color: "#ef4444",
      },
    ];
  }
  if (option.unit === "psi" && /oil pressure/i.test(option.label)) {
    return [
      {
        id: `${option.key}-low`,
        min: option.min ?? 0,
        max: 20,
        color: "#ef4444",
      },
      { id: `${option.key}-normal`, min: 20, max: 60, color: "#16a34a" },
      {
        id: `${option.key}-high`,
        min: 60,
        max: option.max ?? 80,
        color: "#f59e0b",
      },
    ];
  }
  if (option.kind === "percent") {
    const min = option.min ?? 0;
    const max = option.max ?? 100;
    const span = max - min;
    return [
      { id: `${option.key}-low`, min, max: min + span * 0.3, color: "#ef4444" },
      {
        id: `${option.key}-medium`,
        min: min + span * 0.3,
        max: min + span * 0.7,
        color: "#f59e0b",
      },
      {
        id: `${option.key}-high`,
        min: min + span * 0.7,
        max,
        color: "#16a34a",
      },
    ];
  }
  if (option.kind === "voltage" && /battery/i.test(option.label)) {
    return [
      {
        id: `${option.key}-low`,
        min: option.min ?? 0,
        max: 11.8,
        color: "#ef4444",
      },
      { id: `${option.key}-medium`, min: 11.8, max: 12.4, color: "#f59e0b" },
      { id: `${option.key}-normal`, min: 12.4, max: 14.8, color: "#16a34a" },
      {
        id: `${option.key}-high`,
        min: 14.8,
        max: option.max ?? 20,
        color: "#ef4444",
      },
    ];
  }

  let min = option.min ?? 0;
  let max = option.max ?? 100;
  if (option.kind === "temperature" && /engine/i.test(option.label)) {
    min = option.min ?? 0;
    max = option.max ?? 120;
  }
  if (min >= max) {
    min = 0;
    max = 100;
  }
  const span = max - min;
  const split1 = min + span * 0.6;
  const split2 = min + span * 0.85;
  return [
    { id: `${option.key}-low`, min, max: split1, color: "#16a34a" },
    { id: `${option.key}-mid`, min: split1, max: split2, color: "#f59e0b" },
    { id: `${option.key}-high`, min: split2, max, color: "#ef4444" },
  ];
}

export function readMapLegendConfig(): MapLegendConfig {
  if (typeof window === "undefined") return DEFAULT_MAP_LEGEND;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_MAP_LEGEND;
    const parsed = JSON.parse(saved) as Partial<MapLegendConfig>;
    const storedCapacity =
      Number.isFinite(parsed.fuelTankCapacityLiters) &&
      (parsed.fuelTankCapacityLiters ?? 0) > 0
        ? parsed.fuelTankCapacityLiters!
        : DEFAULT_FUEL_TANK_CAPACITY_LITERS;
    const legacyDefaultCapacity = storedCapacity === 800;
    const capacity = legacyDefaultCapacity
      ? DEFAULT_FUEL_TANK_CAPACITY_LITERS
      : storedCapacity;
    const fuelUnit = parsed.fuelUnit === "liter" ? "liter" : "percent";
    const savedFuelRanges = parsed.fuelRangesByUnit;
    const percentRanges = Array.isArray(savedFuelRanges?.percent)
      ? savedFuelRanges.percent
      : parsed.metricKey === "fuelLevel" &&
        fuelUnit === "percent" &&
        Array.isArray(parsed.ranges)
      ? parsed.ranges
      : [];
    const literRanges = Array.isArray(savedFuelRanges?.liter)
      ? legacyDefaultCapacity
        ? savedFuelRanges.liter.map((range) => ({
            ...range,
            min: (range.min * capacity) / storedCapacity,
            max: (range.max * capacity) / storedCapacity,
          }))
        : savedFuelRanges.liter
      : [];
    const normalizedPercentRanges = normalizeFuelRanges(percentRanges, 100);
    const normalizedLiterRanges = normalizeFuelRanges(literRanges, capacity);
    const isLegacyDefaultSet = (ranges: MapColorRange[], unit: FuelUnit) => {
      const defaults = defaultFuelRanges(unit, capacity);
      return (
        ranges.length === defaults.length &&
        ranges.every((range, index) => {
          const expected = defaults[index];
          const expectedColor = expected.color.toLowerCase();
          const legacyColor =
            index === 1 && defaults.length === 3 ? "#f59e0b" : expectedColor;
          return (
            range.id === expected.id &&
            range.min === expected.min &&
            range.max === expected.max &&
            [expectedColor, legacyColor].includes(range.color.toLowerCase())
          );
        })
      );
    };
    const initialPercentRanges = isLegacyDefaultSet(
      normalizedPercentRanges,
      "percent"
    )
      ? []
      : normalizedPercentRanges;
    const initialLiterRanges = isLegacyDefaultSet(
      normalizedLiterRanges,
      "liter"
    )
      ? []
      : normalizedLiterRanges;
    const activeFuelRanges =
      fuelUnit === "percent" ? initialPercentRanges : initialLiterRanges;
    const savedActiveRanges = Array.isArray(parsed.ranges)
      ? parsed.ranges
      : activeFuelRanges;
    const normalizedActiveFuelRanges = normalizeFuelRanges(
      legacyDefaultCapacity &&
        parsed.metricKey === "fuelLevel" &&
        fuelUnit === "liter"
        ? savedActiveRanges.map((range) => ({
            ...range,
            min: (range.min * capacity) / storedCapacity,
            max: (range.max * capacity) / storedCapacity,
          }))
        : savedActiveRanges,
      fuelUnit === "percent" ? 100 : capacity
    );
    const initialActiveFuelRanges =
      parsed.metricKey === "fuelLevel" &&
      activeFuelRanges.length === 0 &&
      isLegacyDefaultSet(normalizedActiveFuelRanges, fuelUnit)
        ? []
        : normalizedActiveFuelRanges;
    const metricRangesByKey =
      parsed.metricRangesByKey && typeof parsed.metricRangesByKey === "object"
        ? { ...parsed.metricRangesByKey }
        : {};
    const isLegacySpeedDefault = (ranges: MapColorRange[]) => {
      if (ranges.length !== 3) return false;
      const legacyPresets = [200, 300];
      return legacyPresets.some((maximum) => {
        const expected = [
          ["speed-low", 0, 60, "#16a34a"],
          ["speed-medium", 60, 100, "#f59e0b"],
          ["speed-high", 100, maximum, "#ef4444"],
        ] as const;
        return ranges.every((range, index) => {
          const [id, min, max, color] = expected[index];
          return (
            range.id === id &&
            range.min === min &&
            range.max === max &&
            range.color.toLowerCase() === color
          );
        });
      });
    };
    if (isLegacySpeedDefault(metricRangesByKey.speed ?? []))
      metricRangesByKey.speed = [];
    let activeMetricRanges =
      parsed.metricKey !== "fuelLevel"
        ? metricRangesByKey[parsed.metricKey ?? "speed"] ??
          (Array.isArray(parsed.ranges) ? parsed.ranges : [])
        : undefined;
    if (
      parsed.metricKey === "speed" &&
      isLegacySpeedDefault(activeMetricRanges ?? [])
    ) {
      metricRangesByKey.speed = [];
      activeMetricRanges = [];
    }
    const metricScaleMaxByKey =
      parsed.metricScaleMaxByKey &&
      typeof parsed.metricScaleMaxByKey === "object"
        ? (Object.fromEntries(
            Object.entries(parsed.metricScaleMaxByKey).filter(
              ([key, value]) =>
                Number.isFinite(value) &&
                (key.startsWith("custom:") || value > 0)
            )
          ) as Record<string, number>)
        : {};
    const metricScaleMinByKey =
      parsed.metricScaleMinByKey &&
      typeof parsed.metricScaleMinByKey === "object"
        ? (Object.fromEntries(
            Object.entries(parsed.metricScaleMinByKey).filter(([, value]) =>
              Number.isFinite(value)
            )
          ) as Record<string, number>)
        : {};
    const customSensors = Array.isArray(parsed.customSensors)
      ? parsed.customSensors.filter((item): item is CustomSensorDefinition =>
          Boolean(
            item &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              typeof item.sourceKey === "string" &&
              typeof item.unit === "string" &&
              (item.displayStyle === "gauge" || item.displayStyle === "bar") &&
              (item.min === undefined || Number.isFinite(item.min)) &&
              (item.max === undefined || Number.isFinite(item.max))
          )
        )
      : [];
    if (
      parsed.metricKey &&
      parsed.metricKey !== "fuelLevel" &&
      !metricRangesByKey[parsed.metricKey]
    ) {
      metricRangesByKey[parsed.metricKey] = activeMetricRanges ?? [];
    }
    return {
      ...DEFAULT_MAP_LEGEND,
      ...parsed,
      fuelUnit,
      fuelTankCapacityLiters: capacity,
      fuelRangesByUnit: {
        percent: initialPercentRanges,
        liter: initialLiterRanges,
      },
      metricRangesByKey,
      metricScaleMaxByKey,
      metricScaleMinByKey,
      customSensors,
      statusColors: {
        ...DEFAULT_MAP_LEGEND.statusColors,
        ...parsed.statusColors,
      },
      ranges:
        parsed.metricKey === "fuelLevel"
          ? initialActiveFuelRanges
          : activeMetricRanges ?? [],
      clusterGrouping:
        parsed.clusterGrouping === "distance" ? "distance" : "administrative",
      clusteringEnabled: parsed.clusteringEnabled !== false,
      clusterZoomSettings: normalizeClusterZoomSettings(
        parsed.clusterZoomSettings
      ),
    };
  } catch {
    return DEFAULT_MAP_LEGEND;
  }
}

function normalizeClusterZoomSettings(value: unknown): ClusterZoomSettings {
  const saved =
    value && typeof value === "object"
      ? (value as Partial<ClusterZoomSettings>)
      : {};
  const bounded = (
    input: unknown,
    fallback: number,
    min: number,
    max: number
  ) =>
    typeof input === "number" && Number.isFinite(input)
      ? Math.min(max, Math.max(min, input))
      : fallback;
  const savedRanges = Array.isArray(saved.distanceRanges)
    ? saved.distanceRanges
    : [];
  return {
    countryMaxZoom: bounded(
      saved.countryMaxZoom,
      DEFAULT_CLUSTER_ZOOM_SETTINGS.countryMaxZoom,
      1,
      18
    ),
    regionMaxZoom: bounded(
      saved.regionMaxZoom,
      DEFAULT_CLUSTER_ZOOM_SETTINGS.regionMaxZoom,
      2,
      18
    ),
    sectorMaxZoom: bounded(
      saved.sectorMaxZoom,
      DEFAULT_CLUSTER_ZOOM_SETTINGS.sectorMaxZoom,
      3,
      18
    ),
    neighborhoodMaxZoom: bounded(
      saved.neighborhoodMaxZoom,
      DEFAULT_CLUSTER_ZOOM_SETTINGS.neighborhoodMaxZoom,
      4,
      18
    ),
    distanceRanges: DEFAULT_CLUSTER_ZOOM_SETTINGS.distanceRanges.map(
      (fallback, index) => ({
        maxZoom: bounded(savedRanges[index]?.maxZoom, fallback.maxZoom, 1, 18),
        radiusKm: bounded(
          savedRanges[index]?.radiusKm,
          fallback.radiusKm,
          0.5,
          1000
        ),
      })
    ),
  };
}

export function saveMapLegendConfig(config: MapLegendConfig) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // The current prototype remains usable when browser storage is unavailable.
  }
}

function numericSensorValue(vehicle: Vehicle, sourceKey: string) {
  const sensorKey = sourceKey.slice("sensor:".length);
  const reading = vehicle.sensors.find(
    (sensor) => (sensor.key ?? sensor.label) === sensorKey
  );
  if (!reading) return null;
  if (typeof reading.current === "number" && Number.isFinite(reading.current))
    return reading.current;
  if (!reading.value.trim()) return null;
  const parsed = Number(reading.value.trim().replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function customSensorSourceValue(vehicle: Vehicle, sourceKey: string) {
  if (sourceKey.startsWith("sensor:"))
    return numericSensorValue(vehicle, sourceKey);
  if (sourceKey.startsWith("telemetry:")) {
    const value =
      vehicle.telemetry[
        sourceKey.slice("telemetry:".length) as keyof Vehicle["telemetry"]
      ];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }
  switch (sourceKey) {
    case "speed":
      return Number.isFinite(vehicle.speed) ? vehicle.speed : null;
    case "fuelLevel":
      return Number.isFinite(vehicle.fuelLevel) ? vehicle.fuelLevel : null;
    case "fuelVolumeLiters":
      return typeof vehicle.fuelVolumeLiters === "number" &&
        Number.isFinite(vehicle.fuelVolumeLiters)
        ? vehicle.fuelVolumeLiters
        : null;
    case "odometer":
      return Number.isFinite(vehicle.odometer) ? vehicle.odometer : null;
    case "tripDistance":
      return Number.isFinite(vehicle.tripDistance)
        ? vehicle.tripDistance
        : null;
    case "engineHours":
      return Number.isFinite(vehicle.engineHours) ? vehicle.engineHours : null;
    default:
      return null;
  }
}

export function getVehicleMetric(
  vehicle: Vehicle,
  metricKey: string,
  fuelUnit: FuelUnit = "percent",
  fuelTankCapacityLiters = DEFAULT_FUEL_TANK_CAPACITY_LITERS,
  customSensors: CustomSensorDefinition[] = []
): number | null {
  if (metricKey.startsWith("custom:")) {
    const sensor = customSensors.find(
      (item) => `custom:${item.id}` === metricKey
    );
    return sensor ? customSensorSourceValue(vehicle, sensor.sourceKey) : null;
  }
  switch (metricKey) {
    case "speed":
      return Number.isFinite(vehicle.speed) ? vehicle.speed : null;
    case "fuelLevel": {
      if (fuelUnit === "liter") {
        if (
          typeof vehicle.fuelVolumeLiters === "number" &&
          Number.isFinite(vehicle.fuelVolumeLiters)
        )
          return vehicle.fuelVolumeLiters;
        return Number.isFinite(vehicle.fuelLevel) && fuelTankCapacityLiters > 0
          ? (vehicle.fuelLevel / 100) * fuelTankCapacityLiters
          : null;
      }
      if (Number.isFinite(vehicle.fuelLevel)) return vehicle.fuelLevel;
      return typeof vehicle.fuelVolumeLiters === "number" &&
        Number.isFinite(vehicle.fuelVolumeLiters) &&
        fuelTankCapacityLiters > 0
        ? (vehicle.fuelVolumeLiters / fuelTankCapacityLiters) * 100
        : null;
    }
    case "batteryPercent":
      return vehicle.telemetry.batteryPercent;
    case "batteryVoltage":
      return vehicle.telemetry.batteryVoltage;
    case "satellites":
      return Number.isFinite(vehicle.telemetry.satellites)
        ? vehicle.telemetry.satellites
        : null;
    case "odometer":
      return Number.isFinite(vehicle.odometer) ? vehicle.odometer : null;
    case "tripDistance":
      return Number.isFinite(vehicle.tripDistance)
        ? vehicle.tripDistance
        : null;
    case "engineHours":
      return Number.isFinite(vehicle.engineHours) ? vehicle.engineHours : null;
    case "actualWeightTons":
      return vehicle.telemetry.actualWeightTons;
    case "weightLimitTons":
      return vehicle.telemetry.weightLimitTons;
    default: {
      const reading = vehicle.sensors.find(
        (sensor) => (sensor.key ?? sensor.label) === metricKey
      );
      if (!reading) return null;
      if (
        typeof reading.current === "number" &&
        Number.isFinite(reading.current)
      )
        return reading.current;
      if (!reading.value.trim()) return null;
      const parsed = Number(reading.value.trim().replace(/,/g, ""));
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
}

export function getVehicleMapColor(
  vehicle: Vehicle,
  config: MapLegendConfig
): string {
  if (config.mode === "status")
    return vehicle.telemetry?.towing
      ? config.statusColors.towed
      : config.statusColors[vehicle.status];
  const value = getVehicleMetric(
    vehicle,
    config.metricKey,
    config.fuelUnit,
    config.fuelTankCapacityLiters,
    config.customSensors
  );
  if (value === null) return config.noDataColor;
  const ordered = [...config.ranges].sort((a, b) => a.min - b.min);
  const range = findRangeForValue(value, ordered);
  return range?.color ?? config.noDataColor;
}

export function getCustomSensorBindings(
  vehicles: Vehicle[]
): CustomSensorBinding[] {
  const fieldBindings: Array<
    CustomSensorBinding & { getValue: (vehicle: Vehicle) => number | null }
  > = [
    {
      key: "speed",
      label: "Speed",
      source: "vehicle",
      unit: "km/h",
      min: 0,
      max: 200,
      getValue: (vehicle) => vehicle.speed,
    },
    {
      key: "fuelLevel",
      label: "Fuel level",
      source: "vehicle",
      unit: "%",
      min: 0,
      max: 100,
      getValue: (vehicle) => vehicle.fuelLevel,
    },
    {
      key: "fuelVolumeLiters",
      label: "Fuel volume",
      source: "vehicle",
      unit: "L",
      min: 0,
      getValue: (vehicle) => vehicle.fuelVolumeLiters ?? null,
    },
    {
      key: "odometer",
      label: "Odometer",
      source: "vehicle",
      unit: "km",
      min: 0,
      getValue: (vehicle) => vehicle.odometer,
    },
    {
      key: "tripDistance",
      label: "Trip distance",
      source: "vehicle",
      unit: "km",
      min: 0,
      getValue: (vehicle) => vehicle.tripDistance,
    },
    {
      key: "engineHours",
      label: "Engine hours",
      source: "vehicle",
      unit: "h",
      min: 0,
      getValue: (vehicle) => vehicle.engineHours,
    },
    {
      key: "telemetry:batteryPercent",
      label: "Tracker battery",
      source: "gps",
      unit: "%",
      min: 0,
      max: 100,
      getValue: (vehicle) => vehicle.telemetry.batteryPercent,
    },
    {
      key: "telemetry:batteryVoltage",
      label: "Battery voltage",
      source: "gps",
      unit: "V",
      min: 0,
      max: 20,
      getValue: (vehicle) => vehicle.telemetry.batteryVoltage,
    },
    {
      key: "telemetry:satellites",
      label: "Satellites",
      source: "gps",
      unit: "",
      min: 0,
      getValue: (vehicle) => vehicle.telemetry.satellites,
    },
    {
      key: "telemetry:actualWeightTons",
      label: "Actual weight",
      source: "gps",
      unit: "t",
      min: 0,
      getValue: (vehicle) => vehicle.telemetry.actualWeightTons,
    },
    {
      key: "telemetry:weightLimitTons",
      label: "Weight limit",
      source: "gps",
      unit: "t",
      min: 0,
      getValue: (vehicle) => vehicle.telemetry.weightLimitTons,
    },
  ];
  const available = fieldBindings
    .filter((binding) =>
      vehicles.some((vehicle) => {
        const value = binding.getValue(vehicle);
        return typeof value === "number" && Number.isFinite(value);
      })
    )
    .map(({ getValue: _getValue, ...binding }) => binding);
  const sensors = new Map<string, CustomSensorBinding>();
  vehicles.forEach((vehicle) =>
    vehicle.sensors.forEach((sensor) => {
      if (typeof sensor.current !== "number" && !sensor.value.trim()) return;
      const sensorValue =
        typeof sensor.current === "number" && Number.isFinite(sensor.current)
          ? sensor.current
          : Number(sensor.value.trim().replace(/,/g, ""));
      if (!Number.isFinite(sensorValue)) return;
      const key = `sensor:${sensor.key ?? sensor.label}`;
      sensors.set(key, {
        key,
        label: sensor.label,
        source: "sensor",
        unit: sensor.unit ?? "",
        min: sensor.min,
        max: sensor.max,
      });
    })
  );
  return [...available, ...sensors.values()];
}

export function getMetricOptions(
  vehicles: Vehicle[],
  customSensors: CustomSensorDefinition[] = []
) {
  const odometerReadings = vehicles
    .map((vehicle) => vehicle.odometer)
    .filter(Number.isFinite);
  const highestOdometer = odometerReadings.length
    ? Math.max(...odometerReadings)
    : 100000;
  const odometerMaximum = Math.max(
    50000,
    Math.ceil(highestOdometer / 50000) * 50000
  );
  const weightLimits = vehicles
    .map((vehicle) => vehicle.telemetry.weightLimitTons)
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value)
    );
  const highestWeightLimit = weightLimits.length
    ? Math.max(...weightLimits)
    : 10;
  const weightMaximum = Math.max(5, Math.ceil(highestWeightLimit / 5) * 5);
  const options: MetricOption[] = [
    {
      key: "speed",
      label: "Speed",
      unit: "km/h",
      source: "vehicle",
      kind: "speed",
      min: 0,
      max: 200,
      step: 1,
    },
    {
      key: "fuelLevel",
      label: "Fuel level",
      unit: "%",
      source: "vehicle",
      kind: "percent",
      min: 0,
      max: 100,
      step: 1,
    },
    {
      key: "odometer",
      label: "Odometer",
      unit: "km",
      source: "vehicle",
      kind: "distance",
      min: 0,
      max: odometerMaximum,
      step: 1,
    },
    {
      key: "weightLimitTons",
      label: "Weight limit",
      unit: "t",
      source: "vehicle",
      kind: "number",
      min: 0,
      max: weightMaximum,
      step: 0.1,
    },
    {
      key: "batteryVoltage",
      label: "Battery",
      unit: "V",
      source: "sensor",
      kind: "voltage",
      min: 0,
      max: 20,
      step: 0.1,
    },
  ];
  const sensors = new Map<string, MetricOption>();
  vehicles.forEach((vehicle) =>
    vehicle.sensors.forEach((sensor) => {
      const key = sensor.key ?? `sensor:${sensor.label}`;
      const sensorValue =
        typeof sensor.current === "number" && Number.isFinite(sensor.current)
          ? sensor.current
          : sensor.value.trim()
          ? Number(sensor.value.trim())
          : Number.NaN;
      if (!Number.isFinite(sensorValue)) return;
      if (key !== "refrigerator_temperature") return;
      const unit = sensor.unit ?? "";
      const kind: MetricOption["kind"] =
        unit === "%"
          ? "percent"
          : unit === "°C" || unit === "°F"
          ? "temperature"
          : unit === "V"
          ? "voltage"
          : /km\/h/i.test(unit)
          ? "speed"
          : /km|mi/i.test(unit)
          ? "distance"
          : /rpm|psi/i.test(unit)
          ? "number"
          : "number";
      sensors.set(key, {
        key,
        label: sensor.label,
        unit,
        source: "sensor",
        kind,
        min: sensor.min,
        max: sensor.max,
        step: kind === "temperature" || kind === "voltage" ? 0.1 : 1,
      });
    })
  );
  const customOptions: MetricOption[] = customSensors.map((sensor) => {
    const binding = getCustomSensorBindings(vehicles).find(
      (item) => item.key === sensor.sourceKey
    );
    return {
      key: `custom:${sensor.id}`,
      label: sensor.name,
      unit: sensor.unit,
      source: "sensor",
      kind: "number",
      min: sensor.min ?? binding?.min ?? 0,
      max: sensor.max ?? binding?.max ?? 100,
      step: /(?:°C|°F|V)$/i.test(sensor.unit) ? 0.1 : 1,
      displayStyle: sensor.displayStyle,
      sourceKey: sensor.sourceKey,
    };
  });
  return [...options, ...sensors.values(), ...customOptions];
}
