const output = document.getElementById("output");
const submit = document.getElementById("driverSubmitBtn");
const form = document.getElementById("driverForm");

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
        const url = "https://msharpe06.webhosting1.eeecs.qub.ac.uk/dbConnector.php";

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

//Add New driver
submit.addEventListener("click", async (e) =>{
  
  e.preventDefault();
    const driver = {
    vehicleID: Number(document.querySelector("#vehicleID").value),
    Gender: document.querySelector("#gender").value,
    ageGroup: document.querySelector("#ageGroup").value,
    LicenceType: document.querySelector("#licenceType").value,
    ImpairmentFlag: Number(document.querySelector("#impairmentFlag").value)
      };

  console.log("Running submission")    

      // Clean up and convert values first so the checks below are easier to write.
      const vehicleID = Number(driver.vehicleID);
      const Gender = typeof driver.Gender === "string" ? driver.Gender.trim() : "";
      const ageGroup = typeof driver.ageGroup === "string" ? driver.ageGroup.trim() : "";
      const LicenceType = typeof driver.LicenceType === "string" ? driver.LicenceType.trim() : "";
      const ImpairmentFlag = Number(driver.ImpairmentFlag);

      console.log("Created variables.")

      if (!vehicleID) {
        return "Vehicle ID is required.";
      }

      if (!Gender) {
        return "Gender is required.";
      }

      if (!ageGroup) {
        return "Age Group is required.";
      }

      if (!LicenceType) {
        return "Licence Type is required.";
      }

      if(isNaN(ImpairmentFlag)){
        return "Impairment Falg must be included."
      }

      console.log("Validation complete.")
      
  
  const escapeSql = (value) => {
    return value.replace(/'/g, "''");
  }

  const sql= `INSERT INTO tblDriver(vehicleID, Gender, ageGroup, LicenceType, ImpairmentFlag) VALUES
  (${driver.vehicleID}, '${escapeSql(driver.Gender)}', '${escapeSql(driver.ageGroup)}',
  '${escapeSql(driver.LicenceType)}', ${driver.ImpairmentFlag})
  `

  console.log(sql);

  const result = await Query(sql);

  if (result && result.success) {
        showMessage("Driver record added successfully.", "success");
        form.reset();
        return;
      }

      if (result && result.error) {
        showMessage(result.error, "error");
      } else {
        showMessage("Unable to add the record.", "error");
      }

});




    //Show existing locations.
    document.addEventListener("DOMContentLoaded", async()=>{
   console.log("Loading data.")
  const sql = "SELECT * FROM tblDriver";
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
      const hrDriverID = document.createElement("th");
      const hrVehicleID = document.createElement("th");
      const hrGender = document.createElement("th");
      const hrAgeGroup = document.createElement("th");
      const hrLicenceType = document.createElement("th");
      const hrImpairmentFlag = document.createElement("th");

      hrDriverID.textContent = "Driver ID";
      hrVehicleID.textContent = "Vehicle ID";
      hrGender.textContent = "Gender";
      hrAgeGroup.textContent = "Age Group";
      hrLicenceType.textContent = "Licence Type";
      hrImpairmentFlag.textContent = "Impairment Flag";

      headerRow.appendChild(hrDriverID);
      headerRow.appendChild(hrVehicleID);
      headerRow.appendChild(hrGender);
      headerRow.appendChild(hrAgeGroup);
      headerRow.appendChild(hrLicenceType);
      headerRow.appendChild(hrImpairmentFlag);

      table.appendChild(headerRow);

      console.log("Headers appended successfully, creating rows")

      for(let row of rows){
        const tr = document.createElement("tr");
        
        console.log("Creating row")
        const tdDriverID = document.createElement("td");
        const tdVehicleID  = document.createElement("td");
        const tdGender = document.createElement("td");
        const tdAgeGroup = document.createElement("td");
        const tdLicenceType = document.createElement("td");
        const tdImpairmentFlag = document.createElement("td");

        tdDriverID.textContent = row.driverID;
        tdVehicleID.textContent = row.vehicleID;
        tdGender.textContent = row.Gender;
        tdAgeGroup.textContent = row.ageGroup;
        tdLicenceType.textContent = row.LicenceType
        tdImpairmentFlag.textContent = row.ImpairmentFlag;

        tr.appendChild(tdDriverID);
        tr.appendChild(tdVehicleID);
        tr.appendChild(tdGender);
        tr.appendChild(tdAgeGroup);
        tr.appendChild(tdLicenceType);
        tr.appendChild(tdImpairmentFlag);

        table.appendChild(tr);
      }
      output.appendChild(table);
    }catch (error) {
    console.log(error);
  } 
});