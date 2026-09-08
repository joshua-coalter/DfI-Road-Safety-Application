const form = document.getElementById("collisionForm");
const message = document.getElementById("message");
const output = document.getElementById("output");
const submit = document.getElementById("collisionsSubmitBtn");

const escapeSql = (value) => {
       return value.replace(/'/g, "''");
    }

    const showMessage = (text, type) => {
      const messageBox = document.querySelector("#message");
      messageBox.textContent = text;
      messageBox.className = `message ${type}`;
    };

// Setup connection.
const Query = async (sql) => {
      try {
        // This is the PHP file that receives the SQL and talks to the database.
        const url = "https://jcoalter04.webhosting1.eeecs.qub.ac.uk/dbConnector.php";

        // Send the SQL to PHP as form data in a POST request.
        const response = await fetch(url, {
          method: "POST",
          body: new URLSearchParams({ query: sql })
        });

        // Throw an error if the web request itself failed.
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}`);
        }

        // Convert the JSON text from the server into a JavaScript object.
        const result = await response.json();
        // console.log(result);
        return result;

      } catch (error) {
        // Log the error so it can be inspected in the browser console.
        console.log(error.message);
      }
    }

//Add New collision
submit.addEventListener("click", async (e) =>{
  
  e.preventDefault();
    const collision = {
      locationID: Number(document.querySelector("#locationID").value.trim()),
      dateAndTime: document.querySelector("#dateAndTime").value.trim(),
      weatherCondition: document.querySelector("#weatherCondition").value.trim(),
      roadSurface: document.querySelector("#roadSurface").value.trim(),
      lightingCondition: document.querySelector("#lightingCondition").value,
      collisionSeverity: document.querySelector("#collisionSeverity").value,
      causationFactor: document.querySelector("#causationFactor").value,
      notes: document.querySelector("#notes").value
    };

  console.log("Running submission")    

      // Clean up and convert values first so the checks below are easier to write.
      const locationID = Number(collision.locationID);
      const dateAndTime = typeof collision.dateAndTime === "string" ? collision.dateAndTime.trim() : "";
      const weatherCondition = typeof collision.weatherCondition === "string" ? collision.weatherCondition.trim() : "";
      const roadSurface = typeof collision.roadSurface === "string" ? collision.roadSurface.trim() : "";
      const lightingCondition = typeof collision.lightingCondition === "string" ? collision.lightingCondition.trim() : "";
      const collisionSeverity = typeof collision.collisionSeverity === "string" ? collision.collisionSeverity.trim() : "";
      const causationFactor = typeof collision.causationFactor === "string" ? collision.causationFactor.trim() : "";
      const notes = typeof collision.notes === "string" ? collision.notes.trim() : "";

      console.log("Created variables.")

      if (!locationID) {
        showMessage("Location ID is required.", "error");
        return ;
      }

      if (!dateAndTime) {
        showMessage("Date and Time is required.", "error");
        return;
      }

      if (!weatherCondition) {
        showMessage("Weather Condition is required.", "error");
        return;
      }

      if (!roadSurface) {
        showMessage("Road Surface is required.", "error");
        return;
      }

      if (!lightingCondition) {
        showMessage("Lighting Condition is required.", "error");
        return;
      }

      if(!collisionSeverity){
        showMessage("Collision Severity is required.", "error");
        return; 
      }

      if (causationFactor.length < 3) {
        showMessage("Causation Factor must be longer than 3 characters.", "error");
        return;
      }

      console.log("Validation complete.")

  const sql= `INSERT INTO tblCollision(locationID, dateAndTime, weatherCondition, roadSurface, lightingCondition, collisionSeverity, causationFactor, notes) VALUES
  ('${collision.locationID}', '${escapeSql(collision.dateAndTime)}', '${escapeSql(collision.weatherCondition)}', '${escapeSql(collision.roadSurface)}',
  '${escapeSql(collision.lightingCondition)}', '${escapeSql(collision.collisionSeverity)}', '${escapeSql(collision.causationFactor)}', '${escapeSql(collision.notes)}')
  `

  console.log(sql);

  const result = await Query(sql);

  if (result && result.success) {
        showMessage("Collision record added successfully.", "success");
        form.reset();
        return;
      }

      if (result && result.error) {
        showMessage(result.error, "error");
      } else {
        showMessage("Unable to add the record.", "error");
      }

});




    //Show existing collisions.
    document.addEventListener("DOMContentLoaded", async()=>{
   console.log("Loading data.")
  const sql = "SELECT * FROM tblCollision";
  try{
    const result = await Query(sql);
       if (!result.success) {
      console.log("Fail");
      message.textContent = result.error || "Query failed.";
      return;
    }

    
    if(!result || result.data.length === 0) {
      console.log("No rows");
      output.textContent = "No Rows Returned";
      return;
    }

    console.log("Creating basic data.")  
    const rows = result.data;
      const table = document.createElement("table");
      const headerRow = document.createElement("tr");

      console.log("Creating headers.")
      const hrCollisionID = document.createElement("th");
      const hrLocationID = document.createElement("th");
      const hrDateAndTime = document.createElement("th");
      const hrWeatherCondition = document.createElement("th");
      const hrRoadSurface = document.createElement("th");
      const hrLightingCondition = document.createElement("th");
      const hrCollisionSeverity = document.createElement("th");
      const hrCausationFactor = document.createElement("th");
      const hrNotes = document.createElement("th");

      hrCollisionID.textContent = "Collision ID";
      hrLocationID.textContent = "Location ID";
      hrDateAndTime.textContent = "Date and Time";
      hrWeatherCondition.textContent = "Weather Condition";
      hrRoadSurface.textContent = "Road Surface";
      hrLightingCondition.textContent = "Lighting Condition";
      hrCollisionSeverity.textContent = "Collision Severity";
      hrCausationFactor.textContent = "Causation Factor";
      hrNotes.textContent = "Notes";;

      headerRow.appendChild(hrCollisionID);
      headerRow.appendChild(hrLocationID);
      headerRow.appendChild(hrDateAndTime);
      headerRow.appendChild(hrWeatherCondition);
      headerRow.appendChild(hrRoadSurface);
      headerRow.appendChild(hrLightingCondition);
      headerRow.appendChild(hrCollisionSeverity);
      headerRow.appendChild(hrCausationFactor);
      headerRow.appendChild(hrNotes);

      table.appendChild(headerRow);

      console.log("Headers appended successfully, creating rows")

      for(let row of rows){
        const tr = document.createElement("tr");
        
        console.log("Creating row")
        const tdCollisionID = document.createElement("td");
        const tdLocationID  = document.createElement("td");
        const tdDateAndTime = document.createElement("td");
        const tdWeatherCondition = document.createElement("td");
        const tdRoadSurface = document.createElement("td");
        const tdLightingCondition = document.createElement("td");
        const tdCollisionSeverity = document.createElement("td");
        const tdCausationFactor = document.createElement("td");
        const tdNotes = document.createElement("td");

        tdCollisionID.textContent = row.collisionID;
        tdLocationID.textContent = row.locationID;
        tdDateAndTime.textContent = row.dateAndTime;
        tdWeatherCondition.textContent = row.weatherCondition;
        tdRoadSurface.textContent = row.roadSurface;
        tdLightingCondition.textContent = row.lightingCondition;
        tdCollisionSeverity.textContent = row.collisionSeverity;
        tdCausationFactor.textContent = row.causationFactor;
        tdNotes.textContent = row.notes;


        tr.appendChild(tdCollisionID);
        tr.appendChild(tdLocationID);
        tr.appendChild(tdDateAndTime);
        tr.appendChild(tdWeatherCondition);
        tr.appendChild(tdRoadSurface);
        tr.appendChild(tdLightingCondition);
        tr.appendChild(tdCollisionSeverity);
        tr.appendChild(tdCausationFactor);
        tr.appendChild(tdNotes);

        table.appendChild(tr);
      }
      output.appendChild(table);

    }catch (error) {
    console.log(error);
  } 
});



