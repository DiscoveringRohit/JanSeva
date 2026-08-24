"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/context/app-context";
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  Sparkles,
  RefreshCw,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  isDay: boolean;
  locationName: string;
  dailyMessage: string;
}

export function WeatherWidget() {
  const { user } = useApp();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Weather code interpreter based on WMO standards
  const interpretWeatherCode = (code: number, isDay: boolean, temp: number) => {
    let condition = "Clear Sky";
    let message = "Bright & clear skies! Great day to explore your neighborhood and support local civic repairs. ☀️";

    if (code === 0) {
      condition = isDay ? "Sunny" : "Clear Night";
      message = isDay 
        ? "Sunny & bright in your city! Great day for outdoor walks and checking local community improvements. ☀️"
        : "Pleasant clear evening! A calm night to review your ward's resolved tickets. 🌙";
    } else if (code >= 1 && code <= 3) {
      condition = code === 1 ? "Mainly Clear" : code === 2 ? "Partly Cloudy" : "Overcast";
      message = "Mild & pleasant skies today! Perfect time to snap and report any neighborhood fixes. ⛅";
    } else if (code >= 45 && code <= 48) {
      condition = "Foggy";
      message = "Reduced visibility due to fog. Drive safely and keep an eye on streetlights! 🌫️";
    } else if (code >= 51 && code <= 55) {
      condition = "Light Drizzle";
      message = "Light rain in the area. Watch out for slick pedestrian pavements. 🌦️";
    } else if (code >= 61 && code <= 67) {
      condition = "Rain";
      message = "Rain showers expected today. Help spot any blocked drains or water logging near intersections! 🌧️";
    } else if (code >= 80 && code <= 82) {
      condition = "Heavy Rain";
      message = "Heavy rain alert! Stay safe indoors and report any severe water logging for fast-track dispatch. ⛈️";
    } else if (code >= 95 && code <= 99) {
      condition = "Thunderstorm";
      message = "Thunderstorms active. Avoid open electrical poles and report fallen tree branches promptly. ⚡";
    }

    if (temp > 35) {
      message = "High heat warning today. Stay well hydrated and check on open water cooler points in your ward! 🌡️";
    }

    return { condition, message };
  };

  const fetchWeather = async () => {
    setRefreshing(true);

    // Default coordinates (Bhubaneswar, Odisha)
    let lat = 20.2961;
    let lng = 85.8245;
    let locName = user?.city ? `${user.city}` : "Bhubaneswar";
    if (user?.wardNumber) {
      locName += ` • Ward ${user.wardNumber}`;
    }

    const loadWeatherForCoords = async (latitude: number, longitude: number, placeName?: string) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        if (data && data.current) {
          const current = data.current;
          const { condition, message } = interpretWeatherCode(
            current.weather_code,
            Boolean(current.is_day),
            Math.round(current.temperature_2m)
          );

          setWeather({
            temp: Math.round(current.temperature_2m),
            feelsLike: Math.round(current.apparent_temperature),
            humidity: current.relative_humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m),
            weatherCode: current.weather_code,
            condition,
            isDay: Boolean(current.is_day),
            locationName: placeName || locName,
            dailyMessage: message,
          });
        }
      } catch (err) {
        console.warn("Weather fetch error, using fallback:", err);
        // Fallback simulation if network is offline
        setWeather({
          temp: 28,
          feelsLike: 30,
          humidity: 65,
          windSpeed: 12,
          weatherCode: 1,
          condition: "Partly Cloudy",
          isDay: true,
          locationName: locName,
          dailyMessage: "Pleasant weather in your ward today! Great day to track active civic initiatives and cast your votes. 🍃",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    // Try browser geolocation first for 100% real location
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          // Reverse geocode via free OSM Nominatim if possible
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json`,
              { headers: { "Accept-Language": "en" } }
            );
            const geoData = await geoRes.json();
            const detectedCity = geoData.address?.city || geoData.address?.town || geoData.address?.suburb || geoData.address?.state_district || user?.city || "Current Location";
            loadWeatherForCoords(userLat, userLng, detectedCity);
          } catch {
            loadWeatherForCoords(userLat, userLng, user?.city || "Your Location");
          }
        },
        () => {
          // If denied, use default coordinates
          loadWeatherForCoords(lat, lng, locName);
        },
        { timeout: 5000 }
      );
    } else {
      loadWeatherForCoords(lat, lng, locName);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [user?.city, user?.wardNumber]);

  // Weather Icon Component Selector
  const getWeatherIcon = (code: number, isDay: boolean) => {
    if (code === 0) {
      return isDay ? <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" /> : <Sparkles className="w-8 h-8 text-indigo-400" />;
    }
    if (code >= 1 && code <= 3) {
      return <CloudSun className="w-8 h-8 text-amber-400" />;
    }
    if (code >= 51 && code <= 67) {
      return <CloudRain className="w-8 h-8 text-sky-500" />;
    }
    if (code >= 80 && code <= 82) {
      return <CloudRain className="w-8 h-8 text-blue-600" />;
    }
    if (code >= 95) {
      return <CloudLightning className="w-8 h-8 text-amber-500" />;
    }
    return <Cloud className="w-8 h-8 text-slate-400" />;
  };

  if (loading) {
    return (
      <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm flex items-center justify-center min-h-[160px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 rounded-full border-2 border-emerald-300 border-t-emerald-600 animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">Detecting local weather...</span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-white via-[#fcfdfd] to-[#f4f9f7] border border-slate-200/80 p-5 shadow-sm space-y-4 relative overflow-hidden group">
      
      {/* Soft Ambient Corner Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-100/40 rounded-full blur-2xl pointer-events-none"></div>

      {/* Top Header: Location & Refresh */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <MapPin className="w-3.5 h-3.5 text-[#0f5b49]" />
          <span className="truncate max-w-[170px]">{weather.locationName}</span>
        </div>

        <button
          type="button"
          onClick={fetchWeather}
          disabled={refreshing}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Refresh weather"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin text-emerald-600")} />
        </button>
      </div>

      {/* Main Temp & Condition Showcase */}
      <div className="flex items-center justify-between relative z-10 pt-1">
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-1">
            <span className="font-headline font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
              {weather.temp}°
            </span>
            <span className="text-xs font-bold text-slate-500">C</span>
          </div>
          <p className="text-xs font-bold text-[#0f5b49]">
            {weather.condition}
          </p>
        </div>

        <div className="flex flex-col items-center">
          {getWeatherIcon(weather.weatherCode, weather.isDay)}
          <span className="text-[10px] text-slate-400 font-medium mt-1">
            Feels {weather.feelsLike}°C
          </span>
        </div>
      </div>

      {/* Weather Stats Pill: Humidity & Wind */}
      <div className="grid grid-cols-2 gap-2 py-2 px-3 rounded-2xl bg-white border border-slate-100 shadow-2xs relative z-10">
        <div className="flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <div>
            <p className="text-[9px] text-slate-400 font-medium">Humidity</p>
            <p className="text-xs font-bold text-slate-800">{weather.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wind className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <div>
            <p className="text-[9px] text-slate-400 font-medium">Wind Speed</p>
            <p className="text-xs font-bold text-slate-800">{weather.windSpeed} km/h</p>
          </div>
        </div>
      </div>

      {/* Daily Civic Message for their Day */}
      <div className="p-3 rounded-2xl bg-[#edf7f1] border border-[#d6ecdf] space-y-1 relative z-10">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-[#134431] uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Daily Civic Note</span>
        </div>
        <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
          {weather.dailyMessage}
        </p>
      </div>

    </div>
  );
}
