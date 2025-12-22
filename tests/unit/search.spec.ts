import { filterProducts } from '../../src/utils/searchResults';
import type { Product } from '../../src/data/products';

const sampleProducts: Product[] = [
  {
    id: 'a',
    name: 'Alpha Shirt',
    price: 80,
    category: 'men',
    subcategory: 'shirt',
    images: [],
    colors: [],
    sizes: [],
    description: 'Best seller',
    features: ['breathable'],
    isNew: true,
    isSale: false,
    rating: 4,
    reviewCount: 10
  },
  {
    id: 'b',
    name: 'Beta Pants',
    price: 120,
    category: 'women',
    subcategory: 'pants',
    images: [],
    colors: [],
    sizes: [],
    description: 'Comfort fit',
    features: ['stretchy'],
    isNew: false,
    isSale: false,
    rating: 3,
    reviewCount: 5
  },
  {
    id: 'c',
    name: 'Gamma T-Shirt',
    price: 60,
    category: 'men',
    subcategory: 't-shirt',
    images: [],
    colors: [],
    sizes: [],
    description: 'Cool look',
    features: ['soft'],
    isNew: false,
    isSale: true,
    rating: 5,
    reviewCount: 8
  }
];

describe('filterProducts', () => {
  it('finds matching products when query matches names or features', () => {
    const results = filterProducts({
      products: sampleProducts,
      query: 'alpha',
      selectedCategory: 'all',
      priceRange: [0, 1000],
      sortBy: 'default'
    });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('a');
  });

  it('filters results by selected category', () => {
    const results = filterProducts({
      products: sampleProducts,
      query: '',
      selectedCategory: 'women',
      priceRange: [0, 1000],
      sortBy: 'default'
    });

    expect(results).toHaveLength(1);
    expect(results[0].category).toBe('women');
  });

  it('filters results by price range', () => {
    const results = filterProducts({
      products: sampleProducts,
      query: '',
      selectedCategory: 'all',
      priceRange: [70, 100],
      sortBy: 'default'
    });

    expect(results.every((product) => product.price >= 70 && product.price <= 100)).toBe(true);
  });

  it('sorts by price descending when price-high is specified', () => {
    const results = filterProducts({
      products: sampleProducts,
      query: '',
      selectedCategory: 'all',
      priceRange: [0, 1000],
      sortBy: 'price-high'
    });

    expect(results[0].price).toBeGreaterThanOrEqual(results[1].price);
  });
});
