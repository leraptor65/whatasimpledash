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
	// Serve user uploads from /public to match Node.js behavior
	http.Handle("/icons/", http.StripPrefix("/icons/", http.FileServer(http.Dir("public/icons"))))
	http.Handle("/backgrounds/", http.StripPrefix("/backgrounds/", http.FileServer(http.Dir("public/backgrounds"))))

	// Keep serving other static assets from public if needed
	http.Handle("/api/images/", http.StripPrefix("/api/images/", http.FileServer(http.Dir("public")))) // Old way

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
			// Check if it's a directory
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

		// Try appending .html (Next.js export)
		if _, err := os.Stat(path + ".html"); err == nil {
			http.ServeFile(w, r, path+".html")
			return
		}

		// If not found, REDIRECT to Home ("/")
		http.Redirect(w, r, "/", http.StatusFound)
	})

	fmt.Printf("Starting server on :%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
