import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const keys = jsonData.shift(); // Bỏ dòng header ra khỏi jsonData
        const formattedJson = jsonData.map((row) => {
          let obj = {};
          keys.forEach((key, index) => {
            const lowerKey = key.toLowerCase();
            if (lowerKey === "chartnameeng") {
              obj.chartNameEng = row[index];
            } else if (lowerKey === "chartnamecn") {
              obj.chartNameCN = row[index];
            } else if (lowerKey === "chartnamezh") {
              obj.chartNameZH = row[index];
            } else if (lowerKey === "chartnamejp") {
              obj.chartNameJp = row[index];
            } else if (lowerKey === "handle") {
              obj.productHandle = row[index];
            }
          });
          return obj;
        });
        console.log(formattedJson);
        callApi(formattedJson);
      };
      reader.readAsBinaryString(file);
    }
  };

  const callApi = async (jsonData) => {
    try {
      const response = await axios.post(
        "https://cors-anywhere.herokuapp.com/https://evisu-be-uj2m.vercel.app/sync-fung",
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Success:", response.data);
      setResponse("Success: " + JSON.stringify(response.data));
      alert("Success");
    } catch (error) {
      console.error("Error:", error);
      setResponse("Error: " + error.message);
      alert("Error");
    }
  };

  return (
    <div>
      <h2>Upload File</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Submit</button>
      <div>{response}</div>
    </div>
  );
};
