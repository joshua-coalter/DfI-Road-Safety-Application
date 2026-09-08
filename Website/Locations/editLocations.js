const runQuery = async (sql) => {
      try {
        // This is the PHP endpoint that talks to the database for us.
        const url = "https://mthompson78.webhosting1.eeecs.qub.ac.uk/dbConnector.php";

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

let selectedLocationID = null;

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
      const selectedLocationText = document.querySelector("#selectedLocationText");

      form.reset();
      selectedLocationID = null;
      selectedLocationText.textContent = "Choose a Location from the table first.";
    };

    // Copy the chosen student's data from the table into the form fields.
    const selectLocation = (location) => {
      const selectedLocationText = document.querySelector("#selectedLocationText");

      selectedLocationID = Number(location.locationID);
      document.querySelector("#locationID").value = location.locationID;
      document.querySelector("#roadName").value = location.roadName;
      document.querySelector("#roadType").value = location.roadType;
      document.querySelector("#districtName").value = location.districtName;
      document.querySelector("#junctionType").value = location.junctionType;
      document.querySelector("#deprivationScore").value = location.deprivationScore;
      document.querySelector("#speedLimitZone").value = location.speedLimitZone;
      clearMessage();
    };

    // Load all students from the database and display them in a table.
    const printTable = async () => {
      const output = document.querySelector("#tableOutput");
      output.textContent = "";

      // Read every row so the user can choose one to edit.
      const sql = "SELECT * FROM tblLocation ORDER BY locationID;";
      const result = await runQuery(sql);

      if (!result || !result.data || result.data.length === 0) {
        output.textContent = "No Rows Returned";
        return;
      }

      const rows = result.data;
      const table = document.createElement("table");
      const headerRow = document.createElement("tr");
      table.appendChild(headerRow);

      // Create the table headings once before the student rows are added.
      const headings = ["Location ID", "Road Name", "Road Type", "District Name", "Junction Type", "Deprivation Score", "Speed Limit Zone", "Action"];

      for (let heading of headings) {
        const th = document.createElement("th");
        th.textContent = heading;
        headerRow.appendChild(th);
      }

      for (let row of rows) {
        const tr = document.createElement("tr");

        const tdLocationId = document.createElement("td");
        tdLocationId.textContent = row.locationID;
        tr.appendChild(tdLocationId);

        const tdRoadName = document.createElement("td");
        tdRoadName.textContent = row.roadName;
        tr.appendChild(tdRoadName);

        const tdRoadType = document.createElement("td");
        tdRoadType.textContent = row.roadType;
        tr.appendChild(tdRoadType);

        const tdDistrictName = document.createElement("td");
        tdDistrictName.textContent = row.districtName;
        tr.appendChild(tdDistrictName);

        const tdJunctionType = document.createElement("td");
        tdJunctionType.textContent = row.junctionType;
        tr.appendChild(tdJunctionType);

        const tdDeprivationScore = document.createElement("td");
        tdDeprivationScore.textContent = row.deprivationScore;
        tr.appendChild(tdDeprivationScore);

        const tdSpeedLimitZone = document.createElement("td");
        tdSpeedLimitZone.textContent = row.speedLimitZone;
        tr.appendChild(tdSpeedLimitZone);

        const tdAction = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
          // Load this row into the form so the user can change it.
          selectLocation(row);
        });
        tdAction.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
          // Ask for confirmation before permanently deleting a row.
          const shouldDelete = confirm(`Delete Location ${row.locationID}?`);
          if (!shouldDelete) {
            return;
          }

          // Remove the chosen student from the database table.
          const deleteSql = `DELETE FROM tblLocation WHERE locationID = ${row.locationID}`;
          const deleteResult = await runQuery(deleteSql);

          if (deleteResult && deleteResult.success) {
            showMessage("Location record deleted successfully.", "success");

            if (selectedLocationID === Number(row.locationID)) {
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

      if (selectedLocationID === null) {
        showMessage("Choose a location from the table before updating.", "error");
        return;
      }

      const validateLocation = (location) => {
      if (!location || typeof location !== "object") {
        return "Location details are required.";
      }

      // Clean up and convert values first so the checks below are easier to write.
      const locationID = Number(location.locationID);
      const roadName = typeof location.roadName === "string" ? location.roadName.trim() : "";
      const roadType = typeof location.roadType === "string" ? location.roadType.trim() : "";
      const districtName = typeof location.districtName === "string" ? location.districtName.trim() : "";
      const junctionType = typeof location.junctionType === "string" ? location.junctionType.trim() : "";
      const deprivationScore = Number(location.deprivationScore);
      const speedLimitZone = Number(location.speedLimitZone);

      if (!Number.isInteger(locationID) || locationID < 1) {
        return "Location ID must be a whole number greater than 0.";
      }

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
      if(junctionType.length < 0){
        return "Junction must be included."
      }

      return "";
      }

      const location = {
        locationID: Number(document.querySelector("#locationID").value),
        roadName: document.querySelector("#roadName").value.trim(),
        roadType: document.querySelector("#roadType").value.trim(),
        districtName: document.querySelector("#districtName").value.trim(),
        junctionType: document.querySelector("#junctionType").value.trim(),
        deprivationScore: Number(document.querySelector("#deprivationScore").value.trim()),
        speedLimitZone: Number(document.querySelector("#speedLimitZone").value)
      };

      // Reuse the same validation rules as the add-record page.
      const validationMessage = validateLocation(location);
      if (validationMessage) {
        showMessage(validationMessage, "error");
        return;
      }

      const escapeSql = (value) => {
       return value.replace(/'/g, "''");
      }

      // Update the original row by matching the student ID that was selected earlier.
      const sql = `
        UPDATE tblLocation
        SET
          roadName = '${escapeSql(location.roadName)}',
          roadType = '${escapeSql(location.roadType)}',
          districtName = '${escapeSql(location.districtName)}',
          junctionType = '${location.junctionType}',
          deprivationScore = '${location.deprivationScore}',
          speedLimitZone = '${location.speedLimitZone}'
        WHERE locationID = ${selectedLocationID};
      `
      console.log(sql);

      // Send the SQL UPDATE statement to the PHP connector.
      const result = await runQuery(sql);

      if (result && result.success) {
        showMessage("Location record updated successfully.", "success");
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