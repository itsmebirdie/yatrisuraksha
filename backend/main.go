package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
	"github.com/google/uuid"
)

type Tourist struct {
	GovernmentID   string          `json:"government_id"`
	Nationality    string          `json:"nationality"`
	FirstName      string          `json:"first_name"`
	LastName       string          `json:"last_name"`
	FamilyContacts json.RawMessage `json:"family_contacts"`
}

type Response struct {
	DID     string `json:"did"`
	Message string `json:"message"`
}

var db *sql.DB

func main() {
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	var err error
	for i := 0; i < 10; i++ {
		db, err = sql.Open("postgres", connStr)
		if err != nil {
			log.Printf("Error opening database: %v. Retrying in 5 seconds...", err)
			time.Sleep(5 * time.Second)
			continue
		}

		err = db.Ping()
		if err == nil {
			log.Println("Successfully connected to the database!")
			break
		}

		log.Printf("Error pinging database: %v. Retrying in 5 seconds...", err)
		db.Close()
		time.Sleep(5 * time.Second)
	}

	if err != nil {
		log.Fatalf("Could not connect to the database after multiple retries: %v", err)
	}

	http.HandleFunc("/register-tourist", registerTourist)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server is running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func registerTourist(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	var tourist Tourist
	err := json.NewDecoder(r.Body).Decode(&tourist)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	did := "did:tourist:" + uuid.New().String()

	sqlStatement := `
	INSERT INTO tourists (did, government_id, nationality, first_name, last_name, family_contacts)
	VALUES ($1, $2, $3, $4, $5, $6)
	ON CONFLICT (government_id) DO UPDATE
	SET
		did = EXCLUDED.did,
		nationality = EXCLUDED.nationality,
		first_name = EXCLUDED.first_name,
		last_name = EXCLUDED.last_name,
		family_contacts = EXCLUDED.family_contacts;
	`
	_, err = db.Exec(sqlStatement,
		did,
		tourist.GovernmentID,
		tourist.Nationality,
		tourist.FirstName,
		tourist.LastName,
		tourist.FamilyContacts,
	)
	if err != nil {
		log.Printf("Error inserting tourist: %v", err)
		http.Error(w, "Could not register tourist", http.StatusInternalServerError)
		return
	}

	response := Response{
		DID:     did,
		Message: "Tourist registered successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	log.Printf("Registered new tourist with DID: %s", did)
}