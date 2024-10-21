import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { useLocation } from 'react-router-dom';

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const [shopDomain, setShopDomain] = useState('');
  const fileInputRef = useRef(null); // Ref to reset the file input

  const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];

  if (selectedFile) {
    const fileType = selectedFile.name.split('.').pop().toLowerCase();
    if (fileType !== 'xlsx' && fileType !== 'csv') {
      alert("Please upload a valid file (.xlsx or .csv)");
      setFile(null); // Reset the file state if invalid
      e.target.value = ""; // Reset the input field
    } else {
      setFile(selectedFile); // Only set the file if it's valid
    }
  }
};

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const shop = queryParams.get('shop');
    if (shop) {
      setShopDomain(shop); 
    }
  }, [location]);

  const shopName = shopDomain.split(".myshopify.com")[0];

  const handleUpload = () => {
    if (file) {
      setIsSubmitting(true); 
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const keys = jsonData.shift();
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
        callApi(formattedJson, shopName);
      };
      reader.readAsBinaryString(file);
    }
  };

  const callApi = async (jsonData, shopName) => {
  try {
    const dataToSend = {
      shopName: shopName,
      items: jsonData 
    };

    const response = await axios.post(
      "https://evisu-be-plum.vercel.app/sync-fung",
      dataToSend,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Success:", response.data);
    setResponse("Success: " + JSON.stringify(response.data));
    alert("Success");
    
    setFile(null);
    fileInputRef.current.value = ""; // Reset file input
    setResponse("");
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.message || "Unknown error occurred";
      const errorsList = error.response.data.errors || [];
      console.error("Error:", errorMessage);
      // Show all errors if available
      if (errorsList.length > 0) {
        const allErrors = errorsList.join("\n");
        setResponse("Error: " + errorMessage + "\nDetails:\n" + allErrors);
        alert(`Error: ${errorMessage}\nDetails:\n${allErrors}`);
      } else {
        setResponse("Error: " + errorMessage);
        alert(`Error: ${errorMessage}`);
      }
    } else {
      console.error("Error:", error.message);
      setResponse("Error: " + error.message);
      alert("Error: " + error.message);
    }

    setFile(null);
    fileInputRef.current.value = ""; // Reset file input
    } finally {
      setIsSubmitting(false); // Re-enable submit button after request completes
    }
};


  return (
    <div>
      <h2>Upload File</h2>
      {shopDomain && <p>Shop Domain: {shopDomain}</p>}
      {shopName && <p>Shop Name: {shopName}</p>}
      <input type="file" accept=".xlsx, .csv" onChange={handleFileChange} ref={fileInputRef} /> {/* Use ref */}
      <button onClick={handleUpload} disabled={isSubmitting}> {isSubmitting ? "Submitting..." : "Submit"}</button>
      <div>{response}</div>
    </div>
  );
};
