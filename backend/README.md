# Bookworm backend

### 1. Introduction
Technology stack:
- Python 3.12
- FastAPI
- PostgreSQL
- Docker

### 2. Installation
On your local machine, run the following command to start the backend:
```bash
docker-compose up
```
This will start the backend server and the PostgreSQL database. The backend server will be available at `http://localhost:8000`. 
Before that, if you need setup fake data, you can uncomment the line "#CMD \["python", "app/db/seeding.py"]" in Dockerfile. This will run the seeding script to populate the database with fake data.

Another option is to run the backend server without Docker. To do this, you need to install the required dependencies. You can do this by running the following command:
```bash
pip install -r requirements.txt
```
Then, you can run the backend server using the following command:
```bash
python app/db/seeding.py # optional: seed the database with fake data
uvicorn app.main:app
```

### 3. API Documentation
The API documentation is available at `http://localhost:8000/docs`. You can use this documentation to test the API endpoints and see the request and response formats.

For Authentication API, please use Postman or any other API testing tool to test the endpoints. The authentication endpoints are:
- `POST /auth/login`: Login with email and password
- All endpoint begin with `/user`
- `POST /orders`: Create a new order

### 4. Database
The database is a PostgreSQL database. The connection details are available in the `docker-compose.yml` file. The database is created automatically when you start the backend server with Docker. You can also create the database manually by running the following command:
```bash
docker exec -it bookworm-backend-db psql -U postgres
```
This will open a PostgreSQL shell where you can run SQL commands. The database name is `bookworm`, and the user is `postgres` with password `postgres`. You can also use any PostgreSQL client to connect to the database using these details.

