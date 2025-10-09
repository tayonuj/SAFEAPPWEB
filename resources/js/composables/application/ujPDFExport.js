import html2pdf from 'html2pdf.js';

// Function to export data to a receipt-style PDF for a 58mm thermal printer
const ujPDFExport = async (data, billAmount, name, repName, shopName, invoiceNumber, returns = [],returnsNormal = [], returnAmount = 0) => {
    const netAmount = (parseFloat(billAmount) - parseFloat(returnAmount)).toFixed(2);

    const receiptElement = document.createElement('div');
    receiptElement.style.width = '58mm';
    receiptElement.style.fontFamily = 'Iskoola Pota, Arial, sans-serif';
    receiptElement.style.fontSize = '8px';
    receiptElement.style.padding = '2mm';

    receiptElement.innerHTML = `
        <div style="text-align: center; font-weight: bold; font-size: 20px;">
            සමරසේකර Foods
        </div>
        <div style="text-align: center; font-size: 10px;">
            සමරගිරි, නවාලුවිල ,අම්බලන්තොට<br>
            ☎ 072 81 38 140<br>
            ${shopName} බිල්පත
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
            <div style="flex: 1; text-align: left;">${new Date().toLocaleDateString()}</div>
            <div style="flex: 1; text-align: center;">${new Date().toLocaleTimeString()}</div>
            <div style="flex: 1; text-align: right;"> ${invoiceNumber}</div>
        </div>
        <hr>
        <div style="display: flex; justify-content: space-between;">
            <div style="flex: 2; font-weight: bold;">නම</div>
            <div style="flex: 1; text-align: right;font-weight: bold;">ප්‍රමාණය</div>
            <div style="flex: 1; text-align: right;font-weight: bold;">මිල</div>
            <div style="flex: 1; text-align: right;font-weight: bold;">එකතුව</div>
        </div>
        <hr>
        <div style="font-size: 10px;">
            ${data.map((item, index) => `
                <div style="display: flex; justify-content: space-between;">
                    <div style="flex: 2;">${index + 1}. ${item.productName}</div>
                    <div style="flex: 1; text-align: right;">${item.quantity}</div>
                    <div style="flex: 1; text-align: right;">${item.unit_selling_price.toFixed(2)}</div>
                    <div style="flex: 1; text-align: right;">${item.amount.toFixed(2)}</div>
                </div>
            `).join('')}
        </div>
        ${returnsNormal.length > 0 ? `
        <hr>
        <div style="font-size: 10px; font-weight: bold; text-align: left;">ආපසු ගත් භාණ්ඩ</div>
        <div style="font-size: 10px;">
            ${returnsNormal.map((item, index) => `
                <div style="display: flex; justify-content: space-between;">
                    <div style="flex: 2;">- ${item.productName}</div>
                    <div style="flex: 1; text-align: right;">${item.quantity}</div>
                    <div style="flex: 1; text-align: right;">${item.unit_selling_price.toFixed(2)}</div>
                    <div style="flex: 1; text-align: right;">-${item.amount.toFixed(2)}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        <hr>


        ${returns.length > 0 ? `
        <hr>
        <div style="font-size: 10px; font-weight: bold; text-align: left;">Return භාණ්ඩ</div>
        <div style="font-size: 10px;">
            ${returns.map((item, index) => `
                <div style="display: flex; justify-content: space-between;">
                    <div style="flex: 2;">- ${item.productName}</div>
                    <div style="flex: 1; text-align: right;">${item.quantity}</div>
                    <div style="flex: 1; text-align: right;">${item.unit_selling_price.toFixed(2)}</div>
                    <div style="flex: 1; text-align: right;">-${item.amount.toFixed(2)}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        <hr>
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>මුල එකතුව</span>
            <span>${parseFloat(billAmount).toFixed(2)} LKR</span>
        </div>
        ${returns.length > 0 || returnsNormal.length>0 ? `
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>ආපසු ගත් (Return) වටිනාකම</span>
            <span>- ${parseFloat(returnAmount).toFixed(2)} LKR</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>නිවැරදි මුළු මුදල</span>
            <span>${netAmount} LKR</span>
        </div>
        ` : ''}
        <hr>
        <div style="text-align: center; margin-top: 10px;">
            Rep: ${repName}
        </div>
        <div style="text-align: center; font-size: 8px; margin-top: 10px;">
            Software by Asian Eye - 076 338 2388
        </div>
    `;

    const options = {
        margin: 0,
        filename: `${name}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: [58, 200], orientation: 'portrait' }
    };

    html2pdf().from(receiptElement).set(options).save();
};

export default ujPDFExport;
