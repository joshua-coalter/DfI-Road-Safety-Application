const runQuery = async (sql) => {
      try {
        // This is the PHP endpoint that talks to the database for us.
        const url = "https://jcoalter04.webhosting1.eeecs.qub.ac.uk/dbConnector.php";

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

let selectedInterventionID = null;

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
      const selectedInterventionText = document.querySelector("#selectedInterventionText");

      form.reset();
      selectedInterventionID = null;
      selectedInterventionText.textContent = "Choose an Intervention from the table first.";
    };

    // Copy the chosen intervention's data from the table into the form fields.
    const selectIntervention = (intervention) => {
      const selectedInterventionText = document.querySelector("#selectedInterventionText");

      selectedInterventionID = Number(intervention.interventionID);
      document.querySelector("#interventionID").value = intervention.interventionID;
      document.querySelector("#locationID").value = intervention.locationID;
      document.querySelector("#interventionType").value = intervention.interventionType;
      document.querySelector("#implementationDate").value = intervention.implementationDate;
      document.querySelector("#description").value = intervention.description;
      clearMessage();
    };

    // Load all interventions from the database and display them in a table.
    const printTable = async () => {
      const output = document.querySelector("#tableOutput");
      output.textContent = "";

      // Read every row so the user can choose one to edit.
      const sql = "SELECT * FROM tblIntervention ORDER BY interventionID;";
      const result = await runQuery(sql);

      if (!result || !result.data || result.data.length === 0) {
        output.textContent = "No Rows Returned";
        return;
      }

      const rows = result.data;
      const table = document.createElement("table");
      const headerRow = document.createElement("tr");
      table.appendChild(headerRow);

      // Create the table headings once before the intervention rows are added.
      const headings = ["Intervention ID", "Location ID", "Intervention Type", "Implementation Date", "Description", "Actions"];

      for (let heading of headings) {
        const th = document.createElement("th");
        th.textContent = heading;
        headerRow.appendChild(th);
      }

      for (let row of rows) {
        const tr = document.createElement("tr");

        const tdInterventionId = document.createElement("td");
        tdInterventionId.textContent = row.interventionID;
        tr.appendChild(tdInterventionId);

        const tdLocationId = document.createElement("td");
        tdLocationId.textContent = row.locationID;
        tr.appendChild(tdLocationId);

        const tdInterventionType = document.createElement("td");
        tdInterventionType.textContent = row.interventionType;
        tr.appendChild(tdInterventionType);

        const tdImplementationDate = document.createElement("td");
        tdImplementationDate.textContent = row.implementationDate;
        tr.appendChild(tdImplementationDate);

        const tdDescription = document.createElement("td");
        tdDescription.textContent = row.description;
        tr.appendChild(tdDescription);

        const tdAction = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
          // Load this row into the form so the user can change it.
          selectIntervention(row);
        });
        tdAction.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
          // Ask for confirmation before permanently deleting a row.
          const shouldDelete = confirm(`Delete Intervention ${row.interventionID}?`);
          if (!shouldDelete) {
            return;
          }

          // Remove the chosen intervention from the database table.
          const deleteSql = `DELETE FROM tblIntervention WHERE interventionID = ${row.interventionID}`;
          const deleteResult = await runQuery(deleteSql);

          if (deleteResult && deleteResult.success) {
            showMessage("Intervention record deleted successfully.", "success");

            if (selectedInterventionID === Number(row.interventionID)) {
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

    // Update the chosen intervention when the form is submitted.
    document.querySelector("#editForm").addEventListener("submit", async (event) => {
      event.preventDefault();

      if (selectedInterventionID === null) {
        showMessage("Choose an intervention from the table before updating.", "error");
        return;
      }

      const validateIntervention = (intervention) => {
      if (!intervention || typeof intervention !== "object") {
        return "Intervention details are required.";
      }

      // Clean up and convert values first so the checks below are easier to write.
      const interventionID = Number(intervention.interventionID);
      const locationID = Number(intervention.locationID);
      const interventionType = typeof intervention.interventionType === "string" ? intervention.interventionType.trim() : "";
      const implementationDate = typeof intervention.implementationDate === "string" ? intervention.implementationDate.trim() : "";
      const description = typeof intervention.description === "string" ? intervention.description.trim() : "";

      if (!Number.isInteger(interventionID) || interventionID < 1) {
        return "Intervention ID must be a whole number greater than 0.";
      }

      if (!locationID) {
        return "Location ID is required.";
      }

      if (!interventionType) {
        return "Intervention Type is required.";
      }

      return "";
      }

      const intervention = {
        interventionID: Number(document.querySelector("#interventionID").value),
        locationID: Number(document.querySelector("#locationID").value),
        interventionType: (document.querySelector("#interventionType").value.trim()),
        implementationDate: document.querySelector("#implementationDate").value.trim(),
        description: document.querySelector("#description").value.trim(),
      };

      // Reuse the same validation rules as the add-record page.
      const validationMessage = validateIntervention(intervention);
      if (validationMessage) {
        showMessage(validationMessage, "error");
        return;
      }

      const escapeSql = (value) => {
       return value.replace(/'/g, "''");
      }

      // Update the original row by matching the intervention ID that was selected earlier.
      var sql ="";
      if(intervention.implementationDate == ""){
        sql = `
        UPDATE tblIntervention
        SET
          locationID = ${(intervention.locationID)},
          interventionType = '${escapeSql(intervention.interventionType)}',
          implementationDate = null,
          description = '${escapeSql(intervention.description)}'
        WHERE interventionID = ${selectedInterventionID};
        `
      }
      else{
      var sql = `
        UPDATE tblIntervention
        SET
          locationID = ${(intervention.locationID)},
          interventionType = '${escapeSql(intervention.interventionType)}',
          implementationDate = '${escapeSql(intervention.implementationDate)}',
          description = '${escapeSql(intervention.description)}'
        WHERE interventionID = ${selectedInterventionID};
      `
      }
      console.log(sql);

      // Send the SQL UPDATE statement to the PHP connector.
      const result = await runQuery(sql);

      if (result && result.success) {
        showMessage("Intervention record updated successfully.", "success");
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