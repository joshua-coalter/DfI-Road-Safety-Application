const form = document.getElementById("interventionForm");
const message = document.getElementById("message");
const output = document.getElementById("output");
const submit = document.getElementById("interventionSubmitBtn");

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

//Add New intervention
submit.addEventListener("click", async (e) =>{
  
  e.preventDefault();
    const intervention = {
      locationID: Number(document.querySelector("#locationID").value.trim()),
      interventionType: document.querySelector("#interventionType").value.trim(),
      implementationDate: document.querySelector("#implementationDate").value.trim(),
      description: document.querySelector("#description").value.trim()
    };

  console.log("Running submission")    

      // Clean up and convert values first so the checks below are easier to write.
      const locationID = Number(intervention.locationID);
      const interventionType = typeof intervention.interventionType === "string" ? intervention.interventionType.trim() : "";
      var implementationDate = typeof intervention.implementationDate === "string" ? intervention.implementationDate.trim() : "";
      const description = typeof intervention.description === "string" ? intervention.description.trim() : "";

      console.log("Created variables.")

      if (!locationID) {
        showMessage("Location ID is required.", "error");
        return;
      }

      if (!interventionType) {
        showMessage("Intervention Type is required..", "error");
        return;
      }

      if(implementationDate == ""){
        implementationDate = null;
      }

      console.log("Validation complete.")

  var sql = "";
      if(implementationDate != null){
      sql= `INSERT INTO tblIntervention(locationID, interventionType, implementationDate, description) VALUES
  ('${intervention.locationID}', '${escapeSql(intervention.interventionType)}', '${escapeSql(intervention.implementationDate)}', '${escapeSql(intervention.description)}')
  `
    }
  else{
sql= `INSERT INTO tblIntervention(locationID, interventionType, implementationDate, description) VALUES
  ('${intervention.locationID}', '${escapeSql(intervention.interventionType)}', null, '${escapeSql(intervention.description)}')
  `
  }

  console.log(sql);

  const result = await Query(sql);

  console.log("Sent SQL");

  if (result && result.success) {
        showMessage("Intervention record added successfully.", "success");
        form.reset();
        return;
      }

      if (result && result.error) {
        showMessage(result.error, "error");
      } else {
        showMessage("Unable to add the record.", "error");
      }

});

    //Show existing interventions.
    document.addEventListener("DOMContentLoaded", async()=>{
   console.log("Loading data.")
  const sql = "SELECT * FROM tblIntervention";
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
      const hrInterventionID = document.createElement("th");
      const hrLocationID = document.createElement("th");
      const hrInterventionType = document.createElement("th");
      const hrImplementationDate = document.createElement("th");
      const hrDescription = document.createElement("th");

      hrInterventionID.textContent = "Intervention ID";
      hrLocationID.textContent = "Location ID";
      hrInterventionType.textContent = "Intervention Type";
      hrImplementationDate.textContent = "Implementation Date";
      hrDescription.textContent = "Description";

      headerRow.appendChild(hrInterventionID);
      headerRow.appendChild(hrLocationID);
      headerRow.appendChild(hrInterventionType);
      headerRow.appendChild(hrImplementationDate);
      headerRow.appendChild(hrDescription);

      table.appendChild(headerRow);

      console.log("Headers appended successfully, creating rows")

      for(let row of rows){
        const tr = document.createElement("tr");
        
        console.log("Creating row")
        const tdInterventionID = document.createElement("td");
        const tdLocationID  = document.createElement("td");
        const tdInterventionType = document.createElement("td");
        const tdImplementationDate = document.createElement("td");
        const tdDescription = document.createElement("td");

        tdInterventionID.textContent = row.interventionID;
        tdLocationID.textContent = row.locationID;
        tdInterventionType.textContent = row.interventionType;
        if(row.implementationDate != null){
        tdImplementationDate.textContent = row.implementationDate;
        }
        else{
          tdImplementationDate.textContent = "";
        }
        tdDescription.textContent = row.description;

        tr.appendChild(tdInterventionID);
        tr.appendChild(tdLocationID);
        tr.appendChild(tdInterventionType);
        tr.appendChild(tdImplementationDate);
        tr.appendChild(tdDescription);

        table.appendChild(tr);
      }  
      output.appendChild(table);

    }catch (error) {
    console.log(error);
  } 
});
