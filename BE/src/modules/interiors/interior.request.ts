export interface CreateInteriorReqBody {
  interior_id: string
  interior_name: string
  description: string
  quantity: string
  price: string
  material: string
  category_id: string
  size: string
  color: string
  thumbnail: string
  images: string[]
}

export interface UpdateInteriorReqBody {
  interior_id: string
  interior_name?: string
  description?: string
  quantity?: string
  price?: string
  material?: string
  category_id?: string
  size?: string
  color?: string
  thumbnail?: string
  images?: string[]
}
