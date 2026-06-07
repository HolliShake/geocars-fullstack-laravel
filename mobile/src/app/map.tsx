import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { Colors } from '@/constants/theme';
import { isTracking } from '@/lib/tracking';

// ─── Leaflet + Leaflet Routing Machine map HTML ───────────────────────────────
const MAP_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map { height: 100%; width: 100%; background: #e8f4f8; }

    /* Pulsing blue dot for current position */
    .pos-icon {
      width: 18px; height: 18px;
      background: #208AEF;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      animation: pulse 2s ease-out infinite;
    }
    @keyframes pulse {
      0%   { box-shadow: 0 0 0 0   rgba(32,138,239,0.5); }
      70%  { box-shadow: 0 0 0 14px rgba(32,138,239,0); }
      100% { box-shadow: 0 0 0 0   rgba(32,138,239,0); }
    }

    /* Accuracy circle */
    .leaflet-routing-container {
      background: rgba(255,255,255,0.92);
      border-radius: 10px;
      padding: 6px 10px;
      font-size: 13px;
      max-height: 200px;
      overflow-y: auto;
    }
    /* Dim the routing close button – keep it but don't clutter */
    .leaflet-routing-collapse-btn { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    // ── State ──────────────────────────────────────────────────────────────────
    var posMarker    = null;
    var posCircle    = null;
    var destMarker   = null;
    var routeCtrl    = null;
    var currentPos   = null;   // { lat, lon }
    var isFirstFix   = true;

    var posIcon = L.divIcon({
      className: 'pos-icon',
      iconSize:   [18, 18],
      iconAnchor: [9,  9]
    });

    // ── Public API called from RN injectJavaScript ─────────────────────────────
    window.updatePosition = function(lat, lon, accuracy) {
      currentPos = { lat: lat, lon: lon };

      if (isFirstFix) {
        map.setView([lat, lon], 16);
        isFirstFix = false;
      }

      // Position marker
      if (!posMarker) {
        posMarker = L.marker([lat, lon], { icon: posIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup('<b>Your location</b>');
      } else {
        posMarker.setLatLng([lat, lon]);
      }

      // Accuracy circle
      if (accuracy && accuracy > 0) {
        if (!posCircle) {
          posCircle = L.circle([lat, lon], {
            radius: accuracy,
            color: '#208AEF',
            fillColor: '#208AEF',
            fillOpacity: 0.10,
            weight: 1
          }).addTo(map);
        } else {
          posCircle.setLatLng([lat, lon]).setRadius(accuracy);
        }
      }

      // Keep routing waypoints up-to-date
      if (routeCtrl && destMarker) {
        routeCtrl.setWaypoints([
          L.latLng(lat, lon),
          destMarker.getLatLng()
        ]);
      }
    };

    window.recenterMap = function() {
      if (currentPos) map.setView([currentPos.lat, currentPos.lon], 16);
    };

    window.clearRoute = function() {
      if (routeCtrl)   { map.removeControl(routeCtrl); routeCtrl = null; }
      if (destMarker)  { map.removeLayer(destMarker);  destMarker = null; }
    };

    // ── Map click → set destination + draw route ────────────────────────────
    map.on('click', function(e) {
      if (!currentPos) return;
      var lat = e.latlng.lat, lon = e.latlng.lng;

      if (destMarker) {
        destMarker.setLatLng([lat, lon]);
      } else {
        destMarker = L.marker([lat, lon])
          .addTo(map)
          .bindPopup('<b>Destination</b>');
      }
      destMarker.openPopup();

      var waypoints = [
        L.latLng(currentPos.lat, currentPos.lon),
        L.latLng(lat, lon)
      ];

      if (routeCtrl) {
        routeCtrl.setWaypoints(waypoints);
      } else {
        routeCtrl = L.Routing.control({
          waypoints: waypoints,
          routeWhileDragging: false,
          addWaypoints: false,
          fitSelectedRoutes: true,
          showAlternatives: false,
          lineOptions: {
            styles: [{ color: '#208AEF', weight: 5, opacity: 0.85 }],
            extendToWaypoints: true,
            missingRouteTolerance: 0
          },
          createMarker: function() { return null; }  // we manage markers ourselves
        }).addTo(map);

        routeCtrl.on('routesfound', function(e) {
          var summary = e.routes[0].summary;
          var km   = (summary.totalDistance / 1000).toFixed(1);
          var mins = Math.round(summary.totalTime / 60);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'routeFound',
              distanceKm: parseFloat(km),
              durationMins: mins
            }));
          }
        });

        routeCtrl.on('routingerror', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'routeError' }));
          }
        });
      }

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'destinationSet',
          latitude: lat,
          longitude: lon
        }));
      }
    });
  </script>
</body>
</html>`;

// ─── Component ────────────────────────────────────────────────────────────────
type RouteInfo = { distanceKm: number; durationMins: number } | null;

export default function MapScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const webViewRef = useRef<WebView>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const lastPos = useRef<{ lat: number; lon: number } | null>(null);

  const [permGranted, setPermGranted] = useState<boolean | null>(null);
  const [hasRoute, setHasRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [webReady, setWebReady] = useState(false);

  // ── Inject GPS fix into the WebView ────────────────────────────────────────
  const injectPosition = useCallback(
    (lat: number, lon: number, accuracy?: number) => {
      lastPos.current = { lat, lon };
      if (!webReady) return;
      webViewRef.current?.injectJavaScript(
        `window.updatePosition(${lat}, ${lon}, ${accuracy ?? 0}); true;`
      );
    },
    [webReady]
  );

  // ── Start foreground location watcher ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermGranted(status === 'granted');
      if (status !== 'granted') return;

      // Immediate fix
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      injectPosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy ?? undefined);

      // Continuous watcher (high frequency while map is open)
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000,
          distanceInterval: 3,
        },
        (loc) =>
          injectPosition(
            loc.coords.latitude,
            loc.coords.longitude,
            loc.coords.accuracy ?? undefined
          )
      );
    })();

    return () => {
      watchRef.current?.remove();
    };
  }, [injectPosition]);

  // ── Replay last known position once WebView reports ready ──────────────────
  useEffect(() => {
    if (webReady && lastPos.current) {
      injectPosition(lastPos.current.lat, lastPos.current.lon);
    }
  }, [webReady, injectPosition]);

  // ── Poll background tracking state ────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const check = () =>
      isTracking()
        .then((v) => {
          if (mounted) setTrackingActive(v);
        })
        .catch(() => {});
    check();
    const id = setInterval(check, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // ── Messages from WebView ──────────────────────────────────────────────────
  const onMessage = useCallback((e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data) as {
        type: string;
        distanceKm?: number;
        durationMins?: number;
      };
      if (msg.type === 'destinationSet') setHasRoute(true);
      if (msg.type === 'routeFound') {
        setRouteInfo({ distanceKm: msg.distanceKm!, durationMins: msg.durationMins! });
      }
      if (msg.type === 'routeError') setRouteInfo(null);
    } catch {}
  }, []);

  const handleRecenter = () => {
    webViewRef.current?.injectJavaScript('window.recenterMap(); true;');
  };

  const handleClearRoute = () => {
    webViewRef.current?.injectJavaScript('window.clearRoute(); true;');
    setHasRoute(false);
    setRouteInfo(null);
  };

  // ── Permission denied ──────────────────────────────────────────────────────
  if (permGranted === false) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, textAlign: 'center', padding: 24 }}>
          Location permission is required to show the map.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* ── Map WebView ──────────────────────────────────────────────────── */}
      <WebView
        ref={webViewRef}
        source={{ html: MAP_HTML }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsInlineMediaPlayback
        onLoadEnd={() => setWebReady(true)}
        onMessage={onMessage}
        renderLoading={() => (
          <View style={[styles.center, styles.loadingOverlay]}>
            <ActivityIndicator size="large" color="#208AEF" />
            <Text style={styles.loadingText}>Loading map…</Text>
          </View>
        )}
        startInLoadingState
      />

      {/* ── Tracking badge ───────────────────────────────────────────────── */}
      <SafeAreaView style={styles.safeTop} edges={['top']} pointerEvents="box-none">
        <View style={styles.topBar}>
          <View
            style={[
              styles.trackingBadge,
              { backgroundColor: trackingActive ? '#16A34A' : '#6B7280' },
            ]}
          >
            <View style={styles.trackingDot} />
            <Text style={styles.trackingText}>
              {trackingActive ? 'Background tracking ON' : 'Background tracking OFF'}
            </Text>
          </View>

          {routeInfo && (
            <View style={styles.routeInfoBadge}>
              <Text style={styles.routeInfoText}>
                {routeInfo.distanceKm} km · {routeInfo.durationMins} min
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* ── Floating action buttons ──────────────────────────────────────── */}
      <SafeAreaView style={styles.safeBottom} edges={['bottom']} pointerEvents="box-none">
        <View style={styles.fabRow}>
          {hasRoute && (
            <Pressable
              style={({ pressed }) => [
                styles.fab,
                styles.fabSecondary,
                pressed && styles.fabPressed,
              ]}
              onPress={handleClearRoute}
            >
              <Text style={styles.fabText}>✕ Clear Route</Text>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [styles.fab, styles.fabPrimary, pressed && styles.fabPressed]}
            onPress={handleRecenter}
          >
            <Text style={styles.fabText}>⊙ Recenter</Text>
          </Pressable>
        </View>

        {!hasRoute && (
          <Text style={styles.hint}>Tap the map to set a destination and get directions</Text>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#e8f4f8',
    gap: 12,
  },
  loadingText: { color: '#208AEF', fontSize: 14, fontWeight: '600' },

  // Top bar
  safeTop: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    alignItems: 'flex-start',
  },
  trackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  trackingText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  routeInfoBadge: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  routeInfoText: { color: '#208AEF', fontSize: 13, fontWeight: '700' },

  // Bottom FABs
  safeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  fabRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  fab: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  fabPrimary: { backgroundColor: '#208AEF' },
  fabSecondary: { backgroundColor: '#DC2626' },
  fabPressed: { opacity: 0.8 },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  hint: {
    textAlign: 'center',
    color: '#374151',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
  },
});
