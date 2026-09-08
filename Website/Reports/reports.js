const reportSelect = document.getElementById("reportSelect");
const runReportBtn = document.getElementById("runReportBtn");
const reportMessage = document.getElementById("reportMessage");
const reportTitle = document.getElementById("reportTitle");
const dynamicInput = document.getElementById("dynamicInput");
const dynamicInputLbl = document.getElementById("dynamicInputLbl");
const chart = document.querySelector("#chart");
const chartElement = document.getElementById("#chart");
let myChart = null;

const escapeSql = (value) => {
       return value.replace(/'/g, "''");
    }


// Setup connection.
const sendQuery = async (sql) => {
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

    
//Display dynamic stuff if applicable.
    reportSelect.addEventListener("change", async() => {
      const selected = reportSelect.value;
      const report = reports[selected];
      console.log("Starting method");
      console.log("Selected:" + selected);
      console.log("Report:" + report);

  if(!report){
    console.log("No report")
    dynamicInput.style.display = "none";
    dynamicInputLbl.innerHTML = "No dynamic input available.";
    console.log("Exiting method");
    return;
  }
  
  if (!report.dynamicText){
    console.log("No dynamic text")
    dynamicInput.style.display = "none";
    dynamicInputLbl.innerHTML = "No dynamic input available.";
    console.log("N/A");
  }
  else{
    console.log("Displaying dynamic text")
    dynamicInput.style.display = "";

    dynamicInputLbl.innerHTML = report.dynamicText;
    output.innerHTML = "";
    console.log("Changed label");
  }
});

    /**
     * HOW TO ADD REPORTS:
     * 
     * NO DYNAMIC DATA (NO INPUT):
     * 1. CHECK THE REPORT NUMBER FOR YOUR OWN.
     * 2. PASTE SQL INTO QUERY VARIABLE UNDER YOUR REPORT
     * 3. GO TO THE SWITCH STATEMENT ON LINE 245
     * 4. CREATE A NEW CASE FOR YOUR REPORT.
     * 5. COPY AND PASTE STUFF.
     * 6. RUN AND TEST.
     * 
     * DYNAMIC DATA:
     * 1. CHECK THE REPORT NUMBER FOR YOUR OWN.
     * 2. PASTE SQL INTO QUERY - SEE NUMBER 5 FOR EXAMPLE [REMOVE LAST BIT OF WHERE CLAUSE]
     * 3. ADD "dynamicText" VARIABLE AND PUT IN WHAT YOU WANT IT TO SAY (LABEL)
     * 4. GO TO THE SWITCH STATEMENT ON LINE 245
     * 5. CREATE A NEW CASE FOR YOUR REPORT.
     * 6. COPY AND PASTE STUFF.
     * 7. RUN AND TEST, TEXTBOX SHOULD AUTOMATICALLY APPEAR
     */






// Available reports.    
const reports = {
  r1: {
    title: "Fatal and Serious Collisions by District (year)",
    query: `SELECT *, SUM(Fatal+Serious) AS fatalSerious
FROM vwSeriousCollYear
WHERE vwSeriousCollYear.year = '`,
    numericValue: 1,
    dynamicText: "Enter year:"
  },

  r2: {
    title: "Intervention Effectiveness - Pre vs Post Collision Count (Intervention Type)",
    query: "SELECT l.roadName, i.interventionType, i.implementationDate," +
      " SUM(CASE WHEN c.dateAndTime < i.implementationDate THEN 1 ELSE 0 END) AS collisionsBefore," +
      " SUM(CASE WHEN c.dateAndTime >= i.implementationDate THEN 1 ELSE 0 END) AS collisionsAfter," +
      " ROUND((" +
      "SUM(CASE WHEN c.dateAndTime >= i.implementationDate THEN 1 ELSE 0 END) - SUM(CASE WHEN c.dateAndTime < i.implementationDate THEN 1 ELSE 0 END)\n" +
      ") * -100.0 / NULLIF(SUM(CASE WHEN c.dateAndTime < i.implementationDate THEN 1 ELSE 0 END), 0), 2) AS percentageImprovement\n" +
      "FROM tblIntervention AS i\n" +
      "JOIN tblLocation AS l   ON i.LocationID  = l.LocationID\n" +
      "JOIN tblCollision AS c  ON c.LocationID  = l.LocationID\n" +
      "GROUP BY l.RoadName, i.InterventionType, i.ImplementationDate;",
    numericValue: 2,
  },

  r3: {
    title: "Collisions by Weather and Road Surface Condition",
    query: "SELECT c.weatherCondition, c.roadSurface," +
      "COUNT(*) AS totalCollisions," +
      "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentageOfAll\n" +
      "FROM tblCollision AS c\n" +
      "GROUP BY c.weatherCondition, c.roadSurface\n" +
      "ORDER BY totalCollisions DESC;",
    numericValue: 3,
  },

  r4: {
    title: "Highest Risk Junctions",
    query: `SELECT * FROM vwLocationCollisionAmount LIMIT 10`,
    
    numericValue: 4
  },

  r5: {
    title: "Collisions by Lighting Conditions",
    query: "SELECT coll.*, loc.roadName\n" +
      "FROM tblCollision as coll\n" +
      "INNER JOIN tblLocation as loc ON coll.locationID = loc.locationID\n" +
      "WHERE lightingCondition = '",
    numericValue: 5,
    dynamicText: "Enter lighting condition (Daylight, Dusk, Darkness):"
  },

  r6: {
    title: "Interventions yet to be implemented",
    query: "SELECT inter.*, loc.roadName\n" +
    "FROM tblIntervention as inter\n" +
    "INNER JOIN tblLocation as loc\n" +
    "ON inter.locationID = loc.locationID\n" +
    "WHERE inter.implementationDate IS NULL;",
    numericValue: 6
  },

  r7: {
    title: "Collisions by Severity",
    query: "SELECT c.collisionID, l.roadName, c.dateAndTime, c.weatherCondition, c.roadSurface, c.lightingCondition, c.collisionSeverity,c.causationFactor\n" +
    "FROM tblCollision AS c\n" +
    "JOIN tblLocation AS l\n" +
 	  "ON c.locationID = l.locationID\n" +
    "WHERE collisionSeverity = '",
    numericValue: 7,
    dynamicText: "Enter Severity (Serious/Slight/Fatal):"
  },

  r8: {
    title: "Young Driver Collision Summary (Under 25 Age Band)",
    query: "SELECT driverID, gender, ageGroup, licenceType, impairmentFlag\n" +
    "FROM tblDriver\n" +
    "WHERE ageGroup = '16-24';",
    numericValue: 8
  },

  r9: {
    title: "Collisions sorted by vehicle speed",
    query:  "SELECT c.collisionID, c.dateAndTime, c.locationID, v.vehicleType, v.vehicleSpeed, c.collisionSeverity, c.weatherCondition\n" +
    "FROM tblCollision AS c\n" + 
    "JOIN tblVehicle AS v\n" +
	  "ON c.collisionID = v.collisionID\n" +
    "ORDER BY v.vehicleSpeed DESC;",    
    numericValue: 9
  },

  r10: {
    title: "Most Common Contributory Factors",
    query: `SELECT 
    c.causationFactor,
    COUNT(c.collisionID) AS totalCollisions
    FROM tblCollision c
    GROUP BY c.causationFactor
    ORDER BY totalCollisions DESC;`,
    
    numericValue: 10
  },

  r11: {
    title: "Collisions by vehicle type",
    query: `SELECT 
    v.vehicleType,
    COUNT(DISTINCT c.collisionID) AS totalCollisions
    FROM tblVehicle v
    INNER JOIN tblCollision c ON v.collisionID = c.collisionID
    GROUP BY v.vehicleType
    ORDER BY totalCollisions DESC;`,

    numericValue: 11
  },

  r12: {
    title: "Collisions caused by male/female drivers",
    query: `SELECT 
    d.Gender,
    COUNT(DISTINCT c.collisionID) AS totalCollisions
    FROM tblDriver d
    INNER JOIN tblVehicle v ON d.vehicleID = v.vehicleID
      INNER JOIN tblCollision c ON v.collisionID = c.collisionID
    GROUP BY d.Gender;`,
    
    numericValue: 12
    
  },

  r13: {
    title: "Casualty Rate by Age Band and Severity",
    query: `SELECT
    ageGroup,
    injurySeverity,
    COUNT(DISTINCT casualtyID) AS totalCasualty
    FROM tblCasualty
    GROUP BY ageGroup, injurySeverity;`,
    
    numericValue: 13
  },

  r14: {
    title: "Locations by Deprivation score",
    query: `SELECT
    locationID,
    roadName,
    roadType,
    districtName,
    junctionType,
    speedLimitZone,
    deprivationScore
    FROM tblLocation
    ORDER BY deprivationScore DESC;`,
    
    numericValue: 14
  },

  r15: {
    title: "Collisions by licence type",
    query: `SELECT
    d.licenceType,
    COUNT(DISTINCT c.collisionID) AS totalCollision
    FROM tblDriver d
    INNER JOIN tblVehicle v ON d.vehicleID = v.vehicleID
    INNER JOIN tblCollision c ON v.collisionID = c.collisionID
    GROUP BY licenceType;`,
    
    numericValue: 15
  }
};

// On buttons press display report.
runReportBtn.addEventListener("click", async () => {
  reportMessage.textContent = "";
  if(myChart){
    myChart.destroy();
  }
  
  const selected = reportSelect.value;
   const output = document.querySelector("#output");

  if (!selected) {
    output.innerHTML = "";
    reportMessage.textContent = "Please select a report.";
    return;
  }

  const report = reports[selected];
  reportTitle.textContent = report.title;

  try {
    output.innerHTML = "";
    console.log(report.query);
    console.log(dynamicInput.value);
    var sql = "";
    if(!report.dynamicText){
      sql = report.query;
    }
    else{
      sql = report.query + dynamicInput.value + "'";
      console.log(sql);
    }
    
    console.log("Sending query")
    const result = await sendQuery(sql);

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
    console.log("Creating generic table.")
    const rows = result.data;
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    const labels = [];
    const chartData = [];

    switch(report.numericValue){
      case 1: // "Fatal and Serious Collisions by District (year)",
        console.log("Creating case 1 table.")
        const thDistrict = document.createElement("th");
        const thFatal = document.createElement("th");
        const thSerious = document.createElement("th");
        const thTotalCollisions = document.createElement("th");

        thDistrict.textContent = "District";
        thFatal.textContent = "Fatal";
        thSerious.textContent = "Serious";
        thTotalCollisions.textContent = "Total Fatal/Serious";

        table.appendChild(headerRow);

        headerRow.appendChild(thDistrict);
        headerRow.appendChild(thFatal);
        headerRow.appendChild(thSerious);
        headerRow.appendChild(thTotalCollisions);

        for(let row of rows){
            const tr = document.createElement("tr");

            const tdDistrict = document.createElement("td");
            const tdFatal = document.createElement("td");
            const tdSerious = document.createElement("td");
            const tdTotalCollisions = document.createElement("td");

            tdDistrict.textContent = row.DistrictName;
            tdFatal.textContent = row.Fatal;
            tdSerious.textContent = row.Serious;
            tdTotalCollisions.textContent = row.fatalSerious;

            tr.appendChild(tdDistrict);
            tr.appendChild(tdFatal);
            tr.appendChild(tdSerious);
            tr.appendChild(tdTotalCollisions);
            
            table.appendChild(tr);

        }

        sql = `SELECT DistrictName, SUM(Fatal+Serious) AS fatalSerious
        FROM vwSeriousCollYear
        WHERE year ='` + dynamicInput.value + "'" +
        "GROUP BY DistrictName;"

        console.log(sql)
        const result2 = await sendQuery(sql);
        const rows2 = result2.data;

    if (!result2.success) {
      console.log("Fail");
      reportMessage.textContent = result.error || "Query failed.";
      return;
    }

    
    if(!result2 || result2.data.length === 0) {
      console.log("No rows");
      output.textContent = "No Rows Returned";
      return;
    }
    
    for(let row of rows2){
      console.log(row);
      labels.push(`${row.DistrictName}`);
      chartData.push(Number(row.fatalSerious));
    }

        
        
        myChart = new Chart(chart, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [{
              label: "Collisions",
              data: chartData
            }]
          }
        });
        break;

      case 2: // "Intervention Effectiveness - Pre vs Post Collision Count (Intervention Type)"
        console.log("Creating case 2 table.")
        const thRoad = document.createElement("th");
        const thInterventionType = document.createElement("th");
        const thImplementationDate = document.createElement("th");
        const thCollisionsBefore = document.createElement("th");
        const thCollisionsAfter = document.createElement("th");
        const thPercentageImprovement = document.createElement("th");

        thRoad.textContent = "Road Name";
        thInterventionType.textContent = "Intervention Type";
        thImplementationDate.textContent = "Implementation Date";
        thCollisionsBefore.textContent = "Collisions Before";
        thCollisionsAfter.textContent = "Collisions After";
        thPercentageImprovement.textContent = "Percentage Improvement";

        headerRow.appendChild(thRoad);
        headerRow.appendChild(thInterventionType);
        headerRow.appendChild(thImplementationDate);
        headerRow.appendChild(thCollisionsBefore);
        headerRow.appendChild(thCollisionsAfter);
        headerRow.appendChild(thPercentageImprovement);

        table.appendChild(headerRow);

        for(let row of rows){
          const tr = document.createElement("tr");

          const tdRoad = document.createElement("td");
          const tdInterventionType = document.createElement("td");
          const tdImplementationDate = document.createElement("td");
          const tdCollisionsBefore = document.createElement("td");
          const tdCollisionsAfter = document.createElement("td");
          const tdPercentageImprovement = document.createElement("td");

          tdRoad.textContent = row.roadName;
          tdInterventionType.textContent = row.interventionType;
          tdImplementationDate.textContent = row.implementationDate;
          tdCollisionsBefore.textContent = row.collisionsBefore;
          tdCollisionsAfter.textContent = row.collisionsAfter;
          tdPercentageImprovement.textContent = row.percentageImprovement;
    
          tr.appendChild(tdRoad);
          tr.appendChild(tdInterventionType);
          tr.appendChild(tdImplementationDate);
          tr.appendChild(tdCollisionsBefore);
          tr.appendChild(tdCollisionsAfter);
          tr.appendChild(tdPercentageImprovement);
          
          table.appendChild(tr)
        }
        break;

      case 3: //"Collisions by Weather and Road Surface Condition",
        console.log("Creating case 3 table.")
        const thWeather = document.createElement("th");
        const thRoadSurface = document.createElement("th");
        const thAllCollisions = document.createElement("th");
        const thPercentage = document.createElement("th");

        thWeather.textContent = "Weather Conditions";
        thRoadSurface.textContent = "Road Surface";
        thAllCollisions.textContent = "Total Collisions";
        thPercentage.textContent = "Percentage of All Collisons";

        headerRow.appendChild(thWeather);
        headerRow.appendChild(thRoadSurface);
        headerRow.appendChild(thAllCollisions);
        headerRow.appendChild(thPercentage);

        table.appendChild(headerRow);

        for(let row of rows){
          const tr = document.createElement("tr");

          const tdWeather = document.createElement("td");
          const tdRoadSurface = document.createElement("td");
          const tdAllCollisions = document.createElement("td");
          const tdPercentage = document.createElement("td");

          tdWeather.textContent = row.weatherCondition;
          tdRoadSurface.textContent = row.roadSurface;
          tdAllCollisions.textContent = row.totalCollisions;
          tdPercentage.textContent = row.percentageOfAll;
    
          tr.appendChild(tdWeather);
          tr.appendChild(tdRoadSurface);
          tr.appendChild(tdAllCollisions);
          tr.appendChild(tdPercentage);
          
          table.appendChild(tr)

          labels.push(`${row.weatherCondition}: ${row.roadSurface}`)
          chartData.push(Number(row.percentageOfAll));
        }

        myChart = new Chart(chart, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [{
              label: "Collisions",
              data: chartData,
              backgroundColor: "#133e84",
              borderColor: "#87CEEB",
              borderWidth: 1
            }]
          }
        });
        break;
      
      case 4: //Highest Risk Junctions -- EDIT INTO GRAPH
        const thCollisionAmount = document.createElement("th");
        const thRoadTitle = document.createElement("th");
        const thDistrictName = document.createElement("th");
        const thJunctionType = document.createElement("th");
      

        thCollisionAmount.textContent = "Collision Amount";
        thRoadTitle.textContent = "Road Name";
        thDistrictName.textContent = "District";
        thJunctionType.textContent = "Junction Type";

        headerRow.appendChild(thCollisionAmount);
        headerRow.appendChild(thRoadTitle);
        headerRow.appendChild(thDistrictName);
        headerRow.appendChild(thJunctionType);

        table.appendChild(headerRow);

        for(let row of rows){
          const tr = document.createElement("tr");

          const tdCollisionAmount = document.createElement("td");
          const tdRoadTitle = document.createElement("td");
          const tdDistrictName = document.createElement("td");
          const tdJunctionType = document.createElement("td");

          tdCollisionAmount.textContent = row.collisionAmount;
          tdRoadTitle.textContent = row.roadName;
          tdDistrictName.textContent = row.districtName;
          tdJunctionType.textContent = row.junctionType;
    
          tr.appendChild(tdCollisionAmount);
          tr.appendChild(tdRoadTitle);
          tr.appendChild(tdDistrictName);
          tr.appendChild(tdJunctionType);
          
          table.appendChild(tr)

            labels.push(`${row.districtName}: ${row.roadName}`);
            chartData.push(Number(row.collisionAmount));
        }

        myChart = new Chart(chart, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [{
              label: "Collisions",
              data: chartData,
              backgroundColor: "#133e84",
              borderColor: "#87CEEB",
              borderWidth: 1
            }]
          }
        });
        break;

      case 5: //Collisions by lighting conditions.
        console.log("Creating case 5 table.")
        const thCollisionID = document.createElement("th");
        const thRoadName = document.createElement("th");
        const thDateAndTime = document.createElement("th");
        const thWeatherCondition = document.createElement("th");
        const thRoadStructure = document.createElement("th");
        const thlLightingCondition = document.createElement("th");
        const thCollisionSeverity = document.createElement("th");
        const thCausationFactor = document.createElement("th");
        const thNotes = document.createElement("th");

        thCollisionID.textContent = "Collision ID";
        thRoadName.textContent = "Road Name";
        thDateAndTime.textContent = "Date & Time";
        thWeatherCondition.textContent = "Weather Conditions";
        thlLightingCondition.textContent = "Lighting Conditions";
        thCollisionSeverity.textContent = "Collision Severity.";
        thCausationFactor.textContent = "Causation Factor";
        thNotes.textContent = "Notes";

        table.appendChild(headerRow);

        headerRow.appendChild(thCollisionID);
        headerRow.appendChild(thRoadName);
        headerRow.appendChild(thDateAndTime);
        headerRow.appendChild(thWeatherCondition);
        headerRow.appendChild(thlLightingCondition);
        headerRow.appendChild(thCollisionSeverity);
        headerRow.appendChild(thCausationFactor);
        headerRow.appendChild(thNotes);

        for(let row of rows){
            const tr = document.createElement("tr");

            const tdCollisionID = document.createElement("td");
            const tdRoadName = document.createElement("td");
            const tdDateAndTime = document.createElement("td");
            const tdWeatherCondition = document.createElement("td");
            const tdRoadSurface = document.createElement("td");
            const tdlLightingCondition = document.createElement("td");
            const tdCollisionSeverity = document.createElement("td");
            const tdCausationFactor = document.createElement("td");
            const tdNotes = document.createElement("td");

            tdCollisionID.textContent = row.collisionID;
            tdRoadName.textContent = row.roadName;
            tdDateAndTime.textContent = row.dateAndTime;
            tdWeatherCondition.textContent = row.weatherCondition;
            tdlLightingCondition.textContent = row.lightingCondition;
            tdCollisionSeverity.textContent = row.collisionSeverity;
            tdCausationFactor.textContent = row.causationFactor;
            tdNotes.textContent = row.notes;

            tr.appendChild(tdCollisionID);
            tr.appendChild(tdRoadName);
            tr.appendChild(tdDateAndTime);
            tr.appendChild(tdWeatherCondition);
            tr.appendChild(tdlLightingCondition);
            tr.appendChild(tdCollisionSeverity);
            tr.appendChild(tdCausationFactor);
            tr.appendChild(tdNotes);
            
            table.appendChild(tr);

            

        }
        break;

      case 6: //Interventions yet to be implemented.
                console.log("Creating case 7 table.")
        const thInterventionID = document.createElement("th");
        const thLocationName = document.createElement("th");
        const thInterventionDetails = document.createElement("th");
        const thImplementationTime = document.createElement("th");
        const thDescription = document.createElement("th");

        thInterventionID.textContent = "Intervention ID";
        thLocationName.textContent = "Road Name";
        thInterventionDetails.textContent = "Intervention Type";
        thImplementationTime.textContent = "Implementation Date";
        thDescription.textContent = "Description";

        headerRow.appendChild(thInterventionID);
        headerRow.appendChild(thLocationName);
        headerRow.appendChild(thInterventionDetails);
        headerRow.appendChild(thImplementationTime);
        headerRow.appendChild(thDescription);

        table.appendChild(headerRow);
        
        for (let row of rows){
          const tr = document.createElement("tr");

          const tdInterventionID = document.createElement("td");
          const tdLocationName = document.createElement("td");
          const tdInterventionType = document.createElement("td");
          const tdImplementationDate = document.createElement("td");
          const tdDescription = document.createElement("td");

          tdInterventionID.textContent = row.interventionID;
          tdLocationName.textContent = row.roadName;
          tdInterventionType.textContent = row.interventionType;
          tdImplementationDate.textContent = row.implementationDate;
          tdDescription.textContent = row.description;

          tr.appendChild(tdInterventionID);
          tr.appendChild(tdLocationName);
          tr.appendChild(tdInterventionType);
          tr.appendChild(tdImplementationDate);
          tr.appendChild(tdDescription);

          table.appendChild(tr);
        }
        break;
      case 7: //Collisions by severity.
                console.log("Creating case 9 table.")
        const thCollisionNo = document.createElement("th");
        const thRoadDictation = document.createElement("th");
        const thTime = document.createElement("th");
        const thWeatherStyle = document.createElement("th");
        const thRoadBeLike = document.createElement("th");
        const thLightingCondition = document.createElement("th");
        const thCollisionSev = document.createElement("th");
        const thCausationReason = document.createElement("th");

        thCollisionNo.textContent = "Collision ID";
        thRoadDictation.textContent = "Road Name";
        thTime.textContent = "Date and Time";
        thWeatherStyle.textContent = "Weather Cond.";
        thRoadBeLike.textContent = "Road Surface";
        thLightingCondition.textContent = "Lighting Cond.";
        thCollisionSev.textContent = "Severity";
        thCausationReason.textContent = "Cause";

        headerRow.appendChild(thCollisionNo);
        headerRow.appendChild(thRoadDictation);
        headerRow.appendChild(thTime);
        headerRow.appendChild(thWeatherStyle);
        headerRow.appendChild(thRoadBeLike);
        headerRow.appendChild(thLightingCondition);
        headerRow.appendChild(thCollisionSev);
        headerRow.appendChild(thCausationReason);

        table.appendChild(headerRow);
        
        for (let row of rows){
          const tr = document.createElement("tr");

          const tdCollisionID = document.createElement("td");
          const tdRoadName = document.createElement("td");
          const tdDateAndTime = document.createElement("td");
          const tdWeatherCondition = document.createElement("td");
          const tdRoadSurface = document.createElement("td");
          const tdlLightingCondition = document.createElement("td");
          const tdCollisionSeverity = document.createElement("td");
          const tdCausationFactor = document.createElement("td");

          tdCollisionID.textContent = row.collisionID;
          tdRoadName.textContent = row.roadName;
          tdDateAndTime.textContent = row.dateAndTime;
          tdWeatherCondition.textContent = row.weatherCondition;
          tdRoadSurface.textContent = row.roadSurface;
          tdlLightingCondition.textContent = row.lightingCondition;
          tdCollisionSeverity.textContent = row.collisionSeverity;
          tdCausationFactor.textContent = row.causationFactor;

          tr.appendChild(tdCollisionID);
          tr.appendChild(tdRoadName);
          tr.appendChild(tdDateAndTime);
          tr.appendChild(tdWeatherCondition);
          tr.appendChild(tdRoadSurface);
          tr.appendChild(tdlLightingCondition);
          tr.appendChild(tdCollisionSeverity);
          tr.appendChild(tdCausationFactor);

          table.appendChild(tr);
        }

        sql = `SELECT c.collisionSeverity, COUNT(*) AS totalCollisions
FROM tblCollision AS c
GROUP BY c.collisionSeverity
ORDER BY totalCollisions DESC;`

        console.log(sql)
        const result3 = await sendQuery(sql);
        const rows3 = result3.data;

    if (!result3.success) {
      console.log("Fail");
      reportMessage.textContent = result.error || "Query failed.";
      return;
    }

    
    if(!result3 || result3.data.length === 0) {
      console.log("No rows");
      output.textContent = "No Rows Returned";
      return;
    }
    
    for(let row of rows3){
      console.log(row);
      labels.push(`${row.collisionSeverity}`);
      chartData.push(Number(row.totalCollisions));
    }

        
        
        myChart = new Chart(chart, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [{
              label: "Collisions",
              data: chartData
            }]
          }
        });
        break;
      
      case 8: //Young driver collision summary.
        console.log("Creating case 6 table.")
        const thDriverID = document.createElement("th");
        const thGender = document.createElement("th");
        const thAgeGroup = document.createElement("th");
        const thLicenceType = document.createElement("th");
        const thImpairmentFlag = document.createElement("th");

        thDriverID.textContent = "Driver ID";
        thGender.textContent = "Gender";
        thAgeGroup.textContent = "Age Group";
        thLicenceType.textContent = "Licence Type";
        thImpairmentFlag.textContent = "Impairment";

        headerRow.appendChild(thDriverID);
        headerRow.appendChild(thGender);
        headerRow.appendChild(thAgeGroup);
        headerRow.appendChild(thLicenceType);
        headerRow.appendChild(thImpairmentFlag);

        table.appendChild(headerRow);
        
        for (let row of rows){
          const tr = document.createElement("tr");

          const tdDriverID = document.createElement("td");
          const tdGender = document.createElement("td");
          const tdAgeGroup = document.createElement("td");
          const tdLicenceType = document.createElement("td");
          const tdImpairmentFlag = document.createElement("td");

          tdDriverID.textContent = row.driverID;
          tdGender.textContent = row.gender;
          tdAgeGroup.textContent = row.ageGroup;
          tdLicenceType.textContent = row.licenceType;
          tdImpairmentFlag.textContent = row.impairmentFlag;

          tr.appendChild(tdDriverID);
          tr.appendChild(tdGender);
          tr.appendChild(tdAgeGroup);
          tr.appendChild(tdLicenceType);
          tr.appendChild(tdImpairmentFlag);

          table.appendChild(tr);

        }
        break;
      
      case 9: //Collisions sorted by vehicle speed
        console.log("Creating case 9 table.")
        console.log("Creating case 8 table.")
        const thCollisionNumber = document.createElement("th");
        const thDate = document.createElement("th");
        const thLocationID = document.createElement("th");
        const thVehicleType = document.createElement("th");
        const thVehicleSpeed = document.createElement("th");
        const thSeverity = document.createElement("th");
        const thWeatherBeLike = document.createElement("th");

        thCollisionNumber.textContent = "Collision ID";
        thDate.textContent = "Date and Time";
        thLocationID.textContent = "Location ID";
        thVehicleType.textContent = "Vehicle Type";
        thVehicleSpeed.textContent = "Vehicle Speed";
        thSeverity.textContent = "Severity";
        thWeatherBeLike.textContent = "Weather Cond.";

        headerRow.appendChild(thCollisionNumber);
        headerRow.appendChild(thDate);
        headerRow.appendChild(thLocationID);
        headerRow.appendChild(thVehicleType);
        headerRow.appendChild(thVehicleSpeed);
        headerRow.appendChild(thSeverity);
        headerRow.appendChild(thWeatherBeLike);

        table.appendChild(headerRow);
        
        for (let row of rows){
          const tr = document.createElement("tr");

          const tdCollisionID = document.createElement("td");
          const tdDateAndTime = document.createElement("td");
          const tdLocationID = document.createElement("td");
          const tdVehicleType = document.createElement("td");
          const tdVehicleSpeed = document.createElement("td");
          const tdCollisionSeverity = document.createElement("td");
          const tdWeatherCondition = document.createElement("td");

          tdCollisionID.textContent = row.collisionID;
          tdDateAndTime.textContent = row.dateAndTime;
          tdLocationID.textContent = row.locationID;
          tdVehicleType.textContent = row.vehicleType;
          tdVehicleSpeed.textContent = row.vehicleSpeed;
          tdCollisionSeverity.textContent = row.collisionSeverity;
          tdWeatherCondition.textContent = row.weatherCondition;

          tr.appendChild(tdCollisionID);
          tr.appendChild(tdDateAndTime);
          tr.appendChild(tdLocationID);
          tr.appendChild(tdVehicleType);
          tr.appendChild(tdVehicleSpeed);
          tr.appendChild(tdCollisionSeverity);
          tr.appendChild(tdWeatherCondition);

          table.appendChild(tr);
          
          
        }
        break;

        case 10: //Most Common Contributory Factors
        const thCausationFactors = document.createElement("th");
        const thTotallyCollisions = document.createElement("th");
        
      

        thCausationFactors.textContent = "Causation Factor";
        thTotallyCollisions.textContent = "Total Collisions";
        

        headerRow.appendChild(thCausationFactors);
        headerRow.appendChild(thTotallyCollisions);

        table.appendChild(headerRow);

        for(let row of rows){
          const tr = document.createElement("tr");

          const tdCausationFactors = document.createElement("td");
          const tdTotallyCollisions = document.createElement("td");
         

          tdCausationFactors.textContent = row.causationFactor;
          tdTotallyCollisions.textContent = row.totalCollisions;
          
          tr.appendChild(tdCausationFactors);
          tr.appendChild(tdTotallyCollisions);
          
          
          table.appendChild(tr)

           labels.push(`${row.causationFactor}`);
            chartData.push(Number(row.totalCollisions));
        }
        myChart = new Chart(chart, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [{
              label: "Collisions",
              data: chartData,
              backgroundColor: "#133e84",
              borderColor: "#87CEEB",
              borderWidth: 1
            }]
          }
        });
        break;  

        case 11: //Collisions by Vehicle Type
        const thVehicleTypes = document.createElement("th");
        const thTotalC0llisions = document.createElement("th");
        

        thVehicleTypes.textContent = "Vehicle Types";
        thTotalC0llisions.textContent = "Total Collisions";
        

        headerRow.appendChild(thVehicleTypes);
        headerRow.appendChild(thTotalC0llisions);
        

        table.appendChild(headerRow);
        
        for (let row of rows){
          const tr = document.createElement("tr");

          const tdVehicleTypes = document.createElement("td");
          const tdTotalC0llisions = document.createElement("td");
          

          tdVehicleTypes.textContent = row.vehicleType;
          tdTotalC0llisions.textContent = row.totalCollisions;
         

          tr.appendChild(tdVehicleTypes);
          tr.appendChild(tdTotalC0llisions);
          
          table.appendChild(tr);
          
          labels.push(`${row.vehicleType}`);
            chartData.push(Number(row.totalCollisions));
        }

         myChart = new Chart(chart, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [{
              label: "Collisions",
              data: chartData
            }]
          }
        });
        break;

        case 12: //Collisions caused by male/female drivers
        const thGenders = document.createElement("th");
        const thT0talCollisions = document.createElement("th");
        

        thGenders.textContent = "Gender";
        thT0talCollisions.textContent = "Total Collisions";
        

        headerRow.appendChild(thGenders);
        headerRow.appendChild(thT0talCollisions);
        

        table.appendChild(headerRow);
        
        for (let row of rows){
          const tr = document.createElement("tr");

          const tdGenders = document.createElement("td");
          const tdT0talCollisions = document.createElement("td");
          

          tdGenders.textContent = row.Gender;
          tdT0talCollisions.textContent = row.totalCollisions;
         

          tr.appendChild(tdGenders);
          tr.appendChild(tdT0talCollisions);
          
          table.appendChild(tr);
          
          
        }
        break;

        case 13: //Casualty Rate by age band and severity
        console.log("Creating case 13 table.")
        const thAGroup = document.createElement("th");
        const thInjurySeverity = document.createElement("th");
        const thTotalCasualties = document.createElement("th");

        thAGroup.textContent = "Age Group";
        thInjurySeverity.textContent = "Injury Severity";
        thTotalCasualties.textContent = "Total Casualties";

        headerRow.appendChild(thAGroup);
        headerRow.appendChild(thInjurySeverity);
        headerRow.appendChild(thTotalCasualties);

        table.appendChild(headerRow);
        
        for (let row of rows){
          const tr = document.createElement("tr");

          const tdAGroup = document.createElement("td");
          const tdInjurySeverity = document.createElement("td");
          const tdTotalCasualties = document.createElement("td");

          tdAGroup.textContent = row.ageGroup;
          tdInjurySeverity.textContent = row.injurySeverity;
          tdTotalCasualties.textContent = row.totalCasualty;

          tr.appendChild(tdAGroup);
          tr.appendChild(tdInjurySeverity);
          tr.appendChild(tdTotalCasualties);

          table.appendChild(tr);
          
          
        }
        break;

        case 14: //Locations by Deprivation Score
        console.log("Creating case 14 table.")
        const thLID = document.createElement("th");
        const thRdName = document.createElement("th");
        const thRoadType = document.createElement("th");
        const thDtName = document.createElement("th");
        const thJType = document.createElement("th");
        const thSpeedLimitZone = document.createElement("th");
        const thDeprivationScore = document.createElement("th");

        thLID.textContent = "Location ID";
        thRdName.textContent = "Road Name";
        thRoadType.textContent = "Road Type";
        thDtName.textContent = "District Name";
        thJType.textContent = "Junction Type";
        thSpeedLimitZone.textContent = "Speed Limit Zone";
        thDeprivationScore.textContent = "Deprivation Score";

        headerRow.appendChild(thLID);
        headerRow.appendChild(thRdName);
        headerRow.appendChild(thRoadType);
        headerRow.appendChild(thDtName);
        headerRow.appendChild(thJType);
        headerRow.appendChild(thSpeedLimitZone);
        headerRow.appendChild(thDeprivationScore);

        table.appendChild(headerRow);
        
        for (let row of rows){
          const tr = document.createElement("tr");

          const tdLocationID = document.createElement("td");
          const tdRoadName = document.createElement("td");
          const tdRoadType = document.createElement("td");
          const tdDistrictName = document.createElement("td");
          const tdJunctionType = document.createElement("td");
          const tdSpeedLimitZone = document.createElement("td");
          const tdDeprivationScore = document.createElement("td");

          tdLocationID.textContent = row.locationID;
          tdRoadName.textContent = row.roadName;
          tdRoadType.textContent = row.roadType;
          tdDistrictName.textContent = row.districtName;
          tdJunctionType.textContent = row.junctionType;
          tdSpeedLimitZone.textContent = row.speedLimitZone;
          tdDeprivationScore.textContent = row.deprivationScore;

          tr.appendChild(tdLocationID);
          tr.appendChild(tdRoadName);
          tr.appendChild(tdRoadType);
          tr.appendChild(tdDistrictName);
          tr.appendChild(tdJunctionType);
          tr.appendChild(tdSpeedLimitZone);
          tr.appendChild(tdDeprivationScore);

          table.appendChild(tr);
          
          
        }
        break;

        case 15: //Collisions by Licence Type
        const thLcType = document.createElement("th");
        const thTotalCollision = document.createElement("th");
        

        thLcType.textContent = "Licence Type";
        thTotalCollision.textContent = "Total Collisions";
        

        headerRow.appendChild(thLcType);
        headerRow.appendChild(thTotalCollision);
        

        table.appendChild(headerRow);
        
        for (let row of rows){
          const tr = document.createElement("tr");

          const tdLcType = document.createElement("td");
          const tdTotalCollision = document.createElement("td");
          

          tdLcType.textContent = row.licenceType;
          tdTotalCollision.textContent = row.totalCollision;
         

          tr.appendChild(tdLcType);
          tr.appendChild(tdTotalCollision);
          
          table.appendChild(tr);
          
          labels.push(`${row.licenceType}`);
            chartData.push(Number(row.totalCollision));
        }

         myChart = new Chart(chart, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [{
              label: "Collisions",
              data: chartData
            }]
          }
        });
        break;
    }
    
  

    
    output.appendChild(table);
  }
    //Pie Charts: 12, 15
    //Bar Charts: 5, 7

  
  catch (error) {
    reportMessage.textContent = "Error running report. " + error.message;
    console.error(error);
  }
});