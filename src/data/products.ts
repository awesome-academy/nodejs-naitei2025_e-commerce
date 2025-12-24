export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  category: 'men' | 'women' | 'kids';
  subcategory: string;
  images: string[];
  colors: string[];
  sizes: string[];
  description: string;
  features: string[];
  isNew?: boolean;
  isSale?: boolean;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  soldCount?: number;
}

export const products: Product[] = [
  // ===== MEN'S PRODUCTS =====
  
  // T-Shirts
  {
    id: 'men-tshirt-1',
    name: 'Áo T-shirt Nam Cotton Premium',
    price: 290000,
    category: 'men',
    subcategory: 'T-shirt',
    images: [
      'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'
    ],
    colors: ['Trắng', 'Đen', 'Xanh Navy', 'Xám'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Áo t-shirt nam chất liệu cotton cao cấp, form regular fit thoải mái',
    features: ['100% Cotton', 'Chống co rút', 'Dễ giặt', 'Form regular'],
    isNew: true,
    rating: 4.5,
    reviewCount: 128
  },
  {
    id: 'men-tshirt-2',
    name: 'Áo T-shirt Nam Dry Technology',
    price: 350000,
    category: 'men',
    subcategory: 'T-shirt',
    images: [
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
      'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg'
    ],
    colors: ['Trắng', 'Đen', 'Xanh', 'Đỏ', 'Vàng'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo t-shirt công nghệ Dry thấm hút mồ hôi tốt, phù hợp thể thao',
    features: ['Công nghệ Dry', 'Kháng khuẩn', 'Co giãn 4 chiều', 'Nhanh khô'],
    rating: 4.7,
    reviewCount: 95
  },
  {
    id: 'men-tshirt-3',
    name: 'Áo T-shirt Nam Graphic Print',
    price: 320000,
    originalPrice: 420000,
    category: 'men',
    subcategory: 'T-shirt',
    images: [
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg'
    ],
    colors: ['Đen', 'Trắng', 'Xám'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo t-shirt nam họa tiết graphic hiện đại, phong cách streetwear',
    features: ['Cotton pha', 'In chắc chắn', 'Thiết kế độc đáo'],
    isSale: true,
    rating: 4.3,
    reviewCount: 67
  },

  // Polo Shirts
  {
    id: 'men-polo-1',
    name: 'Áo Polo Nam Cotton Pique',
    price: 390000,
    originalPrice: 490000,
    category: 'men',
    subcategory: 'Áo Polo',
    images: [
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg'
    ],
    colors: ['Trắng', 'Đen', 'Xanh Navy', 'Xám', 'Đỏ'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Áo polo nam chất liệu cotton pique cao cấp, thoáng mát và thoải mái',
    features: ['100% Cotton Pique', 'Chống nhăn', 'Dễ giặt', 'Form regular'],
    isSale: true,
    rating: 4.6,
    reviewCount: 142
  },
  {
    id: 'men-polo-2',
    name: 'Áo Polo Nam Dry Pique',
    price: 450000,
    category: 'men',
    subcategory: 'Áo Polo',
    images: [
      'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'
    ],
    colors: ['Xanh Navy', 'Trắng', 'Xám', 'Đen'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo polo công nghệ Dry Pique, thấm hút mồ hôi tốt',
    features: ['Dry Technology', 'UV Protection', 'Quick Dry'],
    isNew: true,
    rating: 4.8,
    reviewCount: 89
  },

  // Dress Shirts
  {
    id: 'men-shirt-1',
    name: 'Áo Sơ Mi Nam Oxford',
    price: 690000,
    category: 'men',
    subcategory: 'Áo Sơ Mi',
    images: [
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg'
    ],
    colors: ['Trắng', 'Xanh nhạt', 'Hồng nhạt', 'Xám'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Áo sơ mi nam chất liệu Oxford cao cấp, phù hợp đi làm và dự tiệc',
    features: ['Cotton Oxford', 'Chống nhăn', 'Form slim fit', 'Dễ ủi'],
    rating: 4.4,
    reviewCount: 156
  },
  {
    id: 'men-shirt-2',
    name: 'Áo Sơ Mi Nam Easy Care',
    price: 590000,
    category: 'men',
    subcategory: 'Áo Sơ Mi',
    images: [
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'
    ],
    colors: ['Trắng', 'Xanh Navy', 'Xám nhạt'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo sơ mi Easy Care không cần ủi, tiện lợi cho công việc',
    features: ['Easy Care', 'Không cần ủi', 'Chống nhăn', 'Form regular'],
    isNew: true,
    rating: 4.5,
    reviewCount: 98
  },

  // Jeans
  {
    id: 'men-jean-1',
    name: 'Quần Jean Nam Slim Fit',
    price: 790000,
    category: 'men',
    subcategory: 'Quần Jean',
    images: [
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg'
    ],
    colors: ['Xanh đậm', 'Xanh nhạt', 'Đen'],
    sizes: ['29', '30', '31', '32', '33', '34', '36'],
    description: 'Quần jean nam form slim fit phù hợp với vóc dáng châu Á',
    features: ['Cotton pha Spandex', 'Co giãn tốt', 'Bền màu', 'Form slim'],
    rating: 4.6,
    reviewCount: 203
  },
  {
    id: 'men-jean-2',
    name: 'Quần Jean Nam Regular Fit',
    price: 750000,
    category: 'men',
    subcategory: 'Quần Jean',
    images: [
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg'
    ],
    colors: ['Xanh đậm', 'Đen', 'Xám'],
    sizes: ['29', '30', '31', '32', '33', '34', '36', '38'],
    description: 'Quần jean nam form regular thoải mái, phù hợp mọi dáng người',
    features: ['100% Cotton', 'Form regular', 'Bền chắc', 'Classic style'],
    rating: 4.4,
    reviewCount: 167
  },

  // Footwear
  {
    id: 'men-sneaker-1',
    name: 'Giày Sneaker Nam Classic',
    price: 1290000,
    category: 'men',
    subcategory: 'Giày',
    images: [
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg',
      'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'
    ],
    colors: ['Trắng', 'Đen', 'Xám', 'Navy'],
    sizes: ['39', '40', '41', '42', '43', '44', '45'],
    description: 'Giày sneaker nam phong cách tối giản, phối được với mọi trang phục hằng ngày.',
    features: ['Đế cao su chống trượt', 'Lót memory foam', 'Thoáng khí', 'Trọng lượng nhẹ'],
    isNew: true,
    rating: 4.8,
    reviewCount: 212
  },

  // Chinos
  {
    id: 'men-chino-1',
    name: 'Quần Kaki Nam Chino',
    price: 650000,
    category: 'men',
    subcategory: 'Quần Kaki',
    images: [
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg'
    ],
    colors: ['Be', 'Xanh Navy', 'Xám', 'Đen'],
    sizes: ['29', '30', '31', '32', '33', '34', '36'],
    description: 'Quần kaki nam chino cao cấp, phù hợp đi làm và dạo phố',
    features: ['Cotton Twill', 'Chống nhăn', 'Form slim', 'Túi ẩn'],
    rating: 4.5,
    reviewCount: 134
  },
  {
    id: 'men-chino-2',
    name: 'Quần Kaki Nam Stretch',
    price: 690000,
    category: 'men',
    subcategory: 'Quần Kaki',
    images: [
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg'
    ],
    colors: ['Be', 'Xám', 'Xanh Navy'],
    sizes: ['30', '31', '32', '33', '34', '36'],
    description: 'Quần kaki co giãn thoải mái, phù hợp vận động',
    features: ['Cotton pha Elastane', 'Co giãn 4 chiều', 'Thoải mái'],
    isNew: true,
    rating: 4.7,
    reviewCount: 76
  },

  // Jackets
  {
    id: 'men-jacket-1',
    name: 'Áo Khoác Bomber Nam',
    price: 1290000,
    originalPrice: 1590000,
    category: 'men',
    subcategory: 'Áo Khoác',
    images: [
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg'
    ],
    colors: ['Đen', 'Xanh Navy', 'Xám'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo khoác bomber phong cách streetwear, chất liệu polyester cao cấp',
    features: ['Chống gió', 'Lót lưới thoáng khí', 'Túi zip an toàn', 'Form regular'],
    isSale: true,
    rating: 4.3,
    reviewCount: 89
  },
  {
    id: 'men-jacket-2',
    name: 'Áo Khoác Denim Nam',
    price: 890000,
    category: 'men',
    subcategory: 'Áo Khoác',
    images: [
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg'
    ],
    colors: ['Xanh đậm', 'Xanh nhạt'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo khoác denim classic, phong cách vintage không bao giờ lỗi thời',
    features: ['100% Cotton Denim', 'Bền chắc', 'Classic fit', 'Vintage style'],
    rating: 4.4,
    reviewCount: 112
  },

  // Shorts
  {
    id: 'men-short-1',
    name: 'Quần Short Nam Cotton',
    price: 450000,
    category: 'men',
    subcategory: 'Quần Short',
    images: [
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg'
    ],
    colors: ['Be', 'Xanh Navy', 'Xám', 'Đen'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Quần short nam cotton thoải mái, phù hợp mùa hè',
    features: ['100% Cotton', 'Thoáng mát', 'Túi tiện lợi', 'Form regular'],
    rating: 4.2,
    reviewCount: 87
  },

  // ===== WOMEN'S PRODUCTS =====
  
  // Blouses
  {
    id: 'women-blouse-1',
    name: 'Áo Blouse Nữ Linen',
    price: 590000,
    category: 'women',
    subcategory: 'Áo Blouse',
    images: [
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'
    ],
    colors: ['Trắng', 'Xanh nhạt', 'Hồng', 'Be'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo blouse nữ chất liệu linen cao cấp, phong cách thanh lịch',
    features: ['100% Linen', 'Thoáng mát', 'Thấm hút tốt', 'Dáng loose fit'],
    isNew: true,
    rating: 4.6,
    reviewCount: 145
  },
  {
    id: 'women-blouse-2',
    name: 'Áo Blouse Nữ Silk Touch',
    price: 690000,
    category: 'women',
    subcategory: 'Áo Blouse',
    images: [
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg'
    ],
    colors: ['Trắng', 'Đen', 'Hồng nhạt', 'Xanh Navy'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo blouse cảm giác như lụa, mềm mại và sang trọng',
    features: ['Silk Touch', 'Mềm mại', 'Không nhăn', 'Dáng regular'],
    rating: 4.7,
    reviewCount: 98
  },

  // T-Shirts
  {
    id: 'women-tshirt-1',
    name: 'Áo T-shirt Nữ Cotton',
    price: 290000,
    category: 'women',
    subcategory: 'T-shirt',
    images: [
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'
    ],
    colors: ['Trắng', 'Đen', 'Hồng', 'Xanh', 'Vàng'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo t-shirt nữ cotton basic, dễ phối đồ',
    features: ['100% Cotton', 'Form fitted', 'Dễ giặt', 'Màu bền'],
    rating: 4.4,
    reviewCount: 167
  },
  {
    id: 'women-tshirt-2',
    name: 'Áo T-shirt Nữ Dry',
    price: 350000,
    category: 'women',
    subcategory: 'T-shirt',
    images: [
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg'
    ],
    colors: ['Trắng', 'Đen', 'Xám', 'Hồng'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo t-shirt công nghệ Dry cho nữ, thích hợp tập thể thao',
    features: ['Dry Technology', 'Thấm hút mồ hôi', 'Nhanh khô', 'UV Protection'],
    isNew: true,
    rating: 4.5,
    reviewCount: 89
  },

  // Dresses
  {
    id: 'women-dress-1',
    name: 'Váy Midi Nữ A-Line',
    price: 690000,
    originalPrice: 890000,
    category: 'women',
    subcategory: 'Váy',
    images: [
      'https://images.pexels.com/photos/1162983/pexels-photo-1162983.jpeg',
      'https://images.pexels.com/photos/1853079/pexels-photo-1853079.jpeg'
    ],
    colors: ['Đen', 'Xanh Navy', 'Đỏ', 'Be'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Váy midi dáng A-line thanh lịch, phù hợp đi làm và dự tiệc',
    features: ['Polyester cao cấp', 'Không nhăn', 'Dáng A-line', 'Dễ mix đồ'],
    isSale: true,
    rating: 4.5,
    reviewCount: 134
  },
  {
    id: 'women-dress-2',
    name: 'Đầm Maxi Nữ Hoa',
    price: 890000,
    category: 'women',
    subcategory: 'Váy',
    images: [
      'https://images.pexels.com/photos/1162983/pexels-photo-1162983.jpeg',
      'https://images.pexels.com/photos/1853079/pexels-photo-1853079.jpeg'
    ],
    colors: ['Hoa đỏ', 'Hoa xanh', 'Hoa vàng'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Đầm maxi họa tiết hoa nữ tính, phù hợp dạo phố và du lịch',
    features: ['Chiffon mềm mại', 'Lót trong', 'Dây điều chỉnh', 'Dáng xòe'],
    isNew: true,
    rating: 4.6,
    reviewCount: 112
  },
  {
    id: 'women-dress-3',
    name: 'Váy Ngắn Nữ Denim',
    price: 550000,
    category: 'women',
    subcategory: 'Váy',
    images: [
      'https://images.pexels.com/photos/1853079/pexels-photo-1853079.jpeg',
      'https://images.pexels.com/photos/1162983/pexels-photo-1162983.jpeg'
    ],
    colors: ['Xanh đậm', 'Xanh nhạt'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Váy ngắn denim trẻ trung, phong cách casual',
    features: ['Cotton Denim', 'Bền chắc', 'Phong cách trẻ trung', 'Dễ phối đồ'],
    rating: 4.3,
    reviewCount: 78
  },

  // Cardigans
  {
    id: 'women-cardigan-1',
    name: 'Áo Cardigan Nữ Cotton',
    price: 790000,
    category: 'women',
    subcategory: 'Cardigan',
    images: [
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg'
    ],
    colors: ['Be', 'Xám', 'Hồng nhạt', 'Xanh'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo cardigan cotton mềm mại, layer hoàn hảo cho mọi outfit',
    features: ['Cotton pha modal', 'Mềm mại', 'Không xù lông', 'Form regular'],
    rating: 4.4,
    reviewCount: 156
  },
  {
    id: 'women-cardigan-2',
    name: 'Áo Cardigan Nữ Cashmere Touch',
    price: 990000,
    category: 'women',
    subcategory: 'Cardigan',
    images: [
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'
    ],
    colors: ['Be', 'Xám nhạt', 'Hồng', 'Đen'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo cardigan cảm giác như cashmere, sang trọng và ấm áp',
    features: ['Cashmere Touch', 'Siêu mềm', 'Giữ ấm tốt', 'Không xù lông'],
    isNew: true,
    rating: 4.8,
    reviewCount: 67
  },

  // Jeans
  {
    id: 'women-jean-1',
    name: 'Quần Jean Nữ Skinny',
    price: 790000,
    category: 'women',
    subcategory: 'Quần Jean',
    images: [
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'
    ],
    colors: ['Xanh đậm', 'Xanh nhạt', 'Đen'],
    sizes: ['25', '26', '27', '28', '29', '30'],
    description: 'Quần jean nữ form skinny ôm dáng, tôn lên đường cong cơ thể',
    features: ['Cotton pha Elastane', 'Co giãn 4 chiều', 'Bền màu', 'Form skinny'],
    rating: 4.5,
    reviewCount: 189
  },
  {
    id: 'women-jean-2',
    name: 'Quần Jean Nữ Straight',
    price: 750000,
    category: 'women',
    subcategory: 'Quần Jean',
    images: [
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg'
    ],
    colors: ['Xanh đậm', 'Đen', 'Xanh nhạt'],
    sizes: ['25', '26', '27', '28', '29', '30', '32'],
    description: 'Quần jean nữ form straight classic, phù hợp mọi dáng người',
    features: ['100% Cotton', 'Form straight', 'Vintage style', 'Bền chắc'],
    rating: 4.4,
    reviewCount: 145
  },

  // Jackets
  {
    id: 'women-jacket-1',
    name: 'Áo Khoác Blazer Nữ',
    price: 1290000,
    category: 'women',
    subcategory: 'Áo Khoác',
    images: [
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'
    ],
    colors: ['Đen', 'Xanh Navy', 'Be', 'Xám'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo blazer nữ thanh lịch, phù hợp công sở và dự tiệc',
    features: ['Polyester cao cấp', 'Không nhăn', 'Form fitted', 'Lót trong'],
    rating: 4.6,
    reviewCount: 98
  },
  {
    id: 'women-jacket-2',
    name: 'Áo Khoác Denim Nữ',
    price: 790000,
    category: 'women',
    subcategory: 'Áo Khoác',
    images: [
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg'
    ],
    colors: ['Xanh đậm', 'Xanh nhạt', 'Trắng'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo khoác denim nữ phong cách casual, dễ phối đồ',
    features: ['Cotton Denim', 'Bền chắc', 'Phong cách casual', 'Oversized fit'],
    rating: 4.3,
    reviewCount: 123
  },

  // Footwear & Accessories
  {
    id: 'women-sandal-1',
    name: 'Giày Sandal Nữ Quai Mảnh',
    price: 690000,
    category: 'women',
    subcategory: 'Giày',
    images: [
      'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg',
      'https://images.pexels.com/photos/189877/pexels-photo-189877.jpeg'
    ],
    colors: ['Be', 'Đen', 'Trắng', 'Hồng nhạt'],
    sizes: ['35', '36', '37', '38', '39', '40'],
    description: 'Giày sandal nữ quai mảnh thanh lịch, phù hợp đi làm và dự tiệc mùa hè.',
    features: ['Đế cao su êm', 'Quai da tổng hợp', 'Gót 5cm', 'Khóa điều chỉnh'],
    rating: 4.6,
    reviewCount: 134
  },
  {
    id: 'women-bag-1',
    name: 'Túi Xách Nữ Mini Leather',
    price: 1590000,
    category: 'women',
    subcategory: 'Túi xách',
    images: [
      'https://images.pexels.com/photos/1457987/pexels-photo-1457987.jpeg',
      'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg'
    ],
    colors: ['Nâu', 'Đen', 'Trắng', 'Xanh Olive'],
    sizes: ['One Size'],
    description: 'Túi xách nữ mini da mềm, thiết kế tối giản nhưng sang trọng.',
    features: ['Da tổng hợp cao cấp', 'Khoá kim loại', 'Ngăn phụ bên trong', 'Dây đeo chéo tháo rời'],
    isNew: true,
    rating: 4.7,
    reviewCount: 178
  },
  {
    id: 'women-boot-1',
    name: 'Boot Nữ Cổ Thấp Ankle',
    price: 1890000,
    category: 'women',
    subcategory: 'Giày',
    images: [
      'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg',
      'https://images.pexels.com/photos/842811/pexels-photo-842811.jpeg'
    ],
    colors: ['Đen', 'Nâu', 'Be'],
    sizes: ['35', '36', '37', '38', '39', '40', '41'],
    description: 'Boot nữ cổ thấp chất liệu da mềm, phối hợp hoàn hảo cho mùa thu đông.',
    features: ['Đế chống trượt', 'Khoá kéo hông', 'Lót nỉ ấm', 'Gót 4cm'],
    rating: 4.8,
    reviewCount: 156
  },

  // ===== KIDS PRODUCTS =====
  
  // Boys T-Shirts
  {
    id: 'kids-boy-tshirt-1',
    name: 'Áo T-shirt Bé Trai Graphic',
    price: 190000,
    category: 'kids',
    subcategory: 'T-shirt',
    images: [
      'https://images.pexels.com/photos/1619779/pexels-photo-1619779.jpeg',
      'https://images.pexels.com/photos/1682699/pexels-photo-1682699.jpeg'
    ],
    colors: ['Xanh', 'Đỏ', 'Vàng', 'Trắng'],
    sizes: ['100', '110', '120', '130', '140'],
    description: 'Áo t-shirt bé trai họa tiết graphic vui tươi, chất liệu cotton an toàn',
    features: ['100% Cotton organic', 'Không độc hại', 'Mềm mại', 'In chắc chắn'],
    rating: 4.7,
    reviewCount: 89
  },
  {
    id: 'kids-boy-tshirt-2',
    name: 'Áo T-shirt Bé Trai Dinosaur',
    price: 220000,
    category: 'kids',
    subcategory: 'T-shirt',
    images: [
      'https://images.pexels.com/photos/1682699/pexels-photo-1682699.jpeg',
      'https://images.pexels.com/photos/1619779/pexels-photo-1619779.jpeg'
    ],
    colors: ['Xanh lá', 'Xám', 'Đen'],
    sizes: ['100', '110', '120', '130', '140', '150'],
    description: 'Áo t-shirt bé trai họa tiết khủng long, thu hút các bé',
    features: ['Cotton organic', 'In 3D', 'Màu sắc bền', 'An toàn cho da'],
    isNew: true,
    rating: 4.8,
    reviewCount: 67
  },

  // Girls Dresses
  {
    id: 'kids-girl-dress-1',
    name: 'Váy Bé Gái Cotton Hoa',
    price: 290000,
    category: 'kids',
    subcategory: 'Váy',
    images: [
      'https://images.pexels.com/photos/1682699/pexels-photo-1682699.jpeg',
      'https://images.pexels.com/photos/1619779/pexels-photo-1619779.jpeg'
    ],
    colors: ['Hồng', 'Xanh nhạt', 'Vàng', 'Trắng'],
    sizes: ['100', '110', '120', '130'],
    description: 'Váy bé gái họa tiết hoa dễ thương, phù hợp cho các bé từ 2-8 tuổi',
    features: ['Cotton organic', 'Màu không phai', 'Dáng A-line', 'Thoải mái vận động'],
    isNew: true,
    rating: 4.6,
    reviewCount: 112
  },
  {
    id: 'kids-girl-dress-2',
    name: 'Đầm Bé Gái Princess',
    price: 350000,
    category: 'kids',
    subcategory: 'Váy',
    images: [
      'https://images.pexels.com/photos/1619779/pexels-photo-1619779.jpeg',
      'https://images.pexels.com/photos/1682699/pexels-photo-1682699.jpeg'
    ],
    colors: ['Hồng', 'Tím', 'Xanh'],
    sizes: ['100', '110', '120', '130', '140'],
    description: 'Đầm công chúa cho bé gái, thiết kế lộng lẫy cho các dịp đặc biệt',
    features: ['Chiffon mềm', 'Lót cotton', 'Thiết kế công chúa', 'Phụ kiện đi kèm'],
    rating: 4.5,
    reviewCount: 78
  },

  // Kids Jeans
  {
    id: 'kids-jean-1',
    name: 'Quần Jean Bé Trai',
    price: 390000,
    category: 'kids',
    subcategory: 'Quần Jean',
    images: [
      'https://images.pexels.com/photos/1619779/pexels-photo-1619779.jpeg',
      'https://images.pexels.com/photos/1682699/pexels-photo-1682699.jpeg'
    ],
    colors: ['Xanh đậm', 'Xanh nhạt', 'Đen'],
    sizes: ['100', '110', '120', '130', '140', '150'],
    description: 'Quần jean bé trai bền chắc, phù hợp cho các hoạt động vui chơi',
    features: ['Cotton denim', 'Bền chắc', 'Co giãn nhẹ', 'An toàn'],
    rating: 4.4,
    reviewCount: 95
  },
  {
    id: 'kids-jean-2',
    name: 'Quần Jean Bé Gái',
    price: 390000,
    category: 'kids',
    subcategory: 'Quần Jean',
    images: [
      'https://images.pexels.com/photos/1682699/pexels-photo-1682699.jpeg',
      'https://images.pexels.com/photos/1619779/pexels-photo-1619779.jpeg'
    ],
    colors: ['Xanh đậm', 'Xanh nhạt', 'Hồng nhạt'],
    sizes: ['100', '110', '120', '130', '140'],
    description: 'Quần jean bé gái thiết kế dễ thương với chi tiết thêu hoa',
    features: ['Cotton denim', 'Chi tiết thêu', 'Form skinny nhẹ', 'Thoải mái'],
    rating: 4.5,
    reviewCount: 87
  },

  // Kids Shorts
  {
    id: 'kids-short-1',
    name: 'Quần Short Bé Trai',
    price: 250000,
    category: 'kids',
    subcategory: 'Quần Short',
    images: [
      'https://images.pexels.com/photos/1619779/pexels-photo-1619779.jpeg',
      'https://images.pexels.com/photos/1682699/pexels-photo-1682699.jpeg'
    ],
    colors: ['Be', 'Xanh Navy', 'Xám', 'Đen'],
    sizes: ['100', '110', '120', '130', '140'],
    description: 'Quần short bé trai cotton thoải mái, phù hợp mùa hè',
    features: ['100% Cotton', 'Thoáng mát', 'Túi tiện lợi', 'Dây rút'],
    rating: 4.3,
    reviewCount: 76
  },
  {
    id: 'kids-short-2',
    name: 'Quần Short Bé Gái',
    price: 250000,
    category: 'kids',
    subcategory: 'Quần Short',
    images: [
      'https://images.pexels.com/photos/1682699/pexels-photo-1682699.jpeg',
      'https://images.pexels.com/photos/1619779/pexels-photo-1619779.jpeg'
    ],
    colors: ['Hồng', 'Trắng', 'Xanh nhạt', 'Vàng'],
    sizes: ['100', '110', '120', '130', '140'],
    description: 'Quần short bé gái với chi tiết bèo nhún dễ thương',
    features: ['Cotton mềm', 'Chi tiết bèo', 'Thoải mái', 'Dễ giặt'],
    rating: 4.4,
    reviewCount: 68
  },

  // Kids Jackets
  {
    id: 'kids-jacket-1',
    name: 'Áo Khoác Bé Trai',
    price: 590000,
    category: 'kids',
    subcategory: 'Áo Khoác',
    images: [
      'https://images.pexels.com/photos/1619779/pexels-photo-1619779.jpeg',
      'https://images.pexels.com/photos/1682699/pexels-photo-1682699.jpeg'
    ],
    colors: ['Xanh Navy', 'Đen', 'Xám'],
    sizes: ['100', '110', '120', '130', '140', '150'],
    description: 'Áo khoác bé trai chống gió, giữ ấm tốt',
    features: ['Chống gió', 'Giữ ấm', 'Nhẹ nhàng', 'Túi zip'],
    rating: 4.5,
    reviewCount: 89
  },
  {
    id: 'kids-jacket-2',
    name: 'Áo Khoác Bé Gái',
    price: 590000,
    category: 'kids',
    subcategory: 'Áo Khoác',
    images: [
      'https://images.pexels.com/photos/1682699/pexels-photo-1682699.jpeg',
      'https://images.pexels.com/photos/1619779/pexels-photo-1619779.jpeg'
    ],
    colors: ['Hồng', 'Tím', 'Trắng'],
    sizes: ['100', '110', '120', '130', '140'],
    description: 'Áo khoác bé gái với mũ trùm đầu dễ thương',
    features: ['Có mũ trùm', 'Giữ ấm', 'Thiết kế dễ thương', 'Chất liệu mềm'],
    isNew: true,
    rating: 4.6,
    reviewCount: 72
  }
];

export const categories = [
  { id: 'men', name: 'Nam', path: '/men' },
  { id: 'women', name: 'Nữ', path: '/women' },
  { id: 'kids', name: 'Trẻ em', path: '/kids' }
];

export const subcategories = {
  men: ['T-shirt', 'Áo Polo', 'Áo Sơ Mi', 'Quần Jean', 'Quần Kaki', 'Áo Khoác', 'Quần Short', 'Giày'],
  women: ['Áo Blouse', 'T-shirt', 'Váy', 'Cardigan', 'Quần Jean', 'Áo Khoác', 'Giày', 'Túi xách'],
  kids: ['T-shirt', 'Váy', 'Quần Jean', 'Quần Short', 'Áo Khoác']
};
