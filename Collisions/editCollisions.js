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

let selectedCollisionID = null;

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
      const selectedCollisionText = document.querySelector("#selectedCollisionText");

      form.reset();
      selectedCollisionID = null;
      selectedCollisionText.textContent = "Choose a Collision from the table first.";
    };

    // Copy the chosen collisions's data from the table into the form fields.
    const selectCollision = (collision) => {
      const selectedCollisionText = document.querySelector("#selectedCollisionText");

      selectedCollisionID = Number(collision.collisionID);
      document.querySelector("#collisionID").value = collision.collisionID;
      document.querySelector("#locationID").value = collision.locationID;
      document.querySelector("#dateAndTime").value = collision.dateAndTime;
      document.querySelector("#weatherCondition").value = collision.weatherCondition;
      document.querySelector("#roadSurface").value = collision.roadSurface;
      document.querySelector("#lightingCondition").value = collision.lightingCondition;
      document.querySelector("#collisionSeverity").value = collision.collisionSeverity;
      document.querySelector("#causationFactor").value = collision.causationFactor;
      document.querySelector("#notes").value = collision.notes;
      clearMessage();
    };

    // Load all collisions from the database and display them in a table.
    const printTable = async () => {
      const output = document.querySelector("#tableOutput");
      output.textContent = "";

      // Read every row so the user can choose one to edit.
      const sql = "SELECT * FROM tblCollision ORDER BY collisionID;";
      const result = await runQuery(sql);

      if (!result || !result.data || result.data.length === 0) {
        output.textContent = "No Rows Returned";
        return;
      }

      const rows = result.data;
      const table = document.createElement("table");
      const headerRow = document.createElement("tr");
      table.appendChild(headerRow);

      // Create the table headings once before the collision rows are added.
      const headings = ["Collision ID", "Location ID", "Date and Time", "Weather Condition", "Road Surface", "Lighting Condition", "Collision Severity", "Causation Factor", "Notes", "Actions"];

      for (let heading of headings) {
        const th = document.createElement("th");
        th.textContent = heading;
        headerRow.appendChild(th);
      }

      for (let row of rows) {
        const tr = document.createElement("tr");

        const tdCollisionId = document.createElement("td");
        tdCollisionId.textContent = row.collisionID;
        tr.appendChild(tdCollisionId);

        const tdLocationId = document.createElement("td");
        tdLocationId.textContent = row.locationID;
        tr.appendChild(tdLocationId);

        const tdDateAndTime = document.createElement("td");
        tdDateAndTime.textContent = row.dateAndTime;
        tr.appendChild(tdDateAndTime);

        const tdWeatherCondition = document.createElement("td");
        tdWeatherCondition.textContent = row.weatherCondition;
        tr.appendChild(tdWeatherCondition);

        const tdRoadSurface = document.createElement("td");
        tdRoadSurface.textContent = row.roadSurface;
        tr.appendChild(tdRoadSurface);

        const tdLightingCondition = document.createElement("td");
        tdLightingCondition.textContent = row.lightingCondition;
        tr.appendChild(tdLightingCondition);

        const tdCollisionSeverity = document.createElement("td");
        tdCollisionSeverity.textContent = row.collisionSeverity;
        tr.appendChild(tdCollisionSeverity);

        const tdCausationFactor = document.createElement("td");
        tdCausationFactor.textContent = row.causationFactor;
        tr.appendChild(tdCausationFactor);

        const tdNotes = document.createElement("td");
        tdNotes.textContent = row.notes;
        tr.appendChild(tdNotes);

        const tdAction = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
          // Load this row into the form so the user can change it.
          selectCollision(row);
        });
        tdAction.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
          // Ask for confirmation before permanently deleting a row.
          const shouldDelete = confirm(`Delete Collision ${row.collisionID}?`);
          if (!shouldDelete) {
            return;
          }

          // Remove the chosen collision from the database table.
          const deleteSql = `DELETE FROM tblCollision WHERE collisionID = ${row.collisionID}`;
          const deleteResult = await runQuery(deleteSql);

          if (deleteResult && deleteResult.success) {
            showMessage("Collision record deleted successfully.", "success");

            if (selectedCollisionID === Number(row.collisionID)) {
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

    // Update the chosen collision when the form is submitted.
    document.querySelector("#editForm").addEventListener("submit", async (event) => {
      event.preventDefault();

      if (selectedCollisionID === null) {
        showMessage("Choose a collision from the table before updating.", "error");
        return;
      }

      const validateCollision = (collision) => {
      if (!collision || typeof collision !== "object") {
        return "Collision details are required.";
      }

      // Clean up and convert values first so the checks below are easier to write.
      const collisionID = Number(collision.collisionID);
      const locationID = Number(collision.locationID);
      const dateAndTime = typeof collision.dateAndTime === "string" ? collision.dateAndTime.trim() : "";
      const weatherCondition = typeof collision.weatherCondition === "string" ? collision.weatherCondition.trim() : "";
      const roadSurface = typeof collision.roadSurface === "string" ? collision.roadSurface.trim() : "";
      const lightingCondition = typeof collision.lightingCondition === "string" ? collision.lightingCondition.trim() : "";
      const collisionSeverity = typeof collision.collisionSeverity === "string" ? collision.collisionSeverity.trim() : "";
      const causationFactor = typeof collision.causationFactor === "string" ? collision.causationFactor.trim() : "";
      const notes = typeof collision.notes === "string" ? collision.notes.trim() : "";

      if (!Number.isInteger(collisionID) || collisionID < 1) {
        return "Collision ID must be a whole number greater than 0.";
      }

      if (!locationID) {
        return "Location ID is required.";
      }

      if (!dateAndTime) {
        return "Date and Time is required.";
      }

      if (!weatherCondition) {
        return "Weather Condition is required.";
      }

      if (!roadSurface) {
        return "Road Surface is required.";
      }

      if (!lightingCondition) {
        return "Lighting Condition is required.";
      }

      if(!collisionSeverity){
        return "Collision Severity is required."
      }

      if (causationFactor.length < 3) {
        return "Causation Factor must be longer than 3 characters.";
      }

      return "";
      }

      const collision = {
        collisionID: Number(document.querySelector("#collisionID").value),
        locationID: Number(document.querySelector("#locationID").value),
        dateAndTime: (document.querySelector("#dateAndTime").value.trim()),
        weatherCondition: document.querySelector("#weatherCondition").value.trim(),
        roadSurface: document.querySelector("#roadSurface").value.trim(),
        lightingCondition: document.querySelector("#lightingCondition").value.trim(),
        collisionSeverity: document.querySelector("#collisionSeverity").value.trim(),
        causationFactor: document.querySelector("#causationFactor").value,
        notes: document.querySelector("#notes").value
      };

      // Reuse the same validation rules as the add-record page.
      const validationMessage = validateCollision(collision);
      if (validationMessage) {
        showMessage(validationMessage, "error");
        return;
      }

      const escapeSql = (value) => {
       return value.replace(/'/g, "''");
      }

      // Update the original row by matching the collision ID that was selected earlier.
      const sql = `
        UPDATE tblCollision
        SET
          locationID = '${collision.locationID}',
          dateAndTime = '${escapeSql(collision.dateAndTime)}',
          weatherCondition = '${escapeSql(collision.weatherCondition)}',
          roadSurface = '${escapeSql(collision.roadSurface)}',
          lightingCondition = '${escapeSql(collision.lightingCondition)}',
          collisionSeverity = '${escapeSql(collision.collisionSeverity)}',
          causationFactor = '${escapeSql(collision.causationFactor)}',
          notes = '${escapeSql(collision.notes)}'
        WHERE collisionID = ${selectedCollisionID};
      `
      console.log(sql);

      // Send the SQL UPDATE statement to the PHP connector.
      const result = await runQuery(sql);

      if (result && result.success) {
        showMessage("Collision record updated successfully.", "success");
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