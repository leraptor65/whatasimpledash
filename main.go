package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// API Routes
	http.HandleFunc("/api/config", ConfigHandler)
    http.HandleFunc("/api/files/", FilesHandler)
	http.HandleFunc("/api/icons", IconsHandler) // Backward compatibility
    // Serve images/files directly
    http.Handle("/api/images/", http.StripPrefix("/api/images/", http.FileServer(http.Dir("public"))))
	http.HandleFunc("/api/weather", WeatherHandler)

	// Serve static files from "public" directory (where Next.js 'out' builds to in our Container)
	// In Docker, we copy 'out' to 'public'. Locally, we might want to target 'out' directly if running 'go run .'
	// But let's assume 'public' for consistency with our FileHandlers which write there.
	// Actually, wait. Next.js export puts everything in 'out'.
	// In Docker we copy 'out' -> './public'.
	// So we serve './public'.
    
    fs := http.FileServer(http.Dir("./public"))
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // If path exists, serve it
        path := "./public" + r.URL.Path
        if _, err := os.Stat(path); err == nil {
             // If it's a directory, try serving index.html inside it/default behavior
             // But FileServer handles that.
             // We just need to intercept 404s for SPA routing if using client-side routing.
             // But this app is mostly single page or hash based?
             // Actually Next.js export creates .html files for pages.
             // e.g. /settings -> /settings.html
             
            // Check if it's a directory check for index.html
            info, _ := os.Stat(path)
            if info.IsDir() {
                 if _, err := os.Stat(path + "/index.html"); err == nil {
                     fs.ServeHTTP(w, r)
                     return
                 }
            } else {
                fs.ServeHTTP(w, r)
                return
            }
        }
        
        // Try appending .html
        if _, err := os.Stat(path + ".html"); err == nil {
             http.ServeFile(w, r, path + ".html")
             return
        }

        // Fallback to index.html for SPA (though Next exports individual pages, so maybe not strictly needed for page routes if we use trailing slash or extensions)
        // But for dynamic routes, we might need it. This app doesn't have many.
        // Let's just default to fs which returns 404 if not found, unless we prefer SPA fallback.
        // For simplicity, let's serve index.html on 404 for client-side routing to take over?
        // Actually, Next.js static export generates separate HTML files.
        // /settings -> settings.html
        // We should try to serve that.
        
        // Let's rely on standard FileServer for now, but wrapped to try .html
        fs.ServeHTTP(w, r)
    })

	fmt.Printf("Starting server on :%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
