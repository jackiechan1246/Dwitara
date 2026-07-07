// Using global fetch in Node 18+

async function test() {
  const payload = {
    "order_id": "TEST-DWI-12345",
    "order_date": "2024-06-26",
    "order_type": "ESSENTIALS",
    "consignee_name": "Test User",
    "consignee_phone": 9876543210,
    "consignee_alternate_phone": 9876543210,
    "consignee_email": "test@gmail.com",
    "consignee_address_line_one": "Sector 49",
    "consignee_address_line_two": "",
    "consignee_pin_code": 122001,
    "consignee_city": "Gurgaon",
    "consignee_state": "Haryana",
    "product_detail": [
      {
        "name": "Laptop",
        "sku_number": "22",
        "quantity": 1,
        "discount": "",
        "hsn": "",
        "unit_price": 1000,
        "product_category": "Other"
      }
    ],
    "payment_type": "PREPAID",
    "cod_amount": "",
    "weight": 200,
    "length": 10,
    "width": 20,
    "height": 15,
    "warehouse_id": "",
    "gst_ewaybill_number": "",
    "gstin_number": ""
  };

  const response = await fetch("https://shipping-api.com/app/api/v1/push-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "public-key": "CDOK6JHYyoWS80rXnZEw",
      "private-key": "Gm1euwqUrviEtkjsS2fI"
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Body:", text);
}

test();
