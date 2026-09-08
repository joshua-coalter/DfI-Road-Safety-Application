const output = document.getElementById("#output");
const submit = document.getElementById("casualtySubmitBtn");

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
    const casualty = {
    collisionID: Number(document.querySelector("#collisionID").value.trim()),
    Gender: document.querySelector("#Gender").value.trim(),
    ageGroup: document.querySelector("#ageGroup").value.trim(),
    injurySeverity: document.querySelector("#injurySeverity").value.trim(),
    casualtyType: document.querySelector("#casualtyType").value.trim(),
      };

  console.log("Running submission")    

      // Clean up and convert values first so the checks below are easier to write.
      const collisionID = Number(casualty.collisionID);
      const Gender = typeof casualty.Gender === "string" ? casualty.Gender.trim() : "";
      const ageGroup = typeof casualty.ageGroup === "string" ? casualty.ageGroup.trim() : "";
      const injurySeverity = typeof casualty.injurySeverity === "string" ? casualty.injurySeverity.trim() : "";
      const casualtyType = typeof casualty.casualtyType === "string" ? casualty.casualtyType.trim() : "";

      console.log("Created variables.")

      if (!Number.isInteger(collisionID) || collisionID < 1) {
        return "Collision ID must be an integer greater than 0.";
      }

      if (!Gender) {
        return "Gender is required.";
      }

      if (ageGroup.length < 3) {
        return "Age Group is required.";
      }

      if (!injurySeverity) {
        return "Injury Severity is required.";
      }

      if(!casualtyType){
        return "Casualty Type is required."
      }

      console.log("Validation complete.")
      
  
  const escapeSql = (value) => {
    return value.replace(/'/g, "''");
  }

  const sql= `INSERT INTO tblCasualty(collisionID, Gender, ageGroup, injurySeverity, casualtyType) VALUES
  (${casualty.collisionID}, '${escapeSql(casualty.Gender)}', '${escapeSql(casualty.ageGroup)}',
  '${escapeSql(casualty.injurySeverity)}', '${escapeSql(casualty.casualtyType)}')
  `

  console.log(sql);

  const result = await Query(sql);

  if (result && result.success) {
        showMessage("Casualty record added successfully.", "success");
        casualtyForm.reset();
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
  const sql = "SELECT * FROM tblCasualty";
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
      const hrCasualtyID = document.createElement("th");
      const hrCollisionID = document.createElement("th");
      const hrGender = document.createElement("th");
      const hrAgeGroup = document.createElement("th");
      const hrInjurySeverity = document.createElement("th");
      const hrCasualtyType = document.createElement("th");

      hrCasualtyID.textContent = "Casualty ID";
      hrCollisionID.textContent = "Collision ID";
      hrGender.textContent = "Gender";
      hrAgeGroup.textContent = "Age Group";
      hrInjurySeverity.textContent = "Injury Severity";
      hrCasualtyType.textContent = "Casualty Type";

      headerRow.appendChild(hrCasualtyID);
      headerRow.appendChild(hrCollisionID);
      headerRow.appendChild(hrGender);
      headerRow.appendChild(hrAgeGroup);
      headerRow.appendChild(hrInjurySeverity);
      headerRow.appendChild(hrCasualtyType);

      table.appendChild(headerRow);

      console.log("Headers appended successfully, creating rows")

      for(let row of rows){
        const tr = document.createElement("tr");
        
        console.log("Creating row")
        const tdCasualtyID = document.createElement("td");
        const tdCollisionID  = document.createElement("td");
        const tdGender = document.createElement("td");
        const tdAgeGroup = document.createElement("td");
        const tdInjurySeverity = document.createElement("td");
        const tdCasualtyType = document.createElement("td");

        tdCasualtyID.textContent = row.casualtyID;
        tdCollisionID.textContent = row.collisionID;
        tdGender.textContent = row.Gender;
        tdAgeGroup.textContent = row.ageGroup;
        tdInjurySeverity.textContent = row.injurySeverity;
        tdCasualtyType.textContent = row.casualtyType;

        tr.appendChild(tdCasualtyID);
        tr.appendChild(tdCollisionID);
        tr.appendChild(tdGender);
        tr.appendChild(tdAgeGroup);
        tr.appendChild(tdInjurySeverity);
        tr.appendChild(tdCasualtyType);

        table.appendChild(tr);
      }
      output.appendChild(table);
    }catch (error) {
    console.log(error);
  } 
});