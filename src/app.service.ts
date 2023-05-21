import { Injectable } from '@nestjs/common';
import { Printer } from '@node-escpos/core';
import { convert } from 'html-to-text'
import USB from '@node-escpos/usb-adapter';


@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  print() : any{
    const device = new USB()

    device.open(async (err) => {
      if (err) {
        return err;
      }

      const raw_data =  await fetch("http://localhost:3000/api/v1/order/last")
      const data = raw_data[0];
      const option = { encoding : "GB18030"}
      let printer = new Printer(device, option);
      const date = new Date().toLocaleDateString()
      const formatter = Intl.NumberFormat("id-ID", {
        style : "currency",
        currency : "IDR"
      })
      const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
      </head>
      <body>
          <table id="invoice">
              <thead>
              <tr>
                  <th>Items</th>
                  <th>Harga</th>
              </tr>
              </thead>
              <tbody>
              ${
                data.order_item.map((val, i) => {
                  `
                  <tr>
                    <td>${val.menu_name}</td>
                    <td align="right">${formatter.format(val.item_price)}</td>
                  </tr>                    
                  `
                })
              }
              <tr>
                <td>TOTAL : </td>
                <td align="right"></td>
              </tr>
      </body>
      </html>`
      const htmlConvert = convert(html)

      printer
        .font("a")
        .align('CT')
        .style("BU")
        .size(1,1)
        .text("Lakeside Coffee")
        .text(`Waktu : ${date}`)
        .text(`Nama Pelanggan : ${data.order_customer}`)
        .text("---------------------------------")
        .text(htmlConvert)
        .text("---------------------------------")  
    })
  }
}
