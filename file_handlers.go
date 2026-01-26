package main

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/disintegration/imaging"
)

// FilesHandler handles dynamic file operations (List, Upload, Delete)
// Endpoint: /api/files/{type} or /api/files/{type}/{filename}
func FilesHandler(w http.ResponseWriter, r *http.Request) {
	// Expected path: /api/files/{type}/{optional_filename}
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/files/"), "/")
	if len(parts) == 0 || parts[0] == "" {
		http.Error(w, "Missing file type", http.StatusBadRequest)
		return
	}

	fileType := parts[0] // e.g., "icons", "backgrounds"
	fileName := ""
	if len(parts) > 1 {
		fileName = parts[1] // e.g., "myicon.png"
	}

	// Determine target directory
	targetDir := filepath.Join("public", fileType)

	// Security check: ensure targetDir is within "public"
	if !strings.HasPrefix(targetDir, "public") || strings.Contains(fileType, "..") {
		http.Error(w, "Invalid file type", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		if fileName != "" {
			// Serve specific file (though ImagesHandler usually does this, we can allow it here or 404)
			http.ServeFile(w, r, filepath.Join(targetDir, fileName))
		} else {
			handleListFiles(w, targetDir)
		}
	case http.MethodPost:
		handleUploadFile(w, r, targetDir)
	case http.MethodPut:
		handleRenameFile(w, r, targetDir, fileName)
	case http.MethodDelete:
		if fileName == "" {
			http.Error(w, "Filename required for delete", http.StatusBadRequest)
			return
		}
		handleDeleteFile(w, filepath.Join(targetDir, fileName))
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleRenameFile(w http.ResponseWriter, r *http.Request, dir string, oldName string) {
	if oldName == "" {
		http.Error(w, "Filename required", http.StatusBadRequest)
		return
	}

	var req struct {
		NewName string `json:"newName"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.NewName == "" {
		http.Error(w, "New name required", http.StatusBadRequest)
		return
	}

	// Sanitize new name
	newName := filepath.Base(req.NewName)
	newName = strings.ReplaceAll(newName, "..", "")

	oldPath := filepath.Join(dir, oldName)
	newPath := filepath.Join(dir, newName)

	if err := os.Rename(oldPath, newPath); err != nil {
		w.Header().Set("Content-Type", "application/json")
		// Return error in JSON format as frontend might expect
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "File renamed",
		"newName": newName,
	})
}

func handleListFiles(w http.ResponseWriter, dir string) {
	files, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte("[]"))
			return
		}
		http.Error(w, "Failed to read directory", http.StatusInternalServerError)
		return
	}

	filenames := []string{}
	for _, file := range files {
		if !file.IsDir() && hasImageExtension(file.Name()) {
			filenames = append(filenames, file.Name())
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"files":   filenames,
	})
}

func handleUploadFile(w http.ResponseWriter, r *http.Request, dir string) {
	// Limit upload size to 10MB
	r.ParseMultipartForm(10 << 20)

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	if err := os.MkdirAll(dir, 0755); err != nil {
		http.Error(w, "Failed to create directory", http.StatusInternalServerError)
		return
	}

	filename := filepath.Base(handler.Filename)
	filename = strings.ReplaceAll(filename, "..", "") // prevent directory traversal

	// If uploading to backgrounds, resize to 1920x1080
	if filepath.Base(dir) == "backgrounds" && hasImageExtension(filename) {
		// Create temporary file for original
		tmpFile, err := os.CreateTemp("", "upload-*.tmp")
		if err != nil {
			http.Error(w, "Error creating temp file", http.StatusInternalServerError)
			return
		}
		defer os.Remove(tmpFile.Name()) // clean up

		if _, err := io.Copy(tmpFile, file); err != nil {
			http.Error(w, "Error saving temp file", http.StatusInternalServerError)
			return
		}
		tmpFile.Seek(0, 0) // rewind

		// Decode and resize
		src, err := imaging.Open(tmpFile.Name())
		if err != nil {
			// Failed to decode as image? Just save original (fallback)
			// Reset file pointer probably needed if we want to copy again?
			// Simpler: Just save original from request again?
			// We can't rewind the multipart file easily without re-reading?
			// Actually file.Seek(0, 0) should work if it's an OS file, but it's a multipart file.
			file.Seek(0, 0)

			dstPath := filepath.Join(dir, filename)
			dst, err := os.Create(dstPath)
			if err != nil {
				http.Error(w, "Error creating destination file", http.StatusInternalServerError)
				return
			}
			defer dst.Close()
			io.Copy(dst, file)
		} else {
			// Resize to Fill 1920x1080 (Crop if needed to maintain aspect ratio)
			dstImage := imaging.Fill(src, 1920, 1080, imaging.Center, imaging.Lanczos)

			dstPath := filepath.Join(dir, filename)
			if err := imaging.Save(dstImage, dstPath); err != nil {
				http.Error(w, "Error saving resized image", http.StatusInternalServerError)
				return
			}
		}
	} else {
		// Standard save for non-backgrounds or non-images
		dstPath := filepath.Join(dir, filename)
		dst, err := os.Create(dstPath)
		if err != nil {
			http.Error(w, "Error creating destination file", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, "Error saving file", http.StatusInternalServerError)
			return
		}
	}

	finalPath := filepath.Join(dir, filename)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "File uploaded successfully",
		"path":    finalPath,
	})
}

func handleDeleteFile(w http.ResponseWriter, filePath string) {
	// basic sanitization already done by filepath.Join with clean parts
	if err := os.Remove(filePath); err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to delete file", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "File deleted",
	})
}

// IconsHandler is kept for backward compatibility if /api/icons is called directly
// or we can redirect to FilesHandler
func IconsHandler(w http.ResponseWriter, r *http.Request) {
	// Reuse handleListFiles for "public/icons"
	handleListFiles(w, "public/icons")
}

func hasImageExtension(name string) bool {
	ext := strings.ToLower(filepath.Ext(name))
	switch ext {
	case ".png", ".jpg", ".jpeg", ".svg", ".webp", ".ico":
		return true
	}
	return false
}
