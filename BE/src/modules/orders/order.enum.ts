export enum OrderStatus {
  Wait_for_confirm,
  Pack_products,
  Delivery,
  Success,
  Cancel
}

export enum PaymentMethod {
  COD,
  Paypal
}

export enum PaymentStatus {
  do_not_pay,
  did_pay,
  refunds
}
