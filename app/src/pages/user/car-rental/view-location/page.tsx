import Table, { type TableColumn } from '@/components/custom/table.component'; // Adjusted path to target your table component
import PageLayout from '@/components/layout/page.layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetDeviceByCarRental } from '@rest/device.custom';
import type { LatLngBoundsExpression } from 'leaflet';
import {
  Activity,
  Clock,
  Compass,
  Hash,
  MapPin,
  Navigation,
  Radio,
  Signal,
  Tag,
  Wifi,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { useParams } from 'react-router';

// Module-level helper — stable reference, safe to use in column render fns.
const fmt = (ts?: string) => (ts ? new Date(ts).toLocaleString() : '—');

// ── FitBounds ─────────────────────────────────────────────────────────────────
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!positions.length) return;
    if (positions.length === 1) {
      map.setView(positions[0], 15);
      return;
    }
    map.fitBounds(positions as LatLngBoundsExpression, { padding: [40, 40] });
  }, [map, positions]);

  return null;
}

// ── RoutingMachine ────────────────────────────────────────────────────────────
function RoutingMachine({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  const routeLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || positions.length < 2) return;

    let cancelled = false;

    (async () => {
      const { default: L } = await import('leaflet');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await import('leaflet-routing-machine');

      if (cancelled) return;

      if (routeLayerRef.current) {
        try {
          map.removeLayer(routeLayerRef.current);
        } catch {
          /* stale ref */
        }
        routeLayerRef.current = null;
      }

      const MAX_WP = 25;
      let wps: [number, number][] = positions;
      if (positions.length > MAX_WP) {
        const step = Math.ceil((positions.length - 1) / (MAX_WP - 1));
        const sampled: [number, number][] = [];
        for (let i = 0; i < positions.length - 1; i += step) {
          sampled.push(positions[i]);
        }
        sampled.push(positions[positions.length - 1]);
        wps = sampled.slice(0, MAX_WP);
      }

      const router = (L as any).Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving',
        useHints: false,
      });

      router.route(
        wps.map(([lat, lng]: [number, number]) => ({ latLng: L.latLng(lat, lng) })),
        (err: any, routes: any[]) => {
          if (cancelled) return;

          if (err || !routes?.length) {
            console.warn('[LRM] Routing failed:', err?.message ?? 'No routes returned');
            return;
          }

          const line = L.polyline(routes[0].coordinates, {
            color: '#2563eb',
            weight: 5,
            opacity: 0.85,
            lineJoin: 'round' as any,
            lineCap: 'round' as any,
          });

          line.addTo(map);
          routeLayerRef.current = line;
        }
      );
    })();

    return () => {
      cancelled = true;
      if (routeLayerRef.current) {
        try {
          map.removeLayer(routeLayerRef.current);
        } catch {
          /* stale ref */
        }
        routeLayerRef.current = null;
      }
    };
  }, [map, positions]);

  return null;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CarRentalViewLocationPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const carRentalId = Number(id);

  const { data, isLoading, isError } = useGetDeviceByCarRental(carRentalId, {
    query: { enabled: !!carRentalId },
  });

  const device = data?.data;

  /** All historical lat/lng pairs, oldest → newest. */
  const positions = useMemo<[number, number][]>(() => {
    if (!device?.locations?.length) return [];
    return device.locations.map(
      (loc) => [Number(loc.latitude), Number(loc.longitude)] as [number, number]
    );
  }, [device]);

  /** Latest known position */
  const latestPosition = useMemo<[number, number] | null>(() => {
    if (device?.latest_location) {
      return [Number(device.latest_location.latitude), Number(device.latest_location.longitude)];
    }
    return positions.length ? positions[positions.length - 1] : null;
  }, [device, positions]);

  const hasLocations = positions.length > 0;

  /** Process, reverse, and enrich history records to display nicely within the custom Table structure */
  const tableData = useMemo(() => {
    if (!device?.locations) return [];
    const totalCount = device.locations.length;
    return [...device.locations].reverse().map((loc, idx) => ({
      ...loc,
      displayIndex: totalCount - idx,
      isLatest: loc.id === device.latest_location?.id,
    }));
  }, [device?.locations, device?.latest_location?.id]);

  /** Column setups mapped strictly against properties extracted in tableData hook */
  const columns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'displayIndex',
        label: '#',
        render: (value, row) => (
          <span className="font-mono text-xs text-muted-foreground">
            {value}
            {row.isLatest && (
              <Badge variant="default" className="ml-1 px-1 py-0 text-[10px]">
                latest
              </Badge>
            )}
          </span>
        ),
      },
      {
        key: 'latitude',
        label: 'Latitude',
        render: (value) => <span className="font-mono">{Number(value).toFixed(6)}</span>,
      },
      {
        key: 'longitude',
        label: 'Longitude',
        render: (value) => <span className="font-mono">{Number(value).toFixed(6)}</span>,
      },
      {
        key: 'created_at',
        label: 'Timestamp',
        render: (value) => <span className="text-xs text-muted-foreground">{fmt(value)}</span>,
      },
    ],
    []
  );

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <PageLayout
        title="View Device Location"
        description="Track the GPS device assigned to this car rental."
        withBack
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[520px] w-full rounded-xl" />
        </div>
      </PageLayout>
    );
  }

  // ── No device ──────────────────────────────────────────────────────────────
  if (isError || !device) {
    return (
      <PageLayout
        title="View Device Location"
        description="Track the GPS device assigned to this car rental."
        withBack
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Wifi className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-center text-muted-foreground">
              No GPS device is assigned to this car rental, or the device has not reported any
              location yet.
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="View Device Location"
      description="Track the GPS device assigned to this car rental."
      withBack
    >
      <div className="space-y-6">
        {/* ── Device Info ──────────────────────────────────────────────────── */}
        {/* ── Device Info ──────────────────────────────────────────────────── */}
        <Card className="border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-500/10">
                <Radio className="h-4 w-4 text-cyan-500" />
              </div>
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Device ID */}
              <div className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/30">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Hash className="h-3.5 w-3.5" />
                  Device ID
                </p>
                <p className="font-mono text-sm font-semibold">{device.id}</p>
              </div>

              {/* Identifier */}
              <div className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/30">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  Identifier
                </p>
                <p
                  className="font-mono text-sm font-semibold truncate"
                  title={device.device_identifier}
                >
                  {device.device_identifier}
                </p>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/30">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Signal className="h-3.5 w-3.5" />
                  Status
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="relative flex h-2.5 w-2.5">
                    {hasLocations && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span
                      className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                        hasLocations ? 'bg-emerald-500' : 'bg-muted-foreground'
                      }`}
                    ></span>
                  </span>
                  <span className="text-sm font-semibold leading-none">
                    {hasLocations ? 'Active Tracking' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Total Pings */}
              <div className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/30">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  Total Pings
                </p>
                <p className="text-sm font-semibold">{device.locations?.length ?? 0}</p>
              </div>
            </div>

            {/* Latest Location Sub-section */}
            {latestPosition && (
              <div className="mt-4 rounded-lg border border-border/50 bg-blue-50/50 p-4 dark:bg-blue-950/10">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <h4 className="text-sm font-semibold text-foreground">Latest Known Position</h4>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Compass className="h-3 w-3" /> Latitude
                    </p>
                    <p className="mt-1 font-mono text-sm font-medium">
                      {latestPosition[0].toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Compass className="h-3 w-3" /> Longitude
                    </p>
                    <p className="mt-1 font-mono text-sm font-medium">
                      {latestPosition[1].toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> Last Updated
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {fmt(device.latest_location?.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Map ──────────────────────────────────────────────────────────── */}
        <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Navigation className="h-5 w-5 text-blue-500" />
              Live Map
              {hasLocations && (
                <Badge variant="outline" className="ml-2 gap-1 text-xs">
                  <Activity className="h-3 w-3" />
                  Road-matched via OSRM
                </Badge>
              )}
              {!hasLocations && (
                <Badge variant="secondary" className="ml-2">
                  Awaiting first ping
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {hasLocations ? (
              <MapContainer
                center={latestPosition ?? [14.5995, 120.9842]}
                zoom={14}
                style={{ height: '520px', width: '100%' }}
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds positions={positions} />
                <RoutingMachine positions={positions} />

                {positions.slice(0, -1).map(([lat, lng], idx) => (
                  <CircleMarker
                    key={`ping-${idx}`}
                    center={[lat, lng]}
                    radius={4}
                    pathOptions={{
                      color: '#6b7280',
                      fillColor: '#d1d5db',
                      fillOpacity: 1,
                      weight: 1,
                    }}
                  >
                    <Popup>
                      <div className="space-y-0.5 text-xs">
                        <p className="font-medium">Ping #{idx + 1}</p>
                        <p>
                          {lat.toFixed(6)}, {lng.toFixed(6)}
                        </p>
                        <p className="text-muted-foreground">
                          {fmt(device.locations?.[idx]?.created_at)}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {latestPosition && (
                  <CircleMarker
                    center={latestPosition}
                    radius={10}
                    pathOptions={{
                      color: '#fff',
                      fillColor: '#2563eb',
                      fillOpacity: 1,
                      weight: 3,
                    }}
                  >
                    <Popup>
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold text-blue-600">📍 Current Location</p>
                        <p>
                          {latestPosition[0].toFixed(6)}, {latestPosition[1].toFixed(6)}
                        </p>
                        <p className="text-muted-foreground">
                          {fmt(device.latest_location?.updated_at)}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                )}
              </MapContainer>
            ) : (
              <div className="flex h-[520px] flex-col items-center justify-center gap-4 bg-muted/20">
                <MapPin className="h-12 w-12 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No location data received from this device yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Location History Table ───────────────────────────────────────── */}
        {hasLocations && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <MapPin className="h-5 w-5 text-purple-500" />
              <h3 className="text-base font-semibold text-card-foreground">Location History</h3>
              <Badge variant="outline">{device.locations?.length} records</Badge>
            </div>

            {/* Embedded custom Table component */}
            <Table
              columns={columns}
              data={tableData}
              showPagination={true}
              pageSize={10}
              className="border border-border/50 bg-card/80"
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
}
