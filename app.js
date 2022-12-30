const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

module.exports = app;

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`Database Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDbServer();

app.get("/movies/", async (request, response) => {
  const moviesQuery = `
    SELECT *
    FROM movie;`;
  const dbResponse = await db.all(moviesQuery);
  console.log(dbResponse);
  let moviesArray = [];
  const convertDbObjToResponseObj = (dbObj) => {
    return {
      movieName: `${dbObj.movie_name}`,
    };
  };
  for (let dbObj of dbResponse) {
    const responseObj = convertDbObjToResponseObj(dbObj);
    moviesArray.push(responseObj);
  }
  response.send(moviesArray);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const postQuery = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  const dbResponse = await db.run(postQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId};`;
  const dbObj = await db.get(movieQuery);
  const convertDbObjToResponseObj = (dbObj) => {
    return {
      movieId: dbObj.movie_id,
      directorId: dbObj.director_id,
      movieName: dbObj.movie_name,
      leadActor: dbObj.lead_actor,
    };
  };
  const responseObj = convertDbObjToResponseObj(dbObj);
  response.send(responseObj);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateQuery = `
    UPDATE movie
    SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  const dbResponse = await db.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`;
  const dbResponse = await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const directorsQuery = `
    SELECT *
    FROM director;`;
  const dbResponse = await db.all(directorsQuery);
  let directorsArray = [];
  const convertDbObjToResponseObj = (dbObj) => {
    return {
      directorId: dbObj.director_id,
      directorName: `${dbObj.director_name}`,
    };
  };
  for (let dbObj of dbResponse) {
    const responseObj = convertDbObjToResponseObj(dbObj);
    directorsArray.push(responseObj);
  }
  response.send(directorsArray);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMoviesQuery = `
    SELECT movie_name
    FROM movie
    WHERE director_id = ${directorId};`;
  const dbResponse = await db.all(directorMoviesQuery);
  let moviesArray = [];
  const convertDbObjToResponseObj = (dbObj) => {
    return {
      movieName: `${dbObj.movie_name}`,
    };
  };
  for (let dbObj of dbResponse) {
    const responseObj = convertDbObjToResponseObj(dbObj);
    moviesArray.push(responseObj);
  }
  response.send(moviesArray);
});
