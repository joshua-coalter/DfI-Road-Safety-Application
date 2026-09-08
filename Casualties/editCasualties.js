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

let selectedCasualtyID = null;

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
      const selectedCasualtyText = document.querySelector("#selectedCasualtyText");

      form.reset();
      selectedCasualtyID = null;
      selectedCasualtyText.textContent = "Choose a Casualty from the table first.";
    };

    // Copy the chosen student's data from the table into the form fields.
    const selectCasualty = (casualty) => {
      const selectedCasualtyText = document.querySelector("#selectedCasualtyText");

      selectedCasualtyID = Number(casualty.casualtyID);
      document.querySelector("#casualtyID").value = casualty.casualtyID;
      document.querySelector("#collisionID").value = casualty.collisionID;
      document.querySelector("#gender").value = casualty.Gender;
      document.querySelector("#ageGroup").value = casualty.ageGroup;
      document.querySelector("#injurySeverity").value = casualty.injurySeverity;
      document.querySelector("#casualtyType").value = casualty.casualtyType;
      clearMessage();
    };

    // Load all students from the database and display them in a table.
    const printTable = async () => {
      const output = document.querySelector("#tableOutput");
      output.textContent = "";

      // Read every row so the user can choose one to edit.
      const sql = "SELECT * FROM tblCasualty ORDER BY casualtyID;";
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
      const headings = ["Casualty ID", "Collision ID", "Gender", "Age Group", "Injury Severity", "Casualty Type", "Action"];

      for (let heading of headings) {
        const th = document.createElement("th");
        th.textContent = heading;
        headerRow.appendChild(th);
      }

      for (let row of rows) {
        const tr = document.createElement("tr");

        const tdCasualtyID = document.createElement("td");
        tdCasualtyID.textContent = row.casualtyID;
        tr.appendChild(tdCasualtyID);

        const tdCollisionID = document.createElement("td");
        tdCollisionID.textContent = row.collisionID;
        tr.appendChild(tdCollisionID);

        const tdGender = document.createElement("td");
        tdGender.textContent = row.Gender;
        tr.appendChild(tdGender);

        const tdAgeGroup = document.createElement("td");
        tdAgeGroup.textContent = row.ageGroup;
        tr.appendChild(tdAgeGroup);

        const tdInjurySeverity = document.createElement("td");
        tdInjurySeverity.textContent = row.injurySeverity;
        tr.appendChild(tdInjurySeverity);

        const tdCasualtyType = document.createElement("td");
        tdCasualtyType.textContent = row.casualtyType;
        tr.appendChild(tdCasualtyType);

        const tdAction = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
          // Load this row into the form so the user can change it.
          selectCasualty(row);
        });
        tdAction.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
          // Ask for confirmation before permanently deleting a row.
          const shouldDelete = confirm(`Delete Casualty ${row.casualtyID}?`);
          if (!shouldDelete) {
            return;
          }

          // Remove the chosen student from the database table.
          const deleteSql = `DELETE FROM tblCasualty WHERE casualtyID = ${row.casualtyID}`;
          const deleteResult = await runQuery(deleteSql);

          if (deleteResult && deleteResult.success) {
            showMessage("Casualty record deleted successfully.", "success");

            if (selectedCasualtyID === Number(row.casualtyID)) {
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

      if (selectedCasualtyID === null) {
        showMessage("Choose a casualty from the table before updating.", "error");
        return;
      }

      const validateCasualty = (casualty) => {
      if (!casualty || typeof casualty !== "object") {
        return "Casualty details are required.";
      }

      // Clean up and convert values first so the checks below are easier to write.
      const casualtyID = Number(casualty.casualtyID);
      const collisionID = Number(casualty.collisionID);
      const Gender = typeof casualty.Gender === "string" ? casualty.Gender.trim() : "";
      const ageGroup = typeof casualty.ageGroup === "string" ? casualty.ageGroup.trim() : "";
      const injurySeverity = typeof casualty.injurySeverity === "string" ? casualty.injurySeverity.trim() : "";
      const casualtyType = typeof casualty.casualtyType === "string" ? casualty.casualtyType.trim() : "";

      if (!Number.isInteger(casualtyID) || casualtyID < 1) {
        return "Casualty ID must be a whole number greater than 0.";
      }

      if (!collisionID) {
        return "Collision ID is required.";
      }

      if (!Gender) {
        return "Gender is required.";
      }

      if (!ageGroup) {
        return "Gender is required.";
      }

      if (!injurySeverity) {
        return "Injury Severity is required.";
      }

      //Should allow no values and set to null but doing this as a temporary fix.
      if(!casualtyType){
        return "Casualty Type is required."
      }

      return "";
      }

      const casualty = {
        casualtyID: Number(document.querySelector("#casualtyID").value),
        collisionID: Number(document.querySelector("#collisionID").value),
        Gender: document.querySelector("#gender").value.trim(),
        ageGroup: document.querySelector("#ageGroup").value.trim(),
        injurySeverity: document.querySelector("#injurySeverity").value.trim(),
        casualtyType: document.querySelector("#casualtyType").value.trim()
      };

      // Reuse the same validation rules as the add-record page.
      const validationMessage = validateCasualty(casualty);
      if (validationMessage) {
        showMessage(validationMessage, "error");
        return;
      }

      const escapeSql = (value) => {
       return value.replace(/'/g, "''");
      }

      // Update the original row by matching the student ID that was selected earlier.
      const sql = `
        UPDATE tblCasualty
        SET
          collisionID = '${casualty.collisionID}',
          Gender = '${escapeSql(casualty.Gender)}',
          ageGroup = '${escapeSql(casualty.ageGroup)}',
          injurySeverity = '${escapeSql(casualty.injurySeverity)}',
          casualtyType = '${escapeSql(casualty.casualtyType)}'
        WHERE casualtyID = ${selectedCasualtyID};
      `
      console.log(sql);

      // Send the SQL UPDATE statement to the PHP connector.
      const result = await runQuery(sql);

      if (result && result.success) {
        showMessage("Casualty record updated successfully.", "success");
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