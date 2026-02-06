"use client";

import React from "react";

interface ReceiptProps {
  bill: any;
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
  ({ bill }, ref) => {
    if (!bill) return null;

    return (
      <div ref={ref} className="p-2 bg-white text-black font-mono text-[10px] w-[55mm] mx-auto leading-tight">
        <div className="text-center mb-3">
          <h2 className="text-base font-bold">Smart POS</h2>
          <p className="font-bold mt-1">ใบเสร็จรับเงิน</p>
        </div>

        <div className="mb-2 border-b border-black pb-2 border-dashed">
          <div className="flex justify-between">
            <span>เลขบิล:</span>
            <span>{bill.billNumber || String(bill.id || '').slice(-6)}</span>
          </div>
          <div className="flex justify-between">
            <span>วันที่:</span>
            <span>
              {new Date(bill.createdAt || bill.timestamp || new Date()).toLocaleDateString("th-TH")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>เวลา:</span>
            <span>
              {new Date(bill.createdAt || bill.timestamp || new Date()).toLocaleTimeString("th-TH")}
            </span>
          </div>
          {(bill.customer || bill.customerId) && (
            <div className="flex justify-between">
              <span>ลูกค้า:</span>
              <span>{bill.customer?.name || `สมาชิก ID: ${bill.customerId}`}</span>
            </div>
          )}
        </div>

        <table className="w-full mb-2">
          <thead>
            <tr className="border-b border-black border-dashed">
              <th className="text-left py-1">รายการ</th>
              <th className="text-center py-1">จำนวน</th>
              <th className="text-right py-1">ราคา</th>
            </tr>
          </thead>
          <tbody>
            {(bill.items || bill.cart || []).map((item: any, index: number) => (
              <tr key={index}>
                <td className="py-1">{item.productName || item.name}</td>
                <td className="text-center py-1">{item.quantity || item.qty}</td>
                <td className="text-right py-1">
                  {(item.price * (item.quantity || item.qty)).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-black border-dashed pt-2 mb-3 space-y-1">
          <div className="flex justify-between">
            <span>ยอดรวม:</span>
            <span>฿{(bill.subtotal || 0).toLocaleString()}</span>
          </div>
          {bill.discount > 0 && (
            <div className="flex justify-between text-black">
              <span>ส่วนลด {bill.couponCode ? `(${bill.couponCode})` : ''}:</span>
              <span>-฿{bill.discount.toLocaleString()}</span>
            </div>
          )}
          {bill.pointsRedeemed > 0 && (
            <div className="flex justify-between text-black">
              <span>ส่วนลดจากแต้ม ({bill.pointsRedeemed.toLocaleString()} P):</span>
              <span>-฿{(Math.floor(bill.pointsRedeemed / 1000) * 10).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm pt-1 border-t border-black border-dashed">
            <span>รวมทั้งสิ้น</span>
            <span>฿{(bill.total || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>ชำระโดย:</span>
            <span>
              {bill.paymentMethod === "cash" ? "เงินสด" :
                bill.paymentMethod === "scan" || bill.paymentMethod === "promptpay" ? "สแกนจ่าย" : "โอนเงิน"}
            </span>
          </div>
          {(bill.amountReceived || bill.cashReceived) && (
            <div className="flex justify-between">
              <span>รับเงิน:</span>
              <span>฿{Number(bill.amountReceived || bill.cashReceived).toLocaleString()}</span>
            </div>
          )}
          {(bill.amountReceived || bill.cashReceived) && (
            <div className="flex justify-between">
              <span>เงินทอน:</span>
              <span>฿{(Number(bill.amountReceived || bill.cashReceived) - (bill.total || 0)).toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="text-center mt-3 border-t border-black border-dashed pt-2">
          <p>ขอบคุณที่ใช้บริการ</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = "Receipt";
