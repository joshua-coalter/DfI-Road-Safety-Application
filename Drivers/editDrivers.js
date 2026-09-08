const runQuery = async (sql) => {
      try {
        // This is the PHP endpoint that talks to the database for us.
        const url = "https://msharpe06.webhosting1.eeecs.qub.ac.uk/dbConnector.php";

        // Send the SQL statement in the body of a POST request.
        const response = await fetch(url, {
          method: "POST",
          body: new URLSearchParams({ query: sql })
        });

        // Stop and report a problem if the web request itself failed.
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}`);
        }

        // Convert the JSON text from PHP into a JavaScript object.
        const result = await response.json();
        return result;

      } catch (error) {
        // Log errors so they can be seen in the browser console during debugging.
        console.log(error.message);
      }
    }

let selectedDriverID = null;

    // Show a success or error message below the form.
    const showMessage = (text, type) => {
      const output = document.querySelector("#message");
      output.textContent = text;
      output.className = `message ${type}`;
    };

    // Clear any old message so the page does not show stale feedback.
    const clearMessage = () => {
      const output = document.querySelector("#message");
      output.textContent = "";
      output.className = "message";
    };

    // Put the form back into its starting state.
    const resetForm = () => {
      const form = document.querySelector("#editForm");
      const selectedDriverText = document.querySelector("#selectedDriverText");

      form.reset();
      selectedDriverID = null;
      selectedDriverText.textContent = "Choose a Driver from the table first.";
    };

    // Copy the chosen student's data from the table into the form fields.
    const selectDriver = (driver) => {
      const selectedDriverText = document.querySelector("#selectedDriverText");

      selectedDriverID = Number(driver.driverID);
      document.querySelector("#driverID").value = driver.driverID;
      document.querySelector("#vehicleID").value = driver.vehicleID;
      document.querySelector("#gender").value = driver.Gender;
      document.querySelector("#ageGroup").value = driver.ageGroup;
      document.querySelector("#licenceType").value = driver.LicenceType;
      document.querySelector("#impairmentFlag").value = driver.ImpairmentFlag;
      clearMessage();
    };

    // Load all drivers from the database and display them in a table.
    const printTable = async () => {
      console.log("Starting table");
      const output = document.querySelector("#tableOutput");
      output.textContent = "";

      // Read every row so the user can choose one to edit.
      const sql = "SELECT * FROM tblDriver ORDER BY driverID;";
      const result = await runQuery(sql);

      if (!result || !result.data || result.data.length === 0) {
        output.textContent = "No Rows Returned";
        return;
      }

      const rows = result.data;
      const table = document.createElement("table");
      const headerRow = document.createElement("tr");
      table.appendChild(headerRow);
      console.log("Creating headings");
      // Create the table headings once before the student rows are added.
      const headings = ["Driver ID", "Vehicle ID", "Gender", "Age Group", "Licence Type", "Impairment Flag", "Action"];

      for (let heading of headings) {
        const th = document.createElement("th");
        th.textContent = heading;
        headerRow.appendChild(th);
      }

      for (let row of rows) {
        const tr = document.createElement("tr");

        const tdDriverID = document.createElement("td");
        tdDriverID.textContent = row.driverID;
        tr.appendChild(tdDriverID);

        const tdVehicleID = document.createElement("td");
        tdVehicleID.textContent = row.vehicleID;
        tr.appendChild(tdVehicleID);

        const tdGender = document.createElement("td");
        tdGender.textContent = row.Gender;
        tr.appendChild(tdGender);

        const tdAgeGroup = document.createElement("td");
        tdAgeGroup.textContent = row.ageGroup;
        tr.appendChild(tdAgeGroup);

        const tdLicenceType = document.createElement("td");
        tdLicenceType.textContent = row.LicenceType;
        tr.appendChild(tdLicenceType);

        const tdImpairmentFlag = document.createElement("td");
        tdImpairmentFlag.textContent = row.ImpairmentFlag;
        tr.appendChild(tdImpairmentFlag);

        const tdAction = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
          // Load this row into the form so the user can change it.
          selectDriver(row);
        });
        tdAction.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
          // Ask for confirmation before permanently deleting a row.
          const shouldDelete = confirm(`Delete Driver ${row.driverID}?`);
          if (!shouldDelete) {
            return;
          }

          // Remove the chosen student from the database table.
          const deleteSql = `DELETE FROM tblDriver WHERE driverID = ${row.driverID}`;
          const deleteResult = await runQuery(deleteSql);

          if (deleteResult && deleteResult.success) {
            showMessage("Driver record deleted successfully.", "success");

            if (selectedDriverID === Number(row.driverID)) {
              resetForm();
            }

            printTable();
            return;
          }

          if (deleteResult && deleteResult.error) {
            showMessage(deleteResult.error, "error");
          } else {
            showMessage("Unable to delete the record.", "error");
          }
        });
        tdAction.appendChild(deleteButton);

        tr.appendChild(tdAction);

        table.appendChild(tr);
      }

      output.appendChild(table);
    };

    // Set up the page when the browser has finished loading the HTML.
    document.addEventListener("DOMContentLoaded", () => {
      resetForm();
      printTable();
    });

    // Update the chosen student when the form is submitted.
    document.querySelector("#editForm").addEventListener("submit", async (event) => {
      event.preventDefault();

      if (selectedDriverID === null) {
        showMessage("Choose a driver from the table before updating.", "error");
        return;
      }

      const validateDriver = (driver) => {
      if (!driver || typeof driver !== "object") {
        return "Driver details are required.";
      }

      // Clean up and convert values first so the checks below are easier to write.
      const driverID = Number(driver.driverID);
      const vehicleID = Number(driver.vehicleID);
      const Gender = typeof driver.Gender === "string" ? driver.Gender.trim() : "";
      const ageGroup = typeof driver.ageGroup === "string" ? driver.ageGroup.trim() : "";
      const LicenceType = typeof driver.LicenceType === "string" ? driver.LicenceType.trim() : "";
      const ImpairmentFlag = Number(driver.ImpairmentFlag);

      if (!Number.isInteger(driverID) || driverID < 1) {
        return "Driver ID must be a whole number greater than 0.";
      }

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
        return "Licence Type Zone is required.";
      }

      //Should allow no values and set to null but doing this as a temporary fix.
      if(isNaN(ImpairmentFlag)){
        return "Impairment Flag must be included."
      }

      return "";
      }

      const driver = {
        driverID: Number(document.querySelector("#driverID").value),
        vehicleID: Number(document.querySelector("#vehicleID").value),
        Gender: document.querySelector("#gender").value.trim(),
        ageGroup: document.querySelector("#ageGroup").value.trim(),
        LicenceType: document.querySelector("#licenceType").value.trim(),
        ImpairmentFlag: Number(document.querySelector("#impairmentFlag").value),
      };

      // Reuse the same validation rules as the add-record page.
      const validationMessage = validateDriver(driver);
      if (validationMessage) {
        showMessage(validationMessage, "error");
        return;
      }

      const escapeSql = (value) => {
       return value.replace(/'/g, "''");
      }

      // Update the original row by matching the student ID that was selected earlier.
      const sql = `
        UPDATE tblDriver
        SET
          vehicleID = '${driver.vehicleID}',
          Gender = '${escapeSql(driver.Gender)}',
          ageGroup = '${escapeSql(driver.ageGroup)}',
          LicenceType = '${escapeSql(driver.LicenceType)}',
          ImpairmentFlag = '${(driver.ImpairmentFlag)}'
        WHERE driverID = ${selectedDriverID};
      `
      console.log(sql);

      // Send the SQL UPDATE statement to the PHP connector.
      const result = await runQuery(sql);

      if (result && result.success) {
        showMessage("Driver record updated successfully.", "success");
        resetForm();
        printTable();
        return;
      }

      if (result && result.error) {
        showMessage(result.error, "error");
      } else {
        showMessage("Unable to update the record.", "error");
      }
    });