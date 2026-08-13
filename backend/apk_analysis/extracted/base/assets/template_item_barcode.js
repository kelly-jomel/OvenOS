// Configuration
const COLUMNS = 4; // Number of columns per row

let barcodeData = "";
let totalRows = 1; // Default row count

function setBarcode(barcode) {
    if (barcode != "") {
        barcodeData = barcode;
        generateBarcodeTable();
    }
}

function setRowCount(rowCount) {
    // Update row count - will be used when setBarcode is called
    totalRows = rowCount > 0 ? rowCount : 1;
    // Only regenerate if barcode data already exists
    if (barcodeData != "") {
        generateBarcodeTable();
    }
}

function generateBarcodeTable() {
    const container = document.getElementById('barcode-container');
    container.innerHTML = ''; // Clear existing content
    
    const table = document.createElement('table');
    let imagesLoaded = 0;
    const totalImages = totalRows * COLUMNS;
    
    // Generate all rows - let browser handle pagination naturally
    for (let row = 0; row < totalRows; row++) {
        const tr = document.createElement('tr');
        
        for (let col = 0; col < COLUMNS; col++) {
            const td = document.createElement('td');
            const img = document.createElement('img');
            
            // Add onload handler to track image loading
            img.onload = function() {
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    // All images loaded - signal ready
                    if (window.Android && window.Android.onBarcodeRendered) {
                        window.Android.onBarcodeRendered();
                    }
                }
            };
            
            img.onerror = function() {
                imagesLoaded++;
            };
            
            img.src = "data:image/jpeg;base64," + barcodeData;
            img.alt = "Barcode";
            td.appendChild(img);
            tr.appendChild(td);
        }
        
        table.appendChild(tr);
    }
    
    container.appendChild(table);
}

// Helper function to check if rendering is complete
function isRenderingComplete() {
    const container = document.getElementById('barcode-container');
    const images = container.getElementsByTagName('img');
    
    if (images.length === 0) return false;
    
    for (let i = 0; i < images.length; i++) {
        if (!images[i].complete) return false;
    }
    
    return true;
}