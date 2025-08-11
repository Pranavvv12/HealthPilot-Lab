import mongoose from "mongoose";
import xlsx from "xlsx";
import config from "../backend/utils/config.js";

export async function importExcelData() {
  try {
    console.log("📂 Importing Excel data...");

    const filePath = "D:/HealthPilot-Lab/backend/dataset/data.xlsx";
    console.log(`Excel file path: ${filePath}`);
    
    const workbook = xlsx.readFile(filePath);
    console.log("✅ Excel file read successfully.");

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log(`📊 Rows parsed from Excel: ${data.length}`);

    if (data.length === 0) {
      console.log("❌ Excel file is empty.");
      return;
    }

    const collectionName = "labterms";
    console.log(`🛠 Using collection: ${collectionName}`);

    const transformedData = data.map(doc => ({
      ...doc,
      RELATEDNAMES2: doc.RELATEDNAMES2
        ? doc.RELATEDNAMES2.split("|").map(s => s.trim())
        : []
    }));

    await mongoose.connection.db.collection(collectionName).deleteMany({});

    const result = await mongoose.connection.db.collection(collectionName).insertMany(transformedData);
    console.log(`✅ Data inserted into ${collectionName}, count: ${result.insertedCount}`);
  } catch (err) {
    console.error("🔥 Error importing Excel:", err);
  }
}

export async function connectAndImport() {
  await mongoose.connect(`${config.DB_URL}/${config.DB_NAME}`);
  console.log("✅ Mongoose Connected!");

  await importExcelData();
}
