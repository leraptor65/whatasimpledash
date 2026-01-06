package main

import (
    "encoding/json"
	"io"
    "net/http"
    "os"
    "path/filepath"
    "sync"

    "gopkg.in/yaml.v3"
)

var (
    configPath = "config/services.yml"
    configLock sync.RWMutex
)

// ConfigHandler handles GET and POST requests for the configuration
func ConfigHandler(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodGet:
        handleGetConfig(w, r)
    case http.MethodPost:
        handlePostConfig(w, r)
    default:
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
    }
}

func handleGetConfig(w http.ResponseWriter, r *http.Request) {
    configLock.RLock()
    defer configLock.RUnlock()

    // Check if config exists, if not try inputting sample
    if _, err := os.Stat(configPath); os.IsNotExist(err) {
        // Try to copy sample if exists
        if _, err := os.Stat("config.sample.yml"); err == nil {
            input, _ := os.ReadFile("config.sample.yml")
            os.WriteFile(configPath, input, 0644)
        } else {
             // If no sample, return empty yaml object
             w.Header().Set("Content-Type", "application/x-yaml")
             w.Write([]byte("{}\n"))
             return
        }
    }

    data, err := os.ReadFile(configPath)
    if err != nil {
        http.Error(w, "Failed to read config", http.StatusInternalServerError)
        return
    }

    // Convert YAML to JSON dynamically
    var config interface{}
    if err := yaml.Unmarshal(data, &config); err != nil {
        http.Error(w, "Failed to parse YAML config", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(config); err != nil {
        http.Error(w, "Failed to encode generic JSON", http.StatusInternalServerError)
    }
}

func handlePostConfig(w http.ResponseWriter, r *http.Request) {
    configLock.Lock()
    defer configLock.Unlock()

    body, err := io.ReadAll(r.Body)
    if err != nil {
        http.Error(w, "Failed to read body", http.StatusBadRequest)
        return
    }
    defer r.Body.Close()

    // Validate YAML
    var node yaml.Node
    if err := yaml.Unmarshal(body, &node); err != nil {
         http.Error(w, "Invalid YAML format", http.StatusBadRequest)
         return
    }

    // Ensure directory exists
    dir := filepath.Dir(configPath)
    if err := os.MkdirAll(dir, 0755); err != nil {
        http.Error(w, "Failed to create config directory", http.StatusInternalServerError)
        return
    }

    if err := os.WriteFile(configPath, body, 0644); err != nil {
        http.Error(w, "Failed to write config", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte("Config saved"))
}
