import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "./App.css";

function App() {
  const [invoiceNo, setInvoiceNo] = useState("123");
  const [date, setDate] = useState("2025-01-20");
  const [items, setItems] = useState([{ name: "", hsn: "", price: 0, quantity: 1 }]);
  const [gstRate, setGstRate] = useState(9.0);
  const [signatureURL, setSignatureURL] = useState(null);

  const canvasRef = useRef(null);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = field === "price" || field === "quantity" ? +value : value;
    setItems(updatedItems);
  };

  const addItem = () => setItems([...items, { name: "", hsn: "", price: 0, quantity: 1 }]);

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const calculateSubtotal = () =>
    items.reduce((total, item) => total + item.price * item.quantity, 0);

  const calculateGST = (subtotal) => (subtotal * gstRate) / 100;

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + 2 * calculateGST(subtotal);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureURL(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/png");
    setSignatureURL(dataURL);
  };

  const downloadInvoice = () => {
    const invoice = document.getElementById("invoice");
    html2canvas(invoice).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save(`Invoice_${invoiceNo}.pdf`);
    });
  };

  return (
    <div className="App">
      {/* Form for Input */}
      <div className="form">
        <label>
          Invoice No.:
          <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
        </label>
        <label>
          Date:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          GST Rate (%):
          <input
            type="number"
            value={gstRate}
            onChange={(e) => setGstRate(e.target.value)}
            min="0"
            step="0.1"
          />
        </label>

        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>HSN/SAC</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, "name", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.hsn}
                    onChange={(e) => handleItemChange(index, "hsn", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, "price", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    min="1"
                  />
                </td>
                <td>
                  <button onClick={() => removeItem(index)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addItem}>Add Item</button>
      </div>

      {/* Signature Canvas */}
      <div className="signature-container">
        <h3>Draw Your Signature</h3>
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          style={{
            border: "1px solid black",
            cursor: "crosshair",
          }}
          onMouseDown={(e) => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctx.beginPath();
            ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            canvas.addEventListener("mousemove", draw);
          }}
          onMouseUp={(e) => {
            const canvas = canvasRef.current;
            canvas.removeEventListener("mousemove", draw);
          }}
        />
        <button onClick={saveSignature}>Save Signature</button>
        <button onClick={clearCanvas}>Clear</button>
      </div>

      {/* Invoice Preview */}
      <div id="invoice" className="invoice">
        <header>
          <h2>N.M Engineering Works</h2>
          <p>31 Grd Floor, Plot No-93, Arab Tabela Compound, Madanpura, Mumbai -08</p>
          <p>Phone: 9123475693 | Email: intakhabahmad04@gmail.com</p>
          <p>GSTIN: 27CBCPA2390G1Z0 | State: 27-Maharashtra</p>
        </header>

        <section className="bill-to">
          <h3>COTATION</h3>
          <p>To  Mazagon Dock Ship BuildersLTD</p>
          <p>6TH FLOOR MAZDOCK HOUSE MAZAGON DOCK SHIPBUILDERS LIMITED DOCKYARD ROAD MAZGAON</p>
          <p>GSTIN Number: 27AAACM8029J1ZA | State: 27-Maharashtra</p>
        </section>

        <section className="invoice-details">
          <div>Invoice No.: {invoiceNo}</div>
          <div>Date: {date}</div>
          <div>Place of Supply: 27-Maharashtra</div>
        </section>

        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>HSN/SAC</th>
              <th>Quantity</th>
              <th>Price/Unit</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.hsn}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price.toFixed(2)}</td>
                <td>₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals-signature-container">
        <section className="bank-details">
    <h3>Bank Details</h3>
    <p><strong>Bank Name:</strong> Axis Bank, Dadar West</p>
    <p><strong>Bank Account No:</strong> 920020069841012</p>
    <p><strong>IFSC Code:</strong> UTIB0001902</p>
    <p><strong>Account Holder Name:</strong> N.M Engineering Works</p>
  </section>

        <section className="totals">
          <p>Subtotal: ₹{calculateSubtotal().toFixed(2)}</p>
          <p>SGST ({gstRate}%): ₹{calculateGST(calculateSubtotal()).toFixed(2)}</p>
          <p>CGST ({gstRate}%): ₹{calculateGST(calculateSubtotal()).toFixed(2)}</p>
          <h3>Total: ₹{calculateTotal().toFixed(2)}</h3>

          <footer>
          {signatureURL && <img src={signatureURL} alt="Signature" className="signature" />}
          <p>Authorized Signature</p>
        </footer>
        </section>

      
        </div>
      </div>
      <button onClick={downloadInvoice}>Download Invoice</button>
    </div>
  );
}

const draw = (e) => {
  const canvas = e.target;
  const ctx = canvas.getContext("2d");
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};

export default App







