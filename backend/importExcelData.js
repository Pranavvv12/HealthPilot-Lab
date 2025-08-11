import mongoose from "mongoose";
import xlsx from "xlsx";

export async function importExcelData() {
  try {
    console.log("📂 Importing Excel data...");

    const filePath = "D:/HealthPilot-Lab/backend/dataset/data.xlsx"; // Update to your file path
    const workbook = xlsx.readFile(filePath);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 Rows parsed from Excel: ${data.length}`);

    if (data.length === 0) {
      console.log("❌ Excel file is empty.");
      return;
    }

    const collectionName = "labterms";

    // Convert RELATEDNAMES2 pipe-separated string to array
    const transformedData = data.map((doc) => ({
      ...doc,
      RELATEDNAMES2: doc.RELATEDNAMES2
        ? doc.RELATEDNAMES2.split("|").map((s) => s.trim())
        : []
    }));

    // Delete old data and insert new data
    await mongoose.connection.db.collection(collectionName).deleteMany({});
    const result = await mongoose.connection.db.collection(collectionName).insertMany(transformedData);

    console.log(`✅ Data inserted into ${collectionName}, count: ${result.insertedCount}`);
  } catch (err) {
    console.error("🔥 Error importing Excel:", err);
  }
}
