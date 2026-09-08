const output = document.getElementById("#output");
const submit = document.getElementById("locationSubmitBtn");
const form = document.getElementById("locationForm");

const escapeSql = (value) => {
       return value.replace(/'/g, "''");
    }



    const showMessage = (text, type) => {
      const output = document.querySelector("#message");
      output.textContent = text;
      output.className = `message ${type}`;
    };
// Setup connection.
const Query = async (sql) => {
      try {
        // This is the PHP file that receives the SQL and talks to the database.
        const url = "https://mwalas01.webhosting1.eeecs.qub.ac.uk/dbConnector.php";

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

//Add New location
submit.addEventListener("click", async (e) =>{
  
  e.preventDefault();
    const location = {
    roadName: document.querySelector("#roadName").value.trim(),
    roadType: document.querySelector("#roadType").value.trim(),
    districtName: document.querySelector("#districtName").value.trim(),
    junctionType: document.querySelector("#junctionType").value.trim(),
    deprivationScore: Number(document.querySelector("#deprivationScore").value.trim()),
    speedLimitZone: Number(document.querySelector("#speedLimitZone").value)
      };

  console.log("Running submission")    

      // Clean up and convert values first so the checks below are easier to write.
      const roadName = typeof location.roadName === "string" ? location.roadName.trim() : "";
      const roadType = typeof location.roadType === "string" ? location.roadType.trim() : "";
      const districtName = typeof location.districtName === "string" ? location.districtName.trim() : "";
      const junctionType = typeof location.junctionType === "string" ? location.junctionType.trim() : "";
      const deprivationScore = Number(location.deprivationScore);
      const speedLimitZone = Number(location.speedLimitZone);

      console.log("Created variables.")

      if (roadName.length < 3) {
        return "Road name must be longer than 3 characters.";
      }

      if (!roadType) {
        return "Road Type is required.";
      }

      if (districtName.length < 3) {
        return "District Name must be longer than 3 characters.";
      }

      if (!speedLimitZone) {
        return "Speed Limit Zone is required.";
      }

      //Should allow no values and set to null but doing this as a temporary fix.
      if(!junctionType){
        return "Junction must be included."
      }

      console.log("Validation complete.")
      
  
  const escapeSql = (value) => {
    return value.replace(/'/g, "''");
  }

  const sql= `INSERT INTO tblLocation(roadName, roadType, districtName, junctionType, deprivationScore, speedLimitZone) VALUES
  ('${escapeSql(location.roadName)}', '${escapeSql(location.roadType)}', '${escapeSql(location.districtName)}',
  '${escapeSql(location.junctionType)}', ${location.deprivationScore}, ${location.speedLimitZone})
  `

  console.log(sql);

  const result = await Query(sql);

  if (result && result.success) {
        showMessage("Location record added successfully.", "success");
        form.reset();
        loadTable();
        return;
      }

      if (result && result.error) {
        showMessage(result.error, "error");
      } else {
        showMessage("Unable to add the record.", "error");
      }

});

document.addEventListener("DOMContentLoaded", loadTable);

//Show existing locations.
async function loadTable() {
  console.log("Loading data.")

  output.innerHTML = "";
  const sql = "SELECT * FROM tblLocation";
  try{
    const result = await Query(sql);
       if (!result.success) {
      console.log("Fail");
      reportMessage.textContent = result.error || "Query failed.";
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
      const hrLocationID = document.createElement("th");
      const hrRoadName = document.createElement("th");
      const hrRoadType = document.createElement("th");
      const hrDistrictName = document.createElement("th");
      const hrJunctionType = document.createElement("th");
      const hrDeprevationScore = document.createElement("th");
      const hrSpeedLimitZone = document.createElement("th");

      hrLocationID.textContent = "Location ID";
      hrRoadName.textContent = "Road Name";
      hrRoadType.textContent = "Road Type";
      hrDistrictName.textContent = "District";
      hrJunctionType.textContent = "Junction Type";
      hrDeprevationScore.textContent = "Deprivation Score";
      hrSpeedLimitZone.textContent = "Speed Limit";

      headerRow.appendChild(hrLocationID);
      headerRow.appendChild(hrRoadName);
      headerRow.appendChild(hrRoadType);
      headerRow.appendChild(hrDistrictName);
      headerRow.appendChild(hrJunctionType);
      headerRow.appendChild(hrDeprevationScore);
      headerRow.appendChild(hrSpeedLimitZone);

      table.appendChild(headerRow);

      console.log("Headers appended successfully, creating rows")

      for(let row of rows){
        const tr = document.createElement("tr");
        
        console.log("Creating row")
        const tdLocationID = document.createElement("td");
        const tdRoadName  = document.createElement("td");
        const tdRoadType = document.createElement("td");
        const tdDistrictName = document.createElement("td");
        const tdJunctionType = document.createElement("td");
        const tdDeprevationScore = document.createElement("td");
        const tdSpeedLimitZone = document.createElement("td");

        tdLocationID.textContent = row.locationID;
        tdRoadName.textContent = row.roadName;
        tdRoadType.textContent = row.roadType;
        tdDistrictName.textContent = row.districtName;
        tdJunctionType.textContent = row.junctionType
        tdDeprevationScore.textContent = row.deprivationScore;
        tdSpeedLimitZone.textContent = row.speedLimitZone;


        tr.appendChild(tdLocationID);
        tr.appendChild(tdRoadName);
        tr.appendChild(tdRoadType);
        tr.appendChild(tdDistrictName);
        tr.appendChild(tdJunctionType);
        tr.appendChild(tdDeprevationScore);
        tr.appendChild(tdSpeedLimitZone);

        table.appendChild(tr);
      }
      output.appendChild(table);
    }catch (error) {
    console.log(error);
  } 
};