import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ChevronRight, ClipboardList, Heart, Ruler, Sparkles, Shirt } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../data/products';
import { buildFallbackProducts, getProducts } from '../services/productService';

type FitPreference = 'regular' | 'relaxed' | 'oversize';
type AdviceCategory = 'men' | 'women' | 'kids';

type SizeResult = {
  size: string;
  note: string;
  alternativeSmaller: string;
  alternativeLarger: string;
};

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const nextSize = (size: string) => {
  const idx = SIZE_ORDER.indexOf(size);
  if (idx < 0 || idx === SIZE_ORDER.length - 1) return size;
  return SIZE_ORDER[idx + 1];
};

const prevSize = (size: string) => {
  const idx = SIZE_ORDER.indexOf(size);
  if (idx <= 0) return size;
  return SIZE_ORDER[idx - 1];
};

const estimateAdultSize = (height: number, weight: number): string => {
  if (height >= 185 || weight >= 88) return 'XXL';
  if (height >= 178 || weight >= 78) return 'XL';
  if (height >= 172 || weight >= 68) return 'L';
  if (height >= 165 || weight >= 58) return 'M';
  if (height >= 155 || weight >= 48) return 'S';
  return 'XS';
};

const estimateKidSize = (height: number): string => {
  if (height >= 145) return '150';
  if (height >= 135) return '140';
  if (height >= 125) return '130';
  if (height >= 115) return '120';
  if (height >= 105) return '110';
  return '100';
};

const getSizeSuggestion = (
  category: AdviceCategory,
  height: number,
  weight: number,
  fit: FitPreference
): SizeResult => {
  if (!height || (!weight && category !== 'kids')) {
    return {
      size: '-',
      note: 'Vui lòng nhập chiều cao và cân nặng để nhận gợi ý.',
      alternativeSmaller: '-',
      alternativeLarger: '-'
    };
  }

  let baseSize = category === 'kids' ? estimateKidSize(height) : estimateAdultSize(height, weight);
  if (category !== 'kids') {
    if (fit === 'oversize') baseSize = nextSize(baseSize);
    if (fit === 'relaxed') baseSize = nextSize(baseSize);
    if (fit === 'regular') baseSize = baseSize;
  }

  return {
    size: baseSize,
    note:
      category === 'kids'
        ? 'Size trẻ em dựa theo chiều cao. Nên chọn lớn hơn nếu bé đang phát triển nhanh.'
        : 'Gợi ý dựa theo chiều cao/cân nặng và form mặc mong muốn.',
    alternativeSmaller: category === 'kids' ? baseSize : prevSize(baseSize),
    alternativeLarger: category === 'kids' ? baseSize : nextSize(baseSize)
  };
};

const StyleAdvice: React.FC = () => {
  const [category, setCategory] = useState<AdviceCategory>('men');
  const [fit, setFit] = useState<FitPreference>('regular');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const [activeOutfit, setActiveOutfit] = useState<'work' | 'street' | 'date' | null>(null);

  const suggestion = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    return getSizeSuggestion(category, h, w, fit);
  }, [category, fit, height, weight]);

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => setIsCalculating(false), 450);
    return () => clearTimeout(timer);
  }, [category, fit, height, weight]);

  const outfitRules: Record<'work' | 'street' | 'date', Record<AdviceCategory, string[]>> = {
    work: {
      men: ['Áo Sơ Mi', 'Áo Polo', 'Áo Khoác', 'Quần Kaki', 'Quần Jean', 'Giày'],
      women: ['Áo Blouse', 'Áo Khoác', 'Váy', 'Quần Jean', 'Giày', 'Túi xách'],
      kids: ['T-shirt', 'Áo Khoác', 'Quần Jean']
    },
    street: {
      men: ['T-shirt', 'Áo Polo', 'Áo Khoác', 'Quần Jean', 'Quần Short', 'Giày'],
      women: ['T-shirt', 'Cardigan', 'Áo Khoác', 'Quần Jean', 'Váy', 'Giày'],
      kids: ['T-shirt', 'Quần Short', 'Quần Jean', 'Áo Khoác']
    },
    date: {
      men: ['Áo Polo', 'Áo Sơ Mi', 'Áo Khoác', 'Quần Kaki', 'Quần Jean', 'Giày'],
      women: ['Váy', 'Áo Blouse', 'Cardigan', 'Giày', 'Túi xách'],
      kids: ['Váy', 'T-shirt', 'Quần Jean', 'Quần Short']
    }
  };

  const outfitPriority: Record<'work' | 'street' | 'date', Record<AdviceCategory, string[]>> = {
    work: {
      men: ['Áo Sơ Mi', 'Quần Kaki', 'Giày', 'Áo Polo', 'Áo Khoác', 'Quần Jean'],
      women: ['Áo Blouse', 'Váy', 'Giày', 'Túi xách', 'Áo Khoác', 'Quần Jean'],
      kids: ['Áo Khoác', 'Quần Jean', 'T-shirt']
    },
    street: {
      men: ['T-shirt', 'Quần Jean', 'Giày', 'Quần Short', 'Áo Polo', 'Áo Khoác'],
      women: ['T-shirt', 'Quần Jean', 'Giày', 'Váy', 'Cardigan', 'Áo Khoác'],
      kids: ['T-shirt', 'Quần Short', 'Quần Jean', 'Áo Khoác']
    },
    date: {
      men: ['Áo Polo', 'Quần Kaki', 'Giày', 'Áo Sơ Mi', 'Áo Khoác', 'Quần Jean'],
      women: ['Váy', 'Giày', 'Áo Blouse', 'Túi xách', 'Cardigan'],
      kids: ['Váy', 'T-shirt', 'Quần Jean', 'Quần Short']
    }
  };

  const outfitCards = [
    {
      title: 'Đi làm',
      icon: <Briefcase size={22} />,
      items: ['Áo sơ mi basic', 'Quần âu form đứng', 'Giày loafer'],
      cta: 'Xem combo gợi ý',
      key: 'work' as const
    },
    {
      title: 'Dạo phố',
      icon: <Shirt size={22} />,
      items: ['Áo thun trơn', 'Jeans slim', 'Sneaker trắng'],
      cta: 'Xem outfit',
      key: 'street' as const
    },
    {
      title: 'Hẹn hò',
      icon: <Heart size={22} />,
      items: ['Polo ôm nhẹ', 'Chinos', 'Giày da tối màu'],
      cta: 'Xem outfit',
      key: 'date' as const
    }
  ];

  const ensureCatalog = async () => {
    if (catalogReady || catalogLoading) return;
    setCatalogLoading(true);
    const remote = await getProducts();
    if (remote && remote.length > 0) {
      setCatalog(remote);
    } else {
      setCatalog(buildFallbackProducts());
    }
    setCatalogReady(true);
    setCatalogLoading(false);
  };

  const handleOutfitClick = async (key: 'work' | 'street' | 'date') => {
    await ensureCatalog();
    setActiveOutfit(key);
  };

  const outfitProducts = useMemo(() => {
    if (!activeOutfit) return [];
    const allowed = outfitRules[activeOutfit][category];
    const priority = outfitPriority[activeOutfit][category];
    const filtered = catalog.filter(
      (product) => product.category === category && allowed.includes(product.subcategory)
    );
    const sorted = [...filtered].sort((a, b) => {
      const scoreA = priority.indexOf(a.subcategory);
      const scoreB = priority.indexOf(b.subcategory);
      if (scoreA !== scoreB) {
        return (scoreA === -1 ? 999 : scoreA) - (scoreB === -1 ? 999 : scoreB);
      }
      const soldDiff = (b.soldCount ?? 0) - (a.soldCount ?? 0);
      if (soldDiff !== 0) return soldDiff;
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
    if (sorted.length > 0) return sorted.slice(0, 6);
    return catalog.filter((product) => product.category === category).slice(0, 6);
  }, [activeOutfit, catalog, category, outfitRules]);

  const sizeFaq = [
    {
      q: 'Chọn size khi phân vân giữa 2 size?',
      a: 'Nếu thích mặc vừa người, chọn size nhỏ hơn; nếu thích thoải mái, chọn size lớn hơn.'
    },
    {
      q: 'Chất liệu co giãn ảnh hưởng size thế nào?',
      a: 'Vải co giãn có thể chọn size nhỏ hơn 1 nấc để ôm gọn, đặc biệt với áo thun.'
    },
    {
      q: 'Áo khoác có nên chọn lớn hơn?',
      a: 'Nên tăng 1 size nếu bạn thường mặc nhiều lớp bên trong.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-red-600">Trang chủ</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Tư vấn</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-red-600 mb-3">
            <Sparkles size={22} />
            <span className="text-xs font-semibold uppercase tracking-wide">Tư vấn nhanh</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Gợi ý Outfit & Size thông minh
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto">
            Chỉ cần 30 giây – chọn đúng outfit & size phù hợp với bạn.
          </p>
          <p className="text-xs text-gray-500 max-w-2xl mx-auto mt-1">
            Dựa trên chiều cao, cân nặng và phong cách bạn thích.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Outfit guidance */}
            <div className="bg-white border rounded-lg p-8 shadow-sm">
              <div className="flex items-center space-x-2 text-red-600 mb-4">
                <ClipboardList size={22} />
                <h2 className="text-2xl font-bold text-gray-900">Gợi ý Outfit (Mix & Match)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {outfitCards.map((card) => (
                  <div key={card.title} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{card.title}</p>
                      <span className="text-red-600">{card.icon}</span>
                    </div>
                    <div className="mt-3 text-sm text-gray-600 space-y-1">
                      {card.items.map((item) => (
                        <p key={item}>• {item}</p>
                      ))}
                    </div>
                    <button
                      className="mt-4 text-sm font-medium text-red-600 hover:text-red-700"
                      onClick={() => handleOutfitClick(card.key)}
                      type="button"
                    >
                      {card.cta} →
                    </button>
                  </div>
                ))}
              </div>
              {activeOutfit && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-gray-900">
                      Outfit gợi ý: {activeOutfit === 'work' ? 'Đi làm' : activeOutfit === 'street' ? 'Dạo phố' : 'Hẹn hò'}
                    </p>
                    <span className="text-xs text-gray-500">
                      {category === 'men' ? 'Nam' : category === 'women' ? 'Nữ' : 'Trẻ em'}
                    </span>
                  </div>
                  {catalogLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, idx) => (
                        <div key={idx} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : outfitProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {outfitProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Chưa có sản phẩm phù hợp để gợi ý.</p>
                  )}
                </div>
              )}
            </div>

            {/* Size advisor */}
            <div className="bg-white border rounded-lg p-8 shadow-sm">
              <div className="flex items-center space-x-2 text-red-600 mb-4">
                <Ruler size={22} />
                <h2 className="text-2xl font-bold text-gray-900">Gợi ý size thông minh</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhóm đối tượng
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AdviceCategory)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="men">Nam</option>
                    <option value="women">Nữ</option>
                    <option value="kids">Trẻ em</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Form mong muốn
                  </label>
                  <div className="relative">
                    <select
                      value={fit}
                      onChange={(e) => setFit(e.target.value as FitPreference)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      disabled={category === 'kids'}
                    >
                      <option value="regular">Vừa vặn</option>
                      <option value="relaxed">Thoải mái</option>
                      <option value="oversize">Oversize</option>
                    </select>
                    <span
                      className="absolute right-3 top-2.5 text-gray-400 text-xs"
                      title="Form thoải mái: rộng hơn 1 chút so với chuẩn, dễ vận động."
                    >
                      ?
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    min="80"
                    max="210"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Ví dụ: 165"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="140"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Ví dụ: 52"
                    disabled={category === 'kids'}
                  />
                </div>
              </div>

              <div className="mt-6 bg-gray-50 border rounded-lg p-4 transition-all duration-300">
                {isCalculating ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-2/5" />
                    <div className="h-8 bg-gray-200 rounded w-1/3 mt-3" />
                    <div className="h-3 bg-gray-200 rounded w-3/5 mt-3" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">Size phù hợp nhất với bạn</p>
                    <p className="text-2xl font-bold text-gray-900">{suggestion.size}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      📏 {height || '...'}cm – ⚖️ {category === 'kids' ? '... kg' : weight || '... kg'} – 👕{' '}
                      {category === 'kids' ? 'Trẻ em' : fit === 'regular' ? 'Vừa vặn' : fit === 'relaxed' ? 'Thoải mái' : 'Oversize'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{suggestion.note}</p>
                    {suggestion.size !== '-' && category !== 'kids' && (
                      <div className="mt-3 text-xs text-gray-600 space-y-1">
                        <p>→ Nếu thích ôm người hơn: chọn {suggestion.alternativeSmaller}</p>
                        <p>→ Nếu thích rộng hơn: chọn {suggestion.alternativeLarger}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors">
                  Xem sản phẩm size {suggestion.size}
                </button>
                <button
                  className="w-full border border-red-600 text-red-600 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
                  type="button"
                  onClick={() => handleOutfitClick('street')}
                >
                  Xem outfit phù hợp với tôi
                </button>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">FAQ chọn size</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  {sizeFaq.map((faq) => (
                    <div key={faq.q}>
                      <p className="font-medium text-gray-800">{faq.q}</p>
                      <p>{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StyleAdvice;
