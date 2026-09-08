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

let selectedVehicleID = null;

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
      const selectedVehicleText = document.querySelector("#selectedVehicleText");

      form.reset();
      selectedVehicleID = null;
      selectedVehicleText.textContent = "Choose a Vehicle from the table first.";
    };

    // Copy the chosen vehicle's data from the table into the form fields.
    const selectVehicle = (vehicle) => {
      const selectedVehicleText = document.querySelector("#selectedVehicleText");

      selectedVehicleID = Number(vehicle.vehicleID);
      document.querySelector("#vehicleID").value = vehicle.vehicleID;
      document.querySelector("#collisionID").value = vehicle.collisionID;
      document.querySelector("#vehicleType").value = vehicle.vehicleType;
      document.querySelector("#VIN").value = vehicle.VIN;
      document.querySelector("#vehicleMake").value = vehicle.vehicleMake;
      document.querySelector("#vehicleModel").value = vehicle.vehicleModel;
      document.querySelector("#vehicleReg").value = vehicle.vehicleReg;
      document.querySelector("#vehicleSpeed").value = vehicle.vehicleSpeed;
      selectedVehicleText.textContent = `Editing vehicle ${vehicle.vehicleID}: ${vehicle.collisionID} ${vehicle.vehicleType} ${vehicle.VIN}: 
      ${vehicle.vehicleMake} ${vehicle.vehicleModel} ${vehicle.vehicleReg} ${vehicle.vehicleSpeed}`;
      clearMessage();
    };

    // Load all vehicles from the database and display them in a table.
    const printTable = async () => {
      const output = document.querySelector("#tableOutput");
      output.textContent = "";

      // Read every row so the user can choose one to edit.
      const sql = "SELECT * FROM tblVehicle ORDER BY vehicleID;";
      const result = await runQuery(sql);

      if (!result || !result.data || result.data.length === 0) {
        output.textContent = "No Rows Returned";
        return;
      }

      const rows = result.data;
      const table = document.createElement("table");
      const headerRow = document.createElement("tr");
      table.appendChild(headerRow);

      // Create the table headings once before the vehicle rows are added.
      const headings = ["Vehicle ID", "Collision ID", "Vehicle Type", "VIN", "Vehicle Make", "Vehicle Model", "Vehicle Reg", "Vehicle Speed", "Actions"];

      for (let heading of headings) {
        const th = document.createElement("th");
        th.textContent = heading;
        headerRow.appendChild(th);
      }

      for (let row of rows) {
        const tr = document.createElement("tr");

        const tdVehicleId = document.createElement("td");
        tdVehicleId.textContent = row.vehicleID;
        tr.appendChild(tdVehicleId);

        const tdCollisionId = document.createElement("td");
        tdCollisionId.textContent = row.collisionID;
        tr.appendChild(tdCollisionId);

        const tdVehicleType = document.createElement("td");
        tdVehicleType.textContent = row.vehicleType;
        tr.appendChild(tdVehicleType);

        const tdVIN = document.createElement("td");
        tdVIN.textContent = row.VIN;
        tr.appendChild(tdVIN);

        const tdVehicleMake = document.createElement("td");
        tdVehicleMake.textContent = row.vehicleMake;
        tr.appendChild(tdVehicleMake);

        const tdVehicleModel = document.createElement("td");
        tdVehicleModel.textContent = row.vehicleModel;
        tr.appendChild(tdVehicleModel);

        const tdVehicleReg = document.createElement("td");
        tdVehicleReg.textContent = row.vehicleReg;
        tr.appendChild(tdVehicleReg);

        const tdVehicleSpeed = document.createElement("td");
        tdVehicleSpeed.textContent = row.vehicleSpeed;
        tr.appendChild(tdVehicleSpeed);

        const tdAction = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
          // Load this row into the form so the user can change it.
          selectVehicle(row);
        });
        tdAction.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
          // Ask for confirmation before permanently deleting a row.
          const shouldDelete = confirm(`Delete Vehicle ${row.vehicleID}?`);
          if (!shouldDelete) {
            return;
          }

          // Remove the chosen vehicle from the database table.
          const deleteSql = `DELETE FROM tblVehicle WHERE vehicleID = ${row.vehicleID}`;
          const deleteResult = await runQuery(deleteSql);

          if (deleteResult && deleteResult.success) {
            showMessage("Vehicle record deleted successfully.", "success");

            if (selectedVehicleID === Number(row.vehicleID)) {
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

    // Update the chosen vehicle when the form is submitted.
    document.querySelector("#editForm").addEventListener("submit", async (event) => {
      event.preventDefault();

      if (selectedVehicleID === null) {
        showMessage("Choose a vehicle from the table before updating.", "error");
        return;
      }

      const validateVehicle = (vehicle) => {
      if (!vehicle || typeof vehicle !== "object") {
        return "Vehicle details are required.";
      }

      // Clean up and convert values first so the checks below are easier to write.
      const vehicleID = Number(vehicle.vehicleID);
      const collisionID = Number(vehicle.collisionID);
      const vehicleType = typeof vehicle.vehicleType === "string" ? vehicle.vehicleType.trim() : "";
      const VIN = typeof vehicle.VIN === "string" ? vehicle.VIN.trim() : "";
      const vehicleMake = typeof vehicle.vehicleMake === "string" ? vehicle.vehicleMake.trim() : "";
      const vehicleModel = typeof vehicle.vehicleModel === "string" ? vehicle.vehicleModel.trim() : "";
      const vehicleReg = typeof vehicle.vehicleReg === "string" ? vehicle.vehicleReg.trim() : "";
      const vehicleSpeed = typeof vehicle.vehicleSpeed === "string" ? vehicle.vehicleSpeed.trim() : "";

      if (!Number.isInteger(vehicleID) || vehicleID < 1) {
        return "Vehicle ID must be a whole number greater than 0.";
      }

      if (!Number.isInteger(collisionID) || collisionID < 1) {
        return "Collision ID must be a valid number.";
      }

      if (!vehicleType) {
        return "Vehicle Type is required.";
      }

      if (!VIN) {
        return "VIN is required.";
      }

      if (!vehicleMake) {
        return "Vehicle Make is required.";
      }

      if (!vehicleModel) {
        return "Vehicle Model is required.";
      }

      if(!vehicleReg){
        return "Vehicle REG is required."
      }

      if(!vehicleSpeed){
        return "Vehicle Speed is required."
      }

      return "";
      }

      const vehicle = {
        vehicleID: Number(document.querySelector("#vehicleID").value),
        collisionID: Number(document.querySelector("#collisionID").value),
        vehicleType: (document.querySelector("#vehicleType").value.trim()),
        VIN: document.querySelector("#VIN").value.trim(),
        vehicleMake: document.querySelector("#vehicleMake").value.trim(),
        vehicleModel: document.querySelector("#vehicleModel").value.trim(),
        vehicleReg: document.querySelector("#vehicleReg").value.trim(),
        vehicleSpeed: document.querySelector("#vehicleSpeed").value,
      };

      // Reuse the same validation rules as the add-record page.
      const validationMessage = validateVehicle(vehicle);
      if (validationMessage) {
        showMessage(validationMessage, "error");
        return;
      }

      const escapeSql = (value) => {
      if (value === null || value === undefined) return "";
      return String(value).replace(/'/g, "''");
      };

      // Update the original row by matching the vehicle ID that was selected earlier.
      const sql = `
        UPDATE tblVehicle
        SET
          collisionID = '${escapeSql(vehicle.collisionID)}',
          vehicleType = '${escapeSql(vehicle.vehicleType)}',
          VIN = '${escapeSql(vehicle.VIN)}',
          vehicleMake = '${escapeSql(vehicle.vehicleMake)}',
          vehicleModel = '${escapeSql(vehicle.vehicleModel)}',
          vehicleReg = '${escapeSql(vehicle.vehicleReg)}',
          vehicleSpeed = '${escapeSql(vehicle.vehicleSpeed)}'
        WHERE vehicleID = ${selectedVehicleID};
      `
      console.log(sql);

      // Send the SQL UPDATE statement to the PHP connector.
      const result = await runQuery(sql);

      if (result && result.success) {
        showMessage("Vehicle record updated successfully.", "success");
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