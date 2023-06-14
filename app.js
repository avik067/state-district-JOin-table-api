const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const app = express();
app.use(express.json());
const sqlite3 = require("sqlite3");

let db = null;

const dbPath = path.join(__dirname, "covid19India.db");

/////////
const listenAndinitializeDb = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running at  : http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error :${err.message}`);
    process.exit(1);
  }
};

listenAndinitializeDb();
//////////////////////////////////

//GET all the states

app.get("/states/", async (request, response) => {
  const query = `
   SELECT * 
   FROM state 
   ORDER BY state_id ;
   `;
  const result = await db.all(query);
  let array = [];
  for (let i of result) {
    array.push(convertDbObjectToResponseObject(i));
  }
  response.send(array);
});

// GET the state

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;

  const query = `
   SELECT * 
   FROM state 
   WHERE state_id = ${stateId} ;
   `;
  const result = await db.all(query);
  let array = [];
  for (let i of result) {
    array.push(convertDbObjectToResponseObject(i));
  }
  response.send(...array);
});

// POST a district in tab district
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const addDistrict = `
    INSERT INTO
        district (district_name,state_id ,cases,cured,active,deaths)
    VALUES (
       '${districtName}',
       '${stateId}',
       '${cases}',
       '${cured}',
       '${active}',
       '${deaths}'
    );
   `;
  const responseDb = await db.run(addDistrict);
  response.send("District Successfully Added");
});

// GET the district

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const query = `
   SELECT * 
   FROM district 
   WHERE district_id = ${districtId} ;
   `;
  const result = await db.all(query);
  let array = [];
  for (let i of result) {
    array.push(convertDbObjectToResponseObject_1(i));
  }
  response.send(...array);
});

// DELETE district

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const deleteDistrict = `
    DELETE FROM
        district
    WHERE
      district_id = '${districtId}'
    ;
   `;
  const responseDb = await db.run(deleteDistrict);
  response.send("District Removed");
});

// PUT specific district details on district_id

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const changeDistrict = `
    UPDATE
        district
    SET
      district_name    =  '${districtName}',
      state_id = '${stateId}',
      cases = '${cases}',
      cured = '${cured}',
      active = '${active}',
      deaths = '${deaths}'
    WHERE
      district_id = '${districtId}'
    ;
   `;
  const responseDb = await db.run(changeDistrict);

  response.send("District Details Updated");
});

//GET total statis on JOIN tables staet and district

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;

  const query = `
   SELECT SUM(cases) AS totalCases ,
     SUM (cured) AS totalCured ,
     SUM (active) AS totalActive ,
     SUM (deaths) AS totalDeaths
   FROM state LEFT JOIN district  ON state.state_id = district.state_id
   WHERE state.state_id = ${stateId}
   GROUP BY state.state_id
   ;
   `;
  const result = await db.all(query);

  response.send(...result);
});

// GET state name of dustrict by joininng

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;

  const query = `
   SELECT state.state_name AS stateName 
     
   FROM district JOIN state 
   WHERE district.district_id = ${districtId};
   `;
  const result = await db.all(query);

  response.send(...result);
});

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

const convertDbObjectToResponseObject_1 = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

module.exports = listenAndinitializeDb;
module.exports = app;
