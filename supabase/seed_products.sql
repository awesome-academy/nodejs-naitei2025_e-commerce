-- Supabase seed for products
-- Creates table `public.products` and inserts product rows from the frontend sample data

begin;

-- Create products table
create table if not exists public.products (
  id text primary key,
  name text,
  price numeric,
  originalprice numeric,
  category text,
  subcategory text,
  images jsonb,
  colors jsonb,
  sizes jsonb,
  description text,
  features jsonb,
  isnew boolean,
  issale boolean,
  rating numeric,
  reviewcount int,
  stock int not null default 0,
  sold_count int not null default 0
);

-- Insert products from JSON array
insert into public.products (id, name, price, originalprice, category, subcategory, images, colors, sizes, description, features, isnew, issale, rating, reviewcount)
select id, name, price, originalprice, category, subcategory, images::jsonb, colors::jsonb, sizes::jsonb, description, features::jsonb, isnew, issale, rating, reviewcount
from jsonb_to_recordset(
  '[
  {
    "id": "men-tshirt-1",
    "name": "Áo T-shirt Nam Cotton Premium",
    "price": 290000,
    "originalprice": null,
    "category": "men",
    "subcategory": "T-shirt",
    "images": [
      "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg"
    ],
    "colors": ["Trắng","Đen","Xanh Navy","Xám"],
    "sizes": ["S","M","L","XL","XXL"],
    "description": "Áo t-shirt nam chất liệu cotton cao cấp, form regular fit thoải mái",
    "features": ["100% Cotton","Chống co rút","Dễ giặt","Form regular"],
    "isnew": true,
    "issale": false,
    "rating": 4.5,
    "reviewcount": 128
  },
  {
    "id": "men-tshirt-2",
    "name": "Áo T-shirt Nam Dry Technology",
    "price": 350000,
    "originalprice": null,
    "category": "men",
    "subcategory": "T-shirt",
    "images": [
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg",
      "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg"
    ],
    "colors": ["Trắng","Đen","Xanh","Đỏ","Vàng"],
    "sizes": ["S","M","L","XL"],
    "description": "Áo t-shirt công nghệ Dry thấm hút mồ hôi tốt, phù hợp thể thao",
    "features": ["Công nghệ Dry","Kháng khuẩn","Co giãn 4 chiều","Nhanh khô"],
    "isnew": false,
    "issale": false,
    "rating": 4.7,
    "reviewcount": 95
  },
  {
    "id": "men-tshirt-3",
    "name": "Áo T-shirt Nam Graphic Print",
    "price": 320000,
    "originalprice": 420000,
    "category": "men",
    "subcategory": "T-shirt",
    "images": [
      "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg",
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg"
    ],
    "colors": ["Đen","Trắng","Xám"],
    "sizes": ["S","M","L","XL"],
    "description": "Áo t-shirt nam họa tiết graphic hiện đại, phong cách streetwear",
    "features": ["Cotton pha","In chắc chắn","Thiết kế độc đáo"],
    "isnew": false,
    "issale": true,
    "rating": 4.3,
    "reviewcount": 67
  },

  {
    "id": "men-polo-1",
    "name": "Áo Polo Nam Cotton Pique",
    "price": 390000,
    "originalprice": 490000,
    "category": "men",
    "subcategory": "Áo Polo",
    "images": [
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg"
    ],
    "colors": ["Trắng","Đen","Xanh Navy","Xám","Đỏ"],
    "sizes": ["S","M","L","XL","XXL"],
    "description": "Áo polo nam chất liệu cotton pique cao cấp, thoáng mát và thoải mái",
    "features": ["100% Cotton Pique","Chống nhăn","Dễ giặt","Form regular"],
    "isnew": false,
    "issale": true,
    "rating": 4.6,
    "reviewcount": 142
  },

  {
    "id": "men-polo-2",
    "name": "Áo Polo Nam Dry Pique",
    "price": 450000,
    "originalprice": null,
    "category": "men",
    "subcategory": "Áo Polo",
    "images": [
      "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg"
    ],
    "colors": ["Xanh Navy","Trắng","Xám","Đen"],
    "sizes": ["S","M","L","XL"],
    "description": "Áo polo công nghệ Dry Pique, thấm hút mồ hôi tốt",
    "features": ["Dry Technology","UV Protection","Quick Dry"],
    "isnew": true,
    "issale": false,
    "rating": 4.8,
    "reviewcount": 89
  },

  {
    "id": "men-shirt-1",
    "name": "Áo Sơ Mi Nam Oxford",
    "price": 690000,
    "originalprice": null,
    "category": "men",
    "subcategory": "Áo Sơ Mi",
    "images": [
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg"
    ],
    "colors": ["Trắng","Xanh nhạt","Hồng nhạt","Xám"],
    "sizes": ["S","M","L","XL","XXL"],
    "description": "Áo sơ mi nam chất liệu Oxford cao cấp, phù hợp đi làm và dự tiệc",
    "features": ["Cotton Oxford","Chống nhăn","Form slim fit","Dễ ủi"],
    "isnew": false,
    "issale": false,
    "rating": 4.4,
    "reviewcount": 156
  },

  {
    "id": "men-shirt-2",
    "name": "Áo Sơ Mi Nam Easy Care",
    "price": 590000,
    "originalprice": null,
    "category": "men",
    "subcategory": "Áo Sơ Mi",
    "images": [
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg"
    ],
    "colors": ["Trắng","Xanh Navy","Xám nhạt"],
    "sizes": ["S","M","L","XL"],
    "description": "Áo sơ mi Easy Care không cần ủi, tiện lợi cho công việc",
    "features": ["Easy Care","Không cần ủi","Chống nhăn","Form regular"],
    "isnew": true,
    "issale": false,
    "rating": 4.5,
    "reviewcount": 98
  },

  {
    "id": "men-jean-1",
    "name": "Quần Jean Nam Slim Fit",
    "price": 790000,
    "originalprice": null,
    "category": "men",
    "subcategory": "Quần Jean",
    "images": [
      "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg",
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg"
    ],
    "colors": ["Xanh đậm","Xanh nhạt","Đen"],
    "sizes": ["29","30","31","32","33","34","36"],
    "description": "Quần jean nam form slim fit phù hợp với vóc dáng châu Á",
    "features": ["Cotton pha Spandex","Co giãn tốt","Bền màu","Form slim"],
    "isnew": false,
    "issale": false,
    "rating": 4.6,
    "reviewcount": 203
  },

  {
    "id": "men-jean-2",
    "name": "Quần Jean Nam Regular Fit",
    "price": 750000,
    "originalprice": null,
    "category": "men",
    "subcategory": "Quần Jean",
    "images": [
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg",
      "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg"
    ],
    "colors": ["Xanh đậm","Đen","Xám"],
    "sizes": ["29","30","31","32","33","34","36","38"],
    "description": "Quần jean nam form regular thoải mái, phù hợp mọi dáng người",
    "features": ["100% Cotton","Form regular","Bền chắc","Classic style"],
    "isnew": false,
    "issale": false,
    "rating": 4.4,
    "reviewcount": 167
  },

  {
    "id": "men-chino-1",
    "name": "Quần Kaki Nam Chino",
    "price": 650000,
    "originalprice": null,
    "category": "men",
    "subcategory": "Quần Kaki",
    "images": [
      "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg",
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg"
    ],
    "colors": ["Be","Xanh Navy","Xám","Đen"],
    "sizes": ["29","30","31","32","33","34","36"],
    "description": "Quần kaki nam chino cao cấp, phù hợp đi làm và dạo phố",
    "features": ["Cotton Twill","Chống nhăn","Form slim","Túi ẩn"],
    "isnew": false,
    "issale": false,
    "rating": 4.5,
    "reviewcount": 134
  },

  {
    "id": "men-chino-2",
    "name": "Quần Kaki Nam Stretch",
    "price": 690000,
    "originalprice": null,
    "category": "men",
    "subcategory": "Quần Kaki",
    "images": [
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg",
      "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg"
    ],
    "colors": ["Be","Xám","Xanh Navy"],
    "sizes": ["30","31","32","33","34","36"],
    "description": "Quần kaki co giãn thoải mái, phù hợp vận động",
    "features": ["Cotton pha Elastane","Co giãn 4 chiều","Thoải mái"],
    "isnew": true,
    "issale": false,
    "rating": 4.7,
    "reviewcount": 76
  },

  {
    "id": "men-jacket-1",
    "name": "Áo Khoác Bomber Nam",
    "price": 1290000,
    "originalprice": 1590000,
    "category": "men",
    "subcategory": "Áo Khoác",
    "images": [
      "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg",
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg"
    ],
    "colors": ["Đen","Xanh Navy","Xám"],
    "sizes": ["S","M","L","XL"],
    "description": "Áo khoác bomber phong cách streetwear, chất liệu polyester cao cấp",
    "features": ["Chống gió","Lót lưới thoáng khí","Túi zip an toàn","Form regular"],
    "isnew": false,
    "issale": true,
    "rating": 4.3,
    "reviewcount": 89
  },

  {
    "id": "men-jacket-2",
    "name": "Áo Khoác Denim Nam",
    "price": 890000,
    "originalprice": null,
    "category": "men",
    "subcategory": "Áo Khoác",
    "images": [
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg"
    ],
    "colors": ["Xanh đậm","Xanh nhạt"],
    "sizes": ["S","M","L","XL"],
    "description": "Áo khoác denim classic, phong cách vintage không bao giờ lỗi thời",
    "features": ["100% Cotton Denim","Bền chắc","Classic fit","Vintage style"],
    "isnew": false,
    "issale": false,
    "rating": 4.4,
    "reviewcount": 112
  },

  {
    "id": "men-short-1",
    "name": "Quần Short Nam Cotton",
    "price": 450000,
    "originalprice": null,
    "category": "men",
    "subcategory": "Quần Short",
    "images": [
      "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg",
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg"
    ],
    "colors": ["Be","Xanh Navy","Xám","Đen"],
    "sizes": ["S","M","L","XL"],
    "description": "Quần short nam cotton thoải mái, phù hợp mùa hè",
    "features": ["100% Cotton","Thoáng mát","Túi tiện lợi","Form regular"],
    "isnew": false,
    "issale": false,
    "rating": 4.2,
    "reviewcount": 87
  },

  {
    "id": "women-blouse-1",
    "name": "Áo Blouse Nữ Linen",
    "price": 590000,
    "originalprice": null,
    "category": "women",
    "subcategory": "Áo Blouse",
    "images": [
      "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg",
      "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg"
    ],
    "colors": ["Trắng","Xanh nhạt","Hồng","Be"],
    "sizes": ["S","M","L","XL"],
    "description": "Áo blouse nữ chất liệu linen cao cấp, phong cách thanh lịch",
    "features": ["100% Linen","Thoáng mát","Thấm hút tốt","Dáng loose fit"],
    "isnew": true,
    "issale": false,
    "rating": 4.6,
    "reviewcount": 145
  },

  {
    "id": "women-blouse-2",
    "name": "Áo Blouse Nữ Silk Touch",
    "price": 690000,
    "originalprice": null,
    "category": "women",
    "subcategory": "Áo Blouse",
    "images": [
      "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg",
      "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg"
    ],
    "colors": ["Trắng","Đen","Hồng nhạt","Xanh Navy"],
    "sizes": ["S","M","L","XL"],
    "description": "Áo blouse cảm giác như lụa, mềm mại và sang trọng",
    "features": ["Silk Touch","Mềm mại","Không nhăn","Dáng regular"],
    "isnew": false,
    "issale": false,
    "rating": 4.7,
    "reviewcount": 98
  },

  {
    "id": "women-tshirt-1",
    "name": "Áo T-shirt Nữ Cotton",
    "price": 290000,
    "originalprice": null,
    "category": "women",
    "subcategory": "T-shirt",
    "images": [
      "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg",
      "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg"
    ],
    "colors": ["Trắng","Đen","Hồng","Xanh","Vàng"],
    "sizes": ["S","M","L","XL"],
    "description": "Áo t-shirt nữ cotton basic, dễ phối đồ",
    "features": ["100% Cotton","Form fitted","Dễ giặt","Màu bền"],
    "isnew": false,
    "issale": false,
    "rating": 4.4,
    "reviewcount": 167
  }

]'
::jsonb) as x(
    id text,
    name text,
    price numeric,
    originalprice numeric,
    category text,
    subcategory text,
    images jsonb,
    colors jsonb,
    sizes jsonb,
    description text,
    features jsonb,
    isnew boolean,
    issale boolean,
    rating numeric,
    reviewcount int
  );

-- Randomized demo inventory metrics so stock/sold_count are non-zero
update public.products
set
  stock = ((random() * 60) + 20)::int,
  sold_count = ((random() * 180) + 40)::int
where stock = 0
  and sold_count = 0;

commit;

-- End of seed file
