import { Product } from '../data/products';

export type SortOption = 'default' | 'price-low' | 'price-high' | 'name' | 'newest';

export interface SearchParams {
  products: Product[];
  query: string;
  selectedCategory: string;
  priceRange: [number, number];
  sortBy: SortOption;
}

export const filterProducts = ({
  products,
  query,
  selectedCategory,
  priceRange,
  sortBy
}: SearchParams): Product[] => {
  const normalizedQuery = query.trim().toLowerCase();

  let results = products.filter((product) => {
    if (!normalizedQuery) return true;

    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.subcategory.toLowerCase().includes(normalizedQuery) ||
      product.features.some((feature) => feature.toLowerCase().includes(normalizedQuery))
    );
  });

  if (selectedCategory !== 'all') {
    results = results.filter((product) => product.category === selectedCategory);
  }

  results = results.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1]);

  switch (sortBy) {
    case 'price-low':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      results.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
      results.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    default:
      break;
  }

  return results;
};
