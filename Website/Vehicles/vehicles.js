const form = document.getElementById("vehicleForm");
const message = document.getElementById("message");
const output = document.getElementById("#output");
const submit = document.getElementById("vehicleSubmitBtn");

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
    const vehicle = {
    collisionID: Number(document.querySelector("#collisionID").value),
    vehicleType: document.querySelector("#vehicleType").value.trim(),
    VIN: document.querySelector("#VIN").value.trim(),
    vehicleMake: document.querySelector("#vehicleMake").value.trim(),
    vehicleModel: document.querySelector("#vehicleModel").value.trim(),
    vehicleReg: document.querySelector("#vehicleReg").value.trim(),
    vehicleSpeed: Number(document.querySelector("#vehicleSpeed").value)
      };

  console.log("Running submission")    

      // Clean up and convert values first so the checks below are easier to write.
      const collisionID = Number(vehicle.collisionID);
      const vehicleType = typeof vehicle.vehicleType === "string" ? vehicle.vehicleType.trim() : "";
      const VIN = typeof vehicle.VIN === "string" ? vehicle.VIN.trim() : "";
      const vehicleMake = typeof vehicle.vehicleMake === "string" ? vehicle.vehicleMake.trim() : "";
      const vehicleModel = typeof vehicle.vehicleModel === "string" ? vehicle.vehicleModel.trim() : ""; 
      const vehicleReg = typeof vehicle.vehicleReg === "string" ? vehicle.vehicleReg.trim() : "";
      const vehicleSpeed = Number(vehicle.vehicleSpeed);

      console.log("Created variables.")

      if (!collisionID) {
        return "Collision ID is required.";
      }

      if (vehicleType.length > 15) {
        return "Maximum 15 characters.";
      }

      if (VIN.length != 17) {
        return "VIN must be exactly 17 characters.";
      }

      if (vehicleMake.length > 15) {
        return "Maximum 15 characters.";
      }

      if (vehicleModel.length > 15) {
        return "Maximum 15 characters.";
      }

      if (vehicleReg.length > 10) {
        return "Maximum 15 characters.";
      }

      //Should allow no values and set to null but doing this as a temporary fix.
      if(!vehicleSpeed){
        return "Vehicle Speed is required."
      }

      console.log("Validation complete.")
      
  
  const escapeSql = (value) => {
    return value.replace(/'/g, "''");
  }

  const sql= `INSERT INTO tblVehicle(collisionId, vehicleType, VIN, vehicleMake, vehicleModel, vehicleReg, vehicleSpeed) VALUES
  (${vehicle.collisionID}, '${escapeSql(vehicle.vehicleType)}', '${escapeSql(vehicle.VIN)}',
  '${escapeSql(vehicle.vehicleMake)}', '${vehicle.vehicleModel}', '${vehicle.vehicleReg}', ${vehicle.vehicleSpeed})
  `

  console.log(sql);

  const result = await Query(sql);

  if (result && result.success) {
        showMessage("Vehicle record added successfully.", "success");
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

//Show existing vehicles.
async function loadTable() {
  console.log("Loading data.")

  output.innerHTML = "";
  const sql = "SELECT * FROM tblVehicle";
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
      const hrCollisionID = document.createElement("th");
      const hrVehicleType = document.createElement("th");
      const hrVIN = document.createElement("th");
      const hrVehicleMake = document.createElement("th");
      const hrVehicleModel = document.createElement("th");
      const hrVehicleReg = document.createElement("th");
      const hrVehicleSpeed = document.createElement("th");

      hrCollisionID.textContent = "Collision ID";
      hrVehicleType.textContent = "Vehicle Type";
      hrVIN.textContent = "VIN";
      hrVehicleMake.textContent = "Vehicle Make";
      hrVehicleModel.textContent = "Vehicle Model";
      hrVehicleReg.textContent = "Vehicle Reg";
      hrVehicleSpeed.textContent = "Vehicle Speed";

      headerRow.appendChild(hrCollisionID);
      headerRow.appendChild(hrVehicleType);
      headerRow.appendChild(hrVIN);
      headerRow.appendChild(hrVehicleMake);
      headerRow.appendChild(hrVehicleModel);
      headerRow.appendChild(hrVehicleReg);
      headerRow.appendChild(hrVehicleSpeed);

      table.appendChild(headerRow);

      console.log("Headers appended successfully, creating rows")

      for(let row of rows){
        const tr = document.createElement("tr");
        
        console.log("Creating row")
        const tdCollisionID = document.createElement("td");
        const tdVehicleType  = document.createElement("td");
        const tdVIN = document.createElement("td");
        const tdVehicleMake = document.createElement("td");
        const tdVehicleModel = document.createElement("td");
        const tdvehicleReg = document.createElement("td");
        const tdVehicleSpeed = document.createElement("td");

        tdCollisionID.textContent = row.collisionID;
        tdVehicleType.textContent = row.vehicleType;
        tdVIN.textContent = row.VIN;
        tdVehicleMake.textContent = row.vehicleMake;
        tdVehicleModel.textContent = row.vehicleModel;
        tdvehicleReg.textContent = row.vehicleReg;
        tdVehicleSpeed.textContent = row.vehicleSpeed;
        
        tr.appendChild(tdCollisionID);
        tr.appendChild(tdVehicleType);
        tr.appendChild(tdVIN);
        tr.appendChild(tdVehicleMake);
        tr.appendChild(tdVehicleModel);
        tr.appendChild(tdvehicleReg);
        tr.appendChild(tdVehicleSpeed);

        table.appendChild(tr);
      }
      output.appendChild(table);
    }catch (error) {
    console.log(error);
  } 
};