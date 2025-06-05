import React, { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import polyline from "@mapbox/polyline";
import "maplibre-gl/dist/maplibre-gl.css";
import "./App.css";
import "./Schedules.css";

const MBTAMap = () => {
  const [selectedLine, setSelectedLine] = useState("All");
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const routes = ["Orange", "Blue", "Red", "Green-B", "Green-C", "Green-D", "Green-E"];

  const formatTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDirection = (directionId) => {
    return directionId === 0 ? "Outbound" : "Inbound";
  };

  let map;
  let trainMarkers = {};
  let routeLayers = {}; 

  useEffect(() => {
    map = new maplibregl.Map({
      container: "map",
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [-71.0589, 42.3601], // Centered on Boston, MA
      zoom: 12,
      maxBounds: [
        [-73.5, 41], // Southwest bound of Massachusetts region
        [-69.9, 43], // Northeast bound of Massachusetts region
      ],
    });

    map.addControl(new maplibregl.NavigationControl(), "top-left");

    const lineColors = {
      Orange: "#FFA500",
      Blue: "#0000FF",
      Red: "#FF0000",
      "Green-B": "#006400",
      "Green-C": "#32CD32",
      "Green-D": "#228B22",
      "Green-E": "#00FF00",
    };

    const animateMarker = (marker, startLngLat, endLngLat, duration = 1000) => {
      const [startLng, startLat] = startLngLat;
      const [endLng, endLat] = endLngLat;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const t = Math.min(elapsedTime / duration, 1);

        const currentLng = startLng + t * (endLng - startLng);
        const currentLat = startLat + t * (endLat - startLat);

        marker.setLngLat([currentLng, currentLat]);

        if (t < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    const addActiveTrains = async () => {
      try {
        const response = await fetch(
          "https://api-v3.mbta.com/vehicles?filter[route_type]=0,1&api_key=377b11db5f0c4c75af2b5aea0f0efa81"
        );
        const data = await response.json();

        const updatedTrainIds = new Set();

        data.data.forEach((vehicle) => {
          const trainId = vehicle.id;
          const newLngLat = [vehicle.attributes.longitude, vehicle.attributes.latitude];
          const routeId = vehicle.relationships.route.data.id;
          const trainInfo = `Train ${trainId}: ${vehicle.attributes.current_status}`;

          // Only show the train if it matches selectedLine or if "All"
          if (selectedLine === "All" || selectedLine === routeId) {
            updatedTrainIds.add(trainId);

            if (trainMarkers[trainId]) {
              const existingMarker = trainMarkers[trainId];
              const currentLngLat = existingMarker.getLngLat().toArray();
              animateMarker(existingMarker, currentLngLat, newLngLat);
              existingMarker.getPopup().setText(trainInfo);
            } else {
              const newMarker = new maplibregl.Marker({
                color: lineColors[routeId] || "blue",
              })
                .setLngLat(newLngLat)
                .setPopup(new maplibregl.Popup().setText(trainInfo))
                .addTo(map);

              trainMarkers[trainId] = newMarker;
            }
          }
        });

        // Remove markers of trains not in updatedTrainIds
        Object.keys(trainMarkers).forEach((trainId) => {
          if (!updatedTrainIds.has(trainId)) {
            trainMarkers[trainId].remove();
            delete trainMarkers[trainId];
          }
        });
      } catch (error) {
        console.error("Error fetching active trains:", error);
      }
    };

    const fetchRoutes = async (route) => {
      try {
        const response = await fetch(
          `https://api-v3.mbta.com/shapes?filter[route]=${route}&api_key=377b11db5f0c4c75af2b5aea0f0efa81`
        );
        const data = await response.json();

        
        data.data.forEach((shape) => {
          const polylineString = shape.attributes.polyline;
          const decodedCoordinates = polyline
            .decode(polylineString)
            .map(([lat, lng]) => [lng, lat]);

          
          const sourceId = `route-${shape.id}`;
          const layerId = `route-layer-${shape.id}`;

          map.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: { route }, 
              geometry: {
                type: "LineString",
                coordinates: decodedCoordinates,
              },
            },
          });

          map.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": lineColors[route] || "#FFFFFF",
              "line-width": 4,
            },
          });

          
          if (!routeLayers[route]) routeLayers[route] = [];
          routeLayers[route].push(layerId);
        });

        applyRouteFilter(selectedLine);
      } catch (error) {
        console.error(`Error fetching routes for ${route}:`, error);
      }
    };

    const fetchSchedules = async (route) => {
      try {
        const now = new Date();
        const currentTime = now
          .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
          .replace(":", "%3A");
        const fiveMinutesLater = new Date(now.getTime() + 10 * 60000)
          .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
          .replace(":", "%3A");

        const response = await fetch(
          `https://api-v3.mbta.com/schedules?filter[route]=${route}&filter[min_time]=${currentTime}&filter[max_time]=${fiveMinutesLater}&api_key=377b11db5f0c4c75af2b5aea0f0efa81`
        );
        const data = await response.json();

        const routeSchedules = data.data.map((schedule) => {
          const attrs = schedule.attributes;
          return {
            stopId: schedule.relationships.stop.data.id,
            arrivalTime: attrs.arrival_time,
            departureTime: attrs.departure_time,
            direction: getDirection(attrs.direction_id),
            status: attrs.status || "N/A",
            route: route,
          };
        });

        setScheduleDetails((prevDetails) => ({
          ...prevDetails,
          [route]: routeSchedules,
        }));
      } catch (error) {
        console.error(`Error fetching schedules for ${route}:`, error);
      }
    };

    map.on("load", () => {
      routes.forEach((r) => {
        fetchRoutes(r);
        fetchSchedules(r);
      });
      addActiveTrains();
    });

    const interval = setInterval(() => addActiveTrains(), 5000);

    return () => {
      clearInterval(interval);
      map.remove();
    };
    
  }, []);

  
  const applyRouteFilter = (line) => {
    if (!map || !routeLayers) return;
    
    if (line === "All") {
      for (const r in routeLayers) {
        routeLayers[r].forEach((layerId) => {
          map.setLayoutProperty(layerId, "visibility", "visible");
        });
      }
    } else {
      
      for (const r in routeLayers) {
        routeLayers[r].forEach((layerId) => {
          map.setLayoutProperty(
            layerId,
            "visibility",
            r === line ? "visible" : "none"
          );
        });
      }
    }
  };

  const handleLineChange = (e) => {
    const line = e.target.value;
    setSelectedLine(line);
    applyRouteFilter(line);
  };

  return (
    <div className="app-container">
    {/* 
      <header className="header-bar">
        <h1>MBTA Tracker</h1>
      </header>
    */}
      {/* Filter component in top-right corner */}
      <div className="filter-group main">
        <div>Select Line:</div>
        <div>
          <input
            type="radio"
            id="all-lines"
            name="lineFilter"
            value="All"
            checked={selectedLine === "All"}
            onChange={handleLineChange}
          />
          <label htmlFor="all-lines">All</label>
        </div>
        {routes.map((r) => (
          <div key={r}>
            <input
              type="radio"
              id={r}
              name="lineFilter"
              value={r}
              checked={selectedLine === r}
              onChange={handleLineChange}
            />
            <label htmlFor={r}>{r}</label>
          </div>
        ))}
      </div>

      <div className="content-container">
        <div id="map" className="map"></div>
        <aside className="sidebar">
          <h2>Schedules</h2>
          {["All", ...routes].map((route) => {
            
            if (selectedLine !== "All" && selectedLine !== route) return null;
            if (route === "All") return null; 

            return (
              <div key={route} className="route-schedule">
                <h3>{route} Line</h3>
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Stop ID</th>
                      <th>Arrival</th>
                      <th>Departure</th>
                      <th>Direction</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleDetails[route] && scheduleDetails[route].length > 0 ? (
                      scheduleDetails[route].map((schedule, index) => (
                        <tr key={index}>
                          <td>{schedule.stopId}</td>
                          <td>{formatTime(schedule.arrivalTime)}</td>
                          <td>{formatTime(schedule.departureTime)}</td>
                          <td>{schedule.direction}</td>
                          <td>{schedule.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">No trains in the next 10 minutes</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })}
        </aside>
      </div>
    </div>
  );
};

export default MBTAMap;
