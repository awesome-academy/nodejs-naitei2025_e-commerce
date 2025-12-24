import type { Product } from '../data/products';

export type LabelCategory = 'men' | 'women' | 'kids';

export interface LabelInfo {
  key: string;
  displayName: string;
  category: LabelCategory;
  subcategory: string;
  keywords?: string[];
  demoProductIds?: string[];
}

const LABEL_DICTIONARY: Record<string, LabelInfo> = {
  quan_short_nam: {
    key: 'quan_short_nam',
    displayName: 'Quần Short Nam',
    category: 'men',
    subcategory: 'Quần Short',
    keywords: ['short', 'nam', 'quan short'],
    demoProductIds: ['men-short-1']
  },
  chan_vay_lua: {
    key: 'chan_vay_lua',
    displayName: 'chan vay lua',
    category: 'women',
    subcategory: 'Váy',
    keywords: ['chan vay', 'lua', 'skirt'],
    demoProductIds: ['women-dress-1']
  },
  chan_vay_but_chi_dai_nu: {
    key: 'chan_vay_but_chi_dai_nu',
    displayName: 'chân váy bút chì dài nữ',
    category: 'women',
    subcategory: 'Váy',
    keywords: ['chan vay', 'but chi', 'dai', 'pencil skirt'],
    demoProductIds: ['women-dress-1']
  },
  chan_vay_but_chi_ngan_nu: {
    key: 'chan_vay_but_chi_ngan_nu',
    displayName: 'chân váy bút chì ngắn nữ',
    category: 'women',
    subcategory: 'Váy',
    keywords: ['chan vay', 'but chi', 'ngan', 'pencil skirt'],
    demoProductIds: ['women-dress-1']
  },
  chan_vay_jeans_dai_nu: {
    key: 'chan_vay_jeans_dai_nu',
    displayName: 'chân váy jeans dài nữ',
    category: 'women',
    subcategory: 'Váy',
    keywords: ['chan vay', 'jeans', 'dai', 'denim skirt'],
    demoProductIds: ['women-dress-1']
  },
  chan_vay_jeans_ngan_nu: {
    key: 'chan_vay_jeans_ngan_nu',
    displayName: 'chân váy jeans ngắn nữ',
    category: 'women',
    subcategory: 'Váy',
    keywords: ['chan vay', 'jeans', 'ngan', 'denim skirt'],
    demoProductIds: ['women-dress-1']
  },
  chan_vay_xe_ta_dai_nu: {
    key: 'chan_vay_xe_ta_dai_nu',
    displayName: 'chân váy xẻ tà dài nữ',
    category: 'women',
    subcategory: 'Váy',
    keywords: ['chan vay', 'xe ta', 'dai', 'slit skirt'],
    demoProductIds: ['women-dress-1']
  },
  chan_vay_xep_ly_dai_nu: {
    key: 'chan_vay_xep_ly_dai_nu',
    displayName: 'chân váy xếp ly dài nữ',
    category: 'women',
    subcategory: 'Váy',
    keywords: ['chan vay', 'xep ly', 'dai', 'pleated skirt'],
    demoProductIds: ['women-dress-1']
  },
  chan_vay_xep_ly_ngan_nu: {
    key: 'chan_vay_xep_ly_ngan_nu',
    displayName: 'chân váy xếp ly ngắn nữ',
    category: 'women',
    subcategory: 'Váy',
    keywords: ['chan vay', 'xep ly', 'ngan', 'pleated skirt'],
    demoProductIds: ['women-dress-1']
  },
  chan_vay_duoi_ca_nu: {
    key: 'chan_vay_duoi_ca_nu',
    displayName: 'chân váy đuôi cá nữ',
    category: 'women',
    subcategory: 'Váy',
    keywords: ['chan vay', 'duoi ca', 'mermaid skirt'],
    demoProductIds: ['women-dress-1']
  },
  giay_boots_nam: {
    key: 'giay_boots_nam',
    displayName: 'giày boots nam',
    category: 'men',
    subcategory: 'Giày',
    keywords: ['boot', 'giay', 'nam', 'boots'],
    demoProductIds: ['men-sneaker-1']
  },
  giay_cao_got: {
    key: 'giay_cao_got',
    displayName: 'giày cao gót',
    category: 'women',
    subcategory: 'Giày',
    keywords: ['cao got', 'heel', 'giay nu', 'high heel'],
    demoProductIds: ['women-sandal-1', 'women-boot-1']
  },
  giay_sandal_nu: {
    key: 'giay_sandal_nu',
    displayName: 'giày sandal nữ',
    category: 'women',
    subcategory: 'Giày',
    keywords: ['sandal', 'nu', 'giay sandal'],
    demoProductIds: ['women-sandal-1']
  },
  giay_sneaker: {
    key: 'giay_sneaker',
    displayName: 'giày sneaker',
    category: 'men',
    subcategory: 'Giày',
    keywords: ['sneaker', 'giay the thao', 'sport shoes'],
    demoProductIds: ['men-sneaker-1']
  },
  quan_jeans_nam: {
    key: 'quan_jeans_nam',
    displayName: 'quần jeans nam',
    category: 'men',
    subcategory: 'Quần Jean',
    keywords: ['jean', 'nam', 'quan jeans', 'denim'],
    demoProductIds: ['men-jean-1', 'men-jean-2']
  },
  quan_lot_nam: {
    key: 'quan_lot_nam',
    displayName: 'quần lót nam',
    category: 'men',
    subcategory: 'Quần Short',
    keywords: ['do lot', 'underwear', 'quan lot'],
    demoProductIds: ['men-short-1']
  },
  quan_tre_em: {
    key: 'quan_tre_em',
    displayName: 'quần trẻ em',
    category: 'kids',
    subcategory: 'Quần Short',
    keywords: ['tre em', 'kid pants', 'quan tre em'],
    demoProductIds: ['kids-short-1', 'kids-jean-1']
  },
  quan_tay_nam: {
    key: 'quan_tay_nam',
    displayName: 'quần tây nam',
    category: 'men',
    subcategory: 'Quần Kaki',
    keywords: ['quan tay', 'kaki', 'slack', 'trousers'],
    demoProductIds: ['men-chino-1', 'men-chino-2']
  },
  tui_xach_nu: {
    key: 'tui_xach_nu',
    displayName: 'túi xách nữ',
    category: 'women',
    subcategory: 'Túi xách',
    keywords: ['bag', 'tui', 'handbag', 'purse'],
    demoProductIds: ['women-bag-1']
  },
  tui_deo_cheo_nam: {
    key: 'tui_deo_cheo_nam',
    displayName: 'túi đeo chéo nam',
    category: 'men',
    subcategory: 'Túi xách',
    keywords: ['crossbody', 'tui deo cheo', 'crossbody bag'],
    demoProductIds: ['women-bag-1']
  },
  ao_dai_nu: {
    key: 'ao_dai_nu',
    displayName: 'áo dài nữ',
    category: 'women',
    subcategory: 'Áo Blouse',
    keywords: ['ao dai', 'vietnamese dress', 'traditional'],
    demoProductIds: ['women-blouse-1']
  },
  ao_hoodie: {
    key: 'ao_hoodie',
    displayName: 'áo hoodie',
    category: 'men',
    subcategory: 'Áo Khoác',
    keywords: ['hoodie', 'sweatshirt', 'hooded'],
    demoProductIds: ['men-jacket-1']
  },
  ao_khoac_blazer_nam: {
    key: 'ao_khoac_blazer_nam',
    displayName: 'áo khoác blazer nam',
    category: 'men',
    subcategory: 'Áo Khoác',
    keywords: ['blazer', 'nam', 'jacket'],
    demoProductIds: ['men-jacket-1', 'men-jacket-2']
  },
  ao_khoac_blazer_nu: {
    key: 'ao_khoac_blazer_nu',
    displayName: 'áo khoác blazer nữ',
    category: 'women',
    subcategory: 'Áo Khoác',
    keywords: ['blazer', 'nu', 'jacket'],
    demoProductIds: ['women-jacket-1']
  },
  ao_khoac_nam: {
    key: 'ao_khoac_nam',
    displayName: 'áo khoác nam',
    category: 'men',
    subcategory: 'Áo Khoác',
    keywords: ['jacket', 'outerwear', 'ao khoac'],
    demoProductIds: ['men-jacket-1', 'men-jacket-2']
  },
  ao_khoac_tre_em: {
    key: 'ao_khoac_tre_em',
    displayName: 'áo khoác trẻ em',
    category: 'kids',
    subcategory: 'Áo Khoác',
    keywords: ['kid jacket', 'ao khoac tre em'],
    demoProductIds: ['kids-jacket-1', 'kids-jacket-2']
  },
  ao_len_nu: {
    key: 'ao_len_nu',
    displayName: 'áo len nữ',
    category: 'women',
    subcategory: 'Cardigan',
    keywords: ['ao len', 'sweater', 'knit', 'cardigan'],
    demoProductIds: ['women-cardigan-1', 'women-cardigan-2']
  },
  ao_nguc_nu: {
    key: 'ao_nguc_nu',
    displayName: 'áo ngực nữ',
    category: 'women',
    subcategory: 'Cardigan',
    keywords: ['innerwear', 'bralette', 'ao lot', 'bra'],
    demoProductIds: ['women-cardigan-1', 'women-cardigan-2']
  },
  ao_polo_nam: {
    key: 'ao_polo_nam',
    displayName: 'áo polo nam',
    category: 'men',
    subcategory: 'Áo Polo',
    keywords: ['polo', 'nam', 'polo shirt'],
    demoProductIds: ['men-polo-1', 'men-polo-2']
  },
  ao_so_mi_nam: {
    key: 'ao_so_mi_nam',
    displayName: 'áo sơ mi nam',
    category: 'men',
    subcategory: 'Áo Sơ Mi',
    keywords: ['shirt', 'so mi', 'dress shirt'],
    demoProductIds: ['men-shirt-1', 'men-shirt-2']
  },
  ao_so_mi_nu: {
    key: 'ao_so_mi_nu',
    displayName: 'áo sơ mi nữ',
    category: 'women',
    subcategory: 'Áo Blouse',
    keywords: ['so mi nu', 'blouse', 'shirt'],
    demoProductIds: ['women-blouse-1', 'women-blouse-2']
  },
  ao_thun_be_trai: {
    key: 'ao_thun_be_trai',
    displayName: 'áo thun bé trai',
    category: 'kids',
    subcategory: 'T-shirt',
    keywords: ['tshirt', 'be trai', 'kid tshirt'],
    demoProductIds: ['kids-boy-tshirt-1', 'kids-boy-tshirt-2']
  },
  ao_thun_nam: {
    key: 'ao_thun_nam',
    displayName: 'áo thun nam',
    category: 'men',
    subcategory: 'T-shirt',
    keywords: ['tshirt', 'ao thun', 't-shirt'],
    demoProductIds: ['men-tshirt-1', 'men-tshirt-2']
  },
  ao_thun_nu: {
    key: 'ao_thun_nu',
    displayName: 'áo thun nữ',
    category: 'women',
    subcategory: 'T-shirt',
    keywords: ['tshirt nu', 'ao thun', 't-shirt'],
    demoProductIds: ['women-tshirt-1', 'women-tshirt-2']
  },
  dam_dang_om_dai_nu: {
    key: 'dam_dang_om_dai_nu',
    displayName: 'đầm dáng ôm dài nữ',
    category: 'women',
    subcategory: 'Đầm',
    keywords: ['đầm', 'dáng ôm', 'dài', 'đầm dáng ôm', 'đầm dài'],
    demoProductIds: ['women-dress-1', 'women-dress-2']
  },
  dam_dang_om_ngan_nu: {
    key: 'dam_dang_om_ngan_nu',
    displayName: 'đầm dáng ôm ngắn nữ',
    category: 'women',
    subcategory: 'Đầm',
    keywords: ['đầm', 'dáng ôm', 'ngắn', 'đầm dáng ôm', 'đầm ngắn'],
    demoProductIds: ['women-dress-1', 'women-dress-2']
  },
  dam_xoe_dai_nu: {
    key: 'dam_xoe_dai_nu',
    displayName: 'đầm xòe dài nữ',
    category: 'women',
    subcategory: 'Đầm',
    keywords: ['đầm', 'xòe', 'dài', 'đầm xòe', 'đầm dài'],
    demoProductIds: ['women-dress-1', 'women-dress-2']
  },
  dam_xoe_ngan_nu: {
    key: 'dam_xoe_ngan_nu',
    displayName: 'đầm xòe ngắn nữ',
    category: 'women',
    subcategory: 'Đầm',
    keywords: ['đầm', 'xòe', 'ngắn', 'đầm xòe', 'đầm ngắn'],
    demoProductIds: ['women-dress-1', 'women-dress-2']
  },
  dam_be_gai: {
    key: 'dam_be_gai',
    displayName: 'đầm bé gái',
    category: 'kids',
    subcategory: 'Đầm',
    keywords: ['đầm', 'bé gái', 'đầm bé gái', 'đầm trẻ em'],
    demoProductIds: ['kids-girl-dress-1', 'kids-girl-dress-2']
  },
  dam_bau_nu: {
    key: 'dam_bau_nu',
    displayName: 'đầm bầu nữ',
    category: 'women',
    subcategory: 'Đầm',
    keywords: ['đầm', 'bầu', 'đầm bầu', 'đầm bà bầu'],
    demoProductIds: ['women-dress-1', 'women-dress-2']
  },
  dam_cong_so_nu: {
    key: 'dam_cong_so_nu',
    displayName: 'đầm công sở nữ',
    category: 'women',
    subcategory: 'Đầm',
    keywords: ['đầm', 'công sở', 'đầm công sở', 'đầm văn phòng'],
    demoProductIds: ['women-dress-1', 'women-dress-2']
  },
  do_ngu_nu: {
    key: 'do_ngu_nu',
    displayName: 'đồ ngủ nữ',
    category: 'women',
    subcategory: 'Cardigan',
    keywords: ['sleepwear', 'pajama', 'do ngu'],
    demoProductIds: ['women-cardigan-2']
  },
  do_ngu_tre_em: {
    key: 'do_ngu_tre_em',
    displayName: 'đồ ngủ trẻ em',
    category: 'kids',
    subcategory: 'T-shirt',
    keywords: ['sleepwear', 'kid pajama', 'do ngu tre em'],
    demoProductIds: ['kids-boy-tshirt-1', 'kids-short-1']
  }
};

export function normalizeAiLabel(label?: string): string {
  if (!label) return '';
  let base = label.trim().toLowerCase();
  
  base = base.replace(/đ/g, 'd');
  base = base.replace(/Đ/g, 'd');
  
  const stripped = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  let result = '';
  for (let i = 0; i < stripped.length; i++) {
    const char = stripped[i];
    const code = char.charCodeAt(0);
    if ((code >= 97 && code <= 122) || (code >= 48 && code <= 57)) {
      result += char;
    } else if (code === 32 || code === 45 || code === 95) {
      result += '_';
    }
  }
  
  const normalized = result
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
    
  return normalized || base.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export function getLabelInfo(rawLabel?: string): LabelInfo | undefined {
  const key = normalizeAiLabel(rawLabel);
  if (!key) return undefined;
  return LABEL_DICTIONARY[key];
}

const dedupeProducts = (items: Product[]) => {
  const seen = new Set<string>();
  return items.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
};

export function pickProductsForLabel(
  label: string, 
  catalog: Product[], 
  limit = 6,
  fallbackCategory?: string,
  fallbackSubcategory?: string
): Product[] {
  if (!label || !catalog || catalog.length === 0) {
    return catalog.slice(0, Math.max(limit, 1));
  }

  const normalizedLabel = normalizeAiLabel(label);
  const info = getLabelInfo(normalizedLabel);
  const normalizedLimit = Math.max(limit, 1);
  
  if (!info) {
    console.warn(`No label info found for: "${label}" (normalized: "${normalizedLabel}")`);
    
    if (fallbackCategory || fallbackSubcategory) {
      const category = (fallbackCategory || '').toLowerCase().trim();
      const subcategory = (fallbackSubcategory || '').toLowerCase().trim();
      
      let fallbackProducts: Product[] = [];
      
      if (subcategory) {
        fallbackProducts = catalog.filter((product) => {
          const productSubcategory = (product.subcategory || '').toLowerCase().trim();
          const productCategory = product.category?.toLowerCase().trim();
          return (
            productSubcategory === subcategory &&
            (!category || productCategory === category)
          );
        });
      }
      
      if (fallbackProducts.length === 0 && category) {
        fallbackProducts = catalog.filter((product) => 
          product.category?.toLowerCase().trim() === category
        );
      }
      
      if (fallbackProducts.length > 0) {
        console.log(`[pickProductsForLabel] Using fallback category/subcategory:`, {
          category,
          subcategory,
          found: fallbackProducts.length
        });
        return fallbackProducts.slice(0, normalizedLimit);
      }
    }
    
    return catalog.slice(0, normalizedLimit);
  }

  let normalizedSubcategory = (info.subcategory || '').toLowerCase().trim();
  const normalizedCategory = info.category?.toLowerCase().trim();

  const subcategoryAliases: Record<string, string[]> = {
    'đầm': ['đầm', 'váy'],
    'váy': ['váy', 'đầm']
  };

  const subcategoryVariants = subcategoryAliases[normalizedSubcategory] || [normalizedSubcategory];

  console.log(`[pickProductsForLabel] Searching for:`, {
    label,
    normalizedLabel,
    category: normalizedCategory,
    subcategory: normalizedSubcategory,
    subcategoryVariants,
    keywords: info.keywords,
    catalogSize: catalog.length
  });

  const exactSubcategoryMatches = catalog.filter((product) => {
    const productSubcategory = (product.subcategory || '').toLowerCase().trim();
    const productCategory = product.category?.toLowerCase().trim();
    const matches = subcategoryVariants.includes(productSubcategory) &&
      (!normalizedCategory || productCategory === normalizedCategory);
    return matches;
  });

  console.log(`[pickProductsForLabel] Exact subcategory matches: ${exactSubcategoryMatches.length}`);

  const partialSubcategoryMatches = catalog.filter((product) => {
    if (exactSubcategoryMatches.some(p => p.id === product.id)) return false;
    const productSubcategory = (product.subcategory || '').toLowerCase().trim();
    const productCategory = product.category?.toLowerCase().trim();
    const matchesSubcategory = subcategoryVariants.some(variant => 
      productSubcategory.includes(variant) || variant.includes(productSubcategory)
    );
    return (
      matchesSubcategory &&
      (!normalizedCategory || productCategory === normalizedCategory)
    );
  });

  const keywordMatches = info.keywords && info.keywords.length > 0
    ? catalog.filter((product) => {
        if (exactSubcategoryMatches.some(p => p.id === product.id) ||
            partialSubcategoryMatches.some(p => p.id === product.id)) {
          return false;
        }
        const searchText = `${product.name} ${product.subcategory || ''} ${product.description || ''} ${(product.features || []).join(' ')}`.toLowerCase();
        return info.keywords!.some((keyword) => {
          const normalizedKeyword = keyword.toLowerCase().trim();
          return searchText.includes(normalizedKeyword) || 
                 product.name.toLowerCase().includes(normalizedKeyword) ||
                 (product.subcategory || '').toLowerCase().includes(normalizedKeyword);
        });
      })
    : [];

  const categoryMatches = normalizedCategory
    ? catalog.filter((product) => {
        if (exactSubcategoryMatches.some(p => p.id === product.id) ||
            partialSubcategoryMatches.some(p => p.id === product.id) ||
            keywordMatches.some(p => p.id === product.id)) {
          return false;
        }
        return product.category?.toLowerCase().trim() === normalizedCategory;
      })
    : [];

  const demoProductMatches = (info.demoProductIds || [])
    .map((id) => catalog.find((product) => product.id === id))
    .filter((value): value is Product => {
      if (!value) return false;
      return !exactSubcategoryMatches.some(p => p.id === value.id) &&
             !partialSubcategoryMatches.some(p => p.id === value.id) &&
             !keywordMatches.some(p => p.id === value.id) &&
             !categoryMatches.some(p => p.id === value.id);
    });

  const merged = dedupeProducts([
    ...exactSubcategoryMatches,
    ...partialSubcategoryMatches,
    ...keywordMatches,
    ...categoryMatches,
    ...demoProductMatches
  ]);

  console.log(`[pickProductsForLabel] Total matches: ${merged.length}`, {
    exact: exactSubcategoryMatches.length,
    partial: partialSubcategoryMatches.length,
    keywords: keywordMatches.length,
    category: categoryMatches.length,
    demo: demoProductMatches.length
  });

  if (merged.length >= normalizedLimit) {
    const result = merged.slice(0, normalizedLimit);
    console.log(`[pickProductsForLabel] Returning ${result.length} products:`, 
      result.map(p => ({ id: p.id, name: p.name, category: p.category, subcategory: p.subcategory }))
    );
    return result;
  }

  const categoryFallback = normalizedCategory
    ? catalog.filter((product) => {
        if (merged.some((item) => item.id === product.id)) return false;
        return product.category?.toLowerCase().trim() === normalizedCategory;
      })
    : [];

  const additional = categoryFallback.length > 0
    ? categoryFallback
    : catalog.filter((product) => !merged.some((item) => item.id === product.id));

  const final = [...merged, ...additional].slice(0, normalizedLimit);
  
  console.log(`[pickProductsForLabel] Final result (with fallback): ${final.length} products`, {
    merged: merged.length,
    categoryFallback: categoryFallback.length,
    additional: additional.length
  });
  return final;
}

