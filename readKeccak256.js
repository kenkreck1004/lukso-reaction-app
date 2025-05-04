const fs = require("fs");
const Keccak = require("keccak");

// Hàm tính keccak256 của file
function hashFileKeccak256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = Keccak("keccak256").update(fileBuffer).digest("hex");
  return `0x${hash}`;
}



// const imagePath = "./public/gold.png"; // hoặc đường dẫn tới ảnh IPFS bạn đã download
// const hash = hashFileKeccak256(imagePath);

console.log("Gold Keccak256 hash:", hashFileKeccak256("./public/gold.png"));

console.log("Sliver Keccak256 hash:", hashFileKeccak256("./public/sliver.png"));

console.log("bronze Keccak256 hash:", hashFileKeccak256("./public/bronze.png"));