export interface Restaurant {
  id: string;
  name: string;
  description: string;
  img: string;
  rating: number;
  delivery_time: string;
  distance: string;
  category: string;
  featured: boolean;
}

export interface CatalogItem {
  id: string;
  restaurant_id: string;
  name: string;
  desc_text: string;
  price: number;
  img: string;
  category: string;
}

export const defaultCategories = [
  { id: 'burgers', name: 'Burgers', img: '/assets/categories/burger_cat.png' },
  { id: 'pizza', name: 'Pizza', img: '/assets/categories/pizza_cat.png' },
  { id: 'indian', name: 'Indian', img: '/assets/categories/indian_cat.png' },
  { id: 'asian', name: 'Asian', img: '/assets/categories/asian_cat.png' },
  { id: 'bakery', name: 'Bakery', img: '/assets/categories/bakery_cat.png' },
  { id: 'groceries', name: 'Groceries', img: '/assets/categories/grocery_cat.png' },
  { id: 'salad', name: 'Salads', img: '/assets/categories/salad_cat.png' },
  { id: 'drinks', name: 'Drinks', img: '/assets/categories/drinks_cat.png' }
];

export const defaultRestaurants: Restaurant[] = [
  {
    id: 'el-corral',
    name: 'El Corral Gourmet Burger',
    description: 'Fresh grilled double-patties, melted cheddar cheese, applewood bacon, and signature brioche buns.',
    img: '/assets/butter_masala.png',
    rating: 4.8,
    delivery_time: '20-30 mins',
    distance: '1.8 km',
    category: 'burgers',
    featured: true
  },
  {
    id: 'pizza-palazzo',
    name: 'Pizza Palazzo & Pasta',
    description: 'Neapolitan fire-baked wood pizzas, fresh basil, and carbonara spaghettis.',
    img: '/assets/pasta_dish.png',
    rating: 4.6,
    delivery_time: '25-35 mins',
    distance: '2.4 km',
    category: 'pizza',
    featured: true
  },
  {
    id: 'tadka-house',
    name: 'The Tadka House Curries',
    description: 'Tender tandoori chicken, hot paneer butter masala, naan breads, and fresh fish curries.',
    img: '/assets/fish_curry.png',
    rating: 4.7,
    delivery_time: '30-40 mins',
    distance: '3.1 km',
    category: 'indian',
    featured: false
  },
  {
    id: 'zepto-grocery',
    name: 'InstaMart Quick Groceries',
    description: 'Farm fresh farm milk, organic eggs, avocados, vegetables, and household daily items.',
    img: '/assets/food_banner.png',
    rating: 4.9,
    delivery_time: '10-15 mins',
    distance: '0.8 km',
    category: 'groceries',
    featured: true
  }
];

export const defaultCatalog: CatalogItem[] = [
  {
    id: 'butter-masala',
    restaurant_id: 'tadka-house',
    name: 'Chicken Butter Masala',
    desc_text: 'Creamy spiced tomato butter gravy, loaded with tender cooked chicken chunks (Serves 2-3).',
    price: 17.40,
    img: '/assets/butter_masala.png',
    category: 'indian'
  },
  {
    id: 'fish-curry',
    restaurant_id: 'tadka-house',
    name: 'Indian Style Tadka Fish Curry',
    desc_text: 'Fresh cod fish chunks simmered in a mustard-based gravy with curry leaves (Serves 1-2).',
    price: 15.80,
    img: '/assets/fish_curry.png',
    category: 'indian'
  },
  {
    id: 'classic-burger',
    restaurant_id: 'el-corral',
    name: 'Double Cheese Bacon Burger',
    desc_text: 'Double beef patties, applewood bacon, double layers of cheddar, lettuce, onions, and garlic aioli.',
    price: 12.50,
    img: '/assets/butter_masala.png',
    category: 'burgers'
  },
  {
    id: 'margherita-pizza',
    restaurant_id: 'pizza-palazzo',
    name: 'Classic Margherita Pizza',
    desc_text: 'San Marzano tomatoes, premium fresh mozzarella pearls, fresh basil leaves, and olive oil drizzle.',
    price: 14.20,
    img: '/assets/pasta_dish.png',
    category: 'pizza'
  },
  {
    id: 'pasta-carbonara',
    restaurant_id: 'pizza-palazzo',
    name: 'Spaghetti Carbonara',
    desc_text: 'Fresh spaghetti tossed in egg yolks, grated Pecorino Romano cheese, cured guanciale pork cheek, and black pepper.',
    price: 15.00,
    img: '/assets/pasta_dish.png',
    category: 'pizza'
  },
  {
    id: 'fresh-milk',
    restaurant_id: 'zepto-grocery',
    name: 'Organic Whole Milk 1L',
    desc_text: 'Farm-fresh pasteurized milk, rich in nutrients, cream-top organic quality.',
    price: 2.80,
    img: '/assets/food_banner.png',
    category: 'groceries'
  },
  {
    id: 'sliced-bread',
    restaurant_id: 'zepto-grocery',
    name: 'Whole Wheat Sliced Bread',
    desc_text: 'Freshly baked multigrain wheat sandwich bread loaf (450g pack).',
    price: 1.90,
    img: '/assets/food_banner.png',
    category: 'groceries'
  }
];

export const getSupabaseFallbackString = () => {
  return `-- Copy and run this script in your Supabase SQL Editor:

create table public.restaurants (
  id text primary key,
  name text not null,
  description text,
  img text,
  rating numeric(3,2),
  delivery_time text,
  distance text,
  category text,
  featured boolean default false
);

create table public.catalog (
  id text primary key,
  restaurant_id text references public.restaurants(id) on delete cascade,
  name text not null,
  desc_text text,
  price numeric(10,2) not null,
  img text,
  category text
);

create table public.orders (
  id text primary key,
  user_id text,
  customer_name text,
  address text,
  phone text,
  subtotal numeric(10,2),
  discount numeric(10,2),
  total numeric(10,2),
  payment_method text default 'COD',
  status text default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.order_items (
  id bigint generated by default as identity primary key,
  order_id text references public.orders(id) on delete cascade,
  item_id text,
  qty integer not null,
  price numeric(10,2) not null
);

-- Seed Initial Data
insert into public.restaurants (id, name, description, img, rating, delivery_time, distance, category, featured) values
('el-corral', 'El Corral Gourmet Burger', 'Fresh grilled double-patties, melted cheddar cheese, applewood bacon, and signature brioche buns.', '/assets/butter_masala.png', 4.8, '20-30 mins', '1.8 km', 'burgers', true),
('pizza-palazzo', 'Pizza Palazzo & Pasta', 'Neapolitan fire-baked wood pizzas, fresh basil, and carbonara spaghettis.', '/assets/pasta_dish.png', 4.6, '25-35 mins', '2.4 km', 'pizza', true),
('tadka-house', 'The Tadka House Curries', 'Tender tandoori chicken, hot paneer butter masala, naan breads, and fresh fish curries.', '/assets/fish_curry.png', 4.7, '30-40 mins', '3.1 km', 'indian', false),
('zepto-grocery', 'InstaMart Quick Groceries', 'Farm fresh farm milk, organic eggs, avocados, vegetables, and household daily items.', '/assets/food_banner.png', 4.9, '10-15 mins', '0.8 km', 'groceries', true);

insert into public.catalog (id, restaurant_id, name, desc_text, price, img, category) values
('butter-masala', 'tadka-house', 'Chicken Butter Masala', 'Creamy spiced tomato butter gravy, loaded with tender cooked chicken chunks (Serves 2-3).', 17.40, '/assets/butter_masala.png', 'indian'),
('fish-curry', 'tadka-house', 'Indian Style Tadka Fish Curry', 'Fresh cod fish chunks simmered in a mustard-based gravy with curry leaves (Serves 1-2).', 15.80, '/assets/fish_curry.png', 'indian'),
('classic-burger', 'el-corral', 'Double Cheese Bacon Burger', 'Double beef patties, applewood bacon, double layers of cheddar, lettuce, onions, and garlic aioli.', 12.50, '/assets/butter_masala.png', 'burgers'),
('margherita-pizza', 'pizza-palazzo', 'Classic Margherita Pizza', 'San Marzano tomatoes, premium fresh mozzarella pearls, fresh basil leaves, and olive oil drizzle.', 14.20, '/assets/pasta_dish.png', 'pizza'),
('pasta-carbonara', 'pizza-palazzo', 'Spaghetti Carbonara', 'Fresh spaghetti tossed in egg yolks, grated Pecorino Romano cheese, cured guanciale pork cheek, and black pepper.', 15.00, '/assets/pasta_dish.png', 'pizza'),
('fresh-milk', 'zepto-grocery', 'Organic Whole Milk 1L', 'Farm-fresh pasteurized milk, rich in nutrients, cream-top organic quality.', 2.80, '/assets/food_banner.png', 'groceries'),
('sliced-bread', 'zepto-grocery', 'Whole Wheat Sliced Bread', 'Freshly baked multigrain wheat sandwich bread loaf (450g pack).', 1.90, '/assets/food_banner.png', 'groceries');
`;
};
