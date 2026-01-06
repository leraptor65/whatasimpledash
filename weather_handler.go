package main

import (
	"io"
	"net/http"
	"net/url"
    "time"
)

// WeatherHandler proxies requests to weather providers to avoid CORS and hide keys if needed
func WeatherHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    query := r.URL.Query()
    provider := query.Get("provider")
    apiKey := query.Get("apiKey") // In a real app we might store this on the backend
    
    // Construct target URL
    var targetURL string
    
    if provider == "openweathermap" {
        params := url.Values{}
        params.Add("lat", query.Get("lat"))
        params.Add("lon", query.Get("lon"))
        params.Add("appid", apiKey)
        params.Add("units", query.Get("units"))
        targetURL = "https://api.openweathermap.org/data/2.5/weather?" + params.Encode()
    } else if provider == "weatherapi" {
        params := url.Values{}
        params.Add("key", apiKey)
        params.Add("q", query.Get("q"))
        targetURL = "https://api.weatherapi.com/v1/current.json?" + params.Encode()
    } else {
        http.Error(w, "Invalid provider", http.StatusBadRequest)
        return
    }

    // Create client with timeout
    client := &http.Client{
        Timeout: 10 * time.Second,
    }

    resp, err := client.Get(targetURL)
    if err != nil {
        http.Error(w, "Failed to contact weather provider", http.StatusBadGateway)
        return
    }
    defer resp.Body.Close()

    // Copy status code and headers
    w.WriteHeader(resp.StatusCode)
    w.Header().Set("Content-Type", "application/json")
    
    // Stream response body directly to client
    io.Copy(w, resp.Body)
}
