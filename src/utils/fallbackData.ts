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
  },
  {
    id: 'indo-bhutan-cafe',
    name: 'Indo-Bhutan Cafe',
    description: 'Taste the tastiest: authentic Indo-Bhutanese special bites, fiery dragon chillies, custom wraps, local pizzas, and local street quick eats.',
    img: '/assets/indo_bhutan_cafe.png',
    rating: 4.9,
    delivery_time: '15-25 mins',
    distance: '1.2 km',
    category: 'asian',
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
  },
  {
    id: 'ib-chicken-chilli',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Chicken Chilli',
    desc_text: 'Tender chicken pieces stir-fried with onions, capsicum & chilli sauce.',
    price: 3.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-chicken-nuggets',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Chicken Nuggets',
    desc_text: 'Juicy chicken pieces coated in a crunchy golden batter, perfect for snacking.',
    price: 4.40,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-chicken-dry-fry',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Chicken Dry Fry',
    desc_text: 'Juicy chicken chunks wok-tossed with local spices and herbs, served dry.',
    price: 4.40,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-dragon-chicken-bone',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Dragon Chicken Chilli (Bone)',
    desc_text: 'Indo-Bhutan Special: Crispy chicken pieces tossed with bell peppers, onions, and bold Indo-Bhutan chilli sauce.',
    price: 4.60,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-dragon-chicken-boneless',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Dragon Chicken Chilli (Boneless)',
    desc_text: 'Indo-Bhutan Special: Boneless crunchy chicken chunks tossed with bell peppers, onions, and bold Indo-Bhutan chilli sauce.',
    price: 4.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-creamy-garlic-chicken',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Creamy Garlic Chicken',
    desc_text: 'Indo-Bhutan Signature: Juicy chicken chunks simmered in a rich, creamy garlic sauce.',
    price: 5.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-egg-wrap',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Egg Wrap',
    desc_text: 'Warm wrap stuffed with fluffy egg omelette, fresh veggies, and flavorful sauces.',
    price: 2.60,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-chicken-wrap',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Chicken Wrap',
    desc_text: 'Warm wrap stuffed with juicy chicken pieces, fresh veggies, and flavorful sauces.',
    price: 3.40,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-paneer-wrap',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Paneer Wrap',
    desc_text: 'Warm wrap stuffed with soft paneer cubes, fresh veggies, and flavorful sauces.',
    price: 3.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-current-noodle',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Current (IB Style)',
    desc_text: 'Current noodles cooked in a velvety creamy sauce with a generous touch of cheese.',
    price: 2.60,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-pizza-veg-reg',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Mix Veg Pizza (Regular)',
    desc_text: 'Freshly baked pizza topped with onions, capsicum, rich tomato sauce, and melted cheese.',
    price: 4.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'pizza'
  },
  {
    id: 'ib-pizza-veg-large',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Mix Veg Pizza (Large)',
    desc_text: 'Freshly baked pizza topped with onions, capsicum, rich tomato sauce, and melted cheese.',
    price: 5.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'pizza'
  },
  {
    id: 'ib-pizza-chicken-reg',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Chicken Chilli Pizza (Regular)',
    desc_text: 'Freshly baked pizza topped with spicy chicken, onions, capsicum, and melted cheese.',
    price: 5.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'pizza'
  },
  {
    id: 'ib-pizza-chicken-large',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Chicken Chilli Pizza (Large)',
    desc_text: 'Freshly baked pizza topped with spicy chicken, onions, capsicum, and melted cheese.',
    price: 6.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'pizza'
  },
  {
    id: 'ib-pizza-paneer-reg',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Paneer Chilli Pizza (Regular)',
    desc_text: 'Freshly baked pizza topped with spicy paneer, onions, capsicum, tomato sauce, and melted cheese.',
    price: 6.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'pizza'
  },
  {
    id: 'ib-pizza-paneer-large',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Paneer Chilli Pizza (Large)',
    desc_text: 'Freshly baked pizza topped with spicy paneer, onions, capsicum, tomato sauce, and melted cheese.',
    price: 7.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'pizza'
  },
  {
    id: 'ib-pizza-cheese-reg',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Cheese Overload Pizza (Regular)',
    desc_text: 'Pizza loaded with extra premium cheese blends.',
    price: 7.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'pizza'
  },
  {
    id: 'ib-pizza-cheese-large',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Cheese Overload Pizza (Large)',
    desc_text: 'Pizza loaded with extra premium cheese blends.',
    price: 8.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'pizza'
  },
  {
    id: 'ib-burger-veg',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Veg Burger',
    desc_text: 'Crispy vegetable patty burger with fresh lettuce, tomatoes, and mayonnaise.',
    price: 2.10,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'burgers'
  },
  {
    id: 'ib-burger-chicken',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Chicken Burger',
    desc_text: 'Juicy chicken patty burger with cheese, fresh lettuce, and burger sauce.',
    price: 2.70,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'burgers'
  },
  {
    id: 'ib-sandwich-veg',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Veg Sandwich',
    desc_text: 'Fresh garden vegetable sandwich with butter and green chutney spreads.',
    price: 2.10,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'bakery'
  },
  {
    id: 'ib-sandwich-chicken',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Chicken Sandwich',
    desc_text: 'Grilled chicken sandwich with shredded chicken, mayo, and herbs.',
    price: 2.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'bakery'
  },
  {
    id: 'ib-sandwich-cheese',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Cheese Sandwich',
    desc_text: 'Classic grilled sandwich oozing with melted cheese.',
    price: 2.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'bakery'
  },
  {
    id: 'ib-waiwai-chat',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Wai-Wai Chat',
    desc_text: 'Tangy and crunchy instant noodle chat mixed with onions, tomatoes, and spices.',
    price: 1.60,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-french-fries',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'French Fries',
    desc_text: 'Crispy golden potato french fries salted to perfection.',
    price: 2.40,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-corn-dog',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Corn Dog',
    desc_text: 'Crispy batter-fried corn dog served with mustard and ketchup.',
    price: 3.40,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-chilli-potato',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Chilli Potato',
    desc_text: 'Indo-Bhutan Special: Golden, crispy potatoes stir-fried with onions, capsicum, and bold chilli sauce.',
    price: 3.10,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-dynamite-potato',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Dynamite Potato',
    desc_text: 'Golden, crispy potatoes coated in bold, spicy Indo-Bhutan dynamite sauce.',
    price: 3.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-potato-stick',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Potato Stick',
    desc_text: 'Fresh potatoes, julienned and fried until golden and crunchy.',
    price: 4.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-cheesy-potato-stick',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Cheesy Potato Stick',
    desc_text: 'Golden, crispy potato sticks coated in smooth, gooey cheese.',
    price: 5.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-aloo-paratha',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Aloo Paratha',
    desc_text: 'Traditional spiced potato-stuffed flatbread served with butter.',
    price: 1.40,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'indian'
  },
  {
    id: 'ib-cheese-paratha',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Cheese Paratha',
    desc_text: 'Delicious flatbread stuffed with spiced melted cheese.',
    price: 2.40,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'indian'
  },
  {
    id: 'ib-paneer-pakoda',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Paneer Pakoda',
    desc_text: 'Crispy batter-fried paneer fritters, perfect with mint chutney.',
    price: 3.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'indian'
  },
  {
    id: 'ib-paneer-chilli',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Paneer Chilli',
    desc_text: 'Spicy paneer cubes stir-fried with onions, bell peppers, and chilli sauce.',
    price: 4.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'indian'
  },
  {
    id: 'ib-cheese-pakoda',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Cheese Pakoda',
    desc_text: 'Crispy fried cheese pakodas, golden on the outside, gooey inside.',
    price: 4.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'indian'
  },
  {
    id: 'ib-tacos-veg',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Veg Tacos',
    desc_text: 'Mexican-style tacos stuffed with spiced beans, fresh veggies, and salsa.',
    price: 2.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-tacos-chicken',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Chicken Tacos',
    desc_text: 'Spiced chicken tacos with onions, cilantro, and creamy sauce.',
    price: 3.40,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
  },
  {
    id: 'ib-tacos-paneer',
    restaurant_id: 'indo-bhutan-cafe',
    name: 'Paneer Tacos',
    desc_text: 'Fusion paneer tacos topped with shredded cheese and avocado crema.',
    price: 3.90,
    img: '/assets/indo_bhutan_cafe.png',
    category: 'asian'
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
('zepto-grocery', 'InstaMart Quick Groceries', 'Farm fresh farm milk, organic eggs, avocados, vegetables, and household daily items.', '/assets/food_banner.png', 4.9, '10-15 mins', '0.8 km', 'groceries', true),
('indo-bhutan-cafe', 'Indo-Bhutan Cafe', 'Taste the tastiest: authentic Indo-Bhutanese special bites, fiery dragon chillies, custom wraps, local pizzas, and local street quick eats.', '/assets/indo_bhutan_cafe.png', 4.9, '15-25 mins', '1.2 km', 'asian', true);

insert into public.catalog (id, restaurant_id, name, desc_text, price, img, category) values
('butter-masala', 'tadka-house', 'Chicken Butter Masala', 'Creamy spiced tomato butter gravy, loaded with tender cooked chicken chunks (Serves 2-3).', 17.40, '/assets/butter_masala.png', 'indian'),
('fish-curry', 'tadka-house', 'Indian Style Tadka Fish Curry', 'Fresh cod fish chunks simmered in a mustard-based gravy with curry leaves (Serves 1-2).', 15.80, '/assets/fish_curry.png', 'indian'),
('classic-burger', 'el-corral', 'Double Cheese Bacon Burger', 'Double beef patties, applewood bacon, double layers of cheddar, lettuce, onions, and garlic aioli.', 12.50, '/assets/butter_masala.png', 'burgers'),
('margherita-pizza', 'pizza-palazzo', 'Classic Margherita Pizza', 'San Marzano tomatoes, premium fresh mozzarella pearls, fresh basil leaves, and olive oil drizzle.', 14.20, '/assets/pasta_dish.png', 'pizza'),
('pasta-carbonara', 'pizza-palazzo', 'Spaghetti Carbonara', 'Fresh spaghetti tossed in egg yolks, grated Pecorino Romano cheese, cured guanciale pork cheek, and black pepper.', 15.00, '/assets/pasta_dish.png', 'pizza'),
('fresh-milk', 'zepto-grocery', 'Organic Whole Milk 1L', 'Farm-fresh pasteurized milk, rich in nutrients, cream-top organic quality.', 2.80, '/assets/food_banner.png', 'groceries'),
('sliced-bread', 'zepto-grocery', 'Whole Wheat Sliced Bread', 'Freshly baked multigrain wheat sandwich bread loaf (450g pack).', 1.90, '/assets/food_banner.png', 'groceries'),
('ib-chicken-chilli', 'indo-bhutan-cafe', 'Chicken Chilli', 'Tender chicken pieces stir-fried with onions, capsicum & chilli sauce.', 3.90, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-chicken-nuggets', 'indo-bhutan-cafe', 'Chicken Nuggets', 'Juicy chicken pieces coated in a crunchy golden batter, perfect for snacking.', 4.40, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-chicken-dry-fry', 'indo-bhutan-cafe', 'Chicken Dry Fry', 'Juicy chicken chunks wok-tossed with local spices and herbs, served dry.', 4.40, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-dragon-chicken-bone', 'indo-bhutan-cafe', 'Dragon Chicken Chilli (Bone)', 'Indo-Bhutan Special: Crispy chicken pieces tossed with bell peppers, onions, and bold Indo-Bhutan chilli sauce.', 4.60, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-dragon-chicken-boneless', 'indo-bhutan-cafe', 'Dragon Chicken Chilli (Boneless)', 'Indo-Bhutan Special: Boneless crunchy chicken chunks tossed with bell peppers, onions, and bold Indo-Bhutan chilli sauce.', 4.90, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-creamy-garlic-chicken', 'indo-bhutan-cafe', 'Creamy Garlic Chicken', 'Indo-Bhutan Signature: Juicy chicken chunks simmered in a rich, creamy garlic sauce.', 5.90, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-egg-wrap', 'indo-bhutan-cafe', 'Egg Wrap', 'Warm wrap stuffed with fluffy egg omelette, fresh veggies, and flavorful sauces.', 2.60, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-chicken-wrap', 'indo-bhutan-cafe', 'Chicken Wrap', 'Warm wrap stuffed with juicy chicken pieces, fresh veggies, and flavorful sauces.', 3.40, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-paneer-wrap', 'indo-bhutan-cafe', 'Paneer Wrap', 'Warm wrap stuffed with soft paneer cubes, fresh veggies, and flavorful sauces.', 3.90, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-current-noodle', 'indo-bhutan-cafe', 'Current (IB Style)', 'Current noodles cooked in a velvety creamy sauce with a generous touch of cheese.', 2.60, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-pizza-veg-reg', 'indo-bhutan-cafe', 'Mix Veg Pizza (Regular)', 'Freshly baked pizza topped with onions, capsicum, rich tomato sauce, and melted cheese.', 4.90, '/assets/indo_bhutan_cafe.png', 'pizza'),
('ib-pizza-veg-large', 'indo-bhutan-cafe', 'Mix Veg Pizza (Large)', 'Freshly baked pizza topped with onions, capsicum, rich tomato sauce, and melted cheese.', 5.90, '/assets/indo_bhutan_cafe.png', 'pizza'),
('ib-pizza-chicken-reg', 'indo-bhutan-cafe', 'Chicken Chilli Pizza (Regular)', 'Freshly baked pizza topped with spicy chicken, onions, capsicum, and melted cheese.', 5.90, '/assets/indo_bhutan_cafe.png', 'pizza'),
('ib-pizza-chicken-large', 'indo-bhutan-cafe', 'Chicken Chilli Pizza (Large)', 'Freshly baked pizza topped with spicy chicken, onions, capsicum, and melted cheese.', 6.90, '/assets/indo_bhutan_cafe.png', 'pizza'),
('ib-pizza-paneer-reg', 'indo-bhutan-cafe', 'Paneer Chilli Pizza (Regular)', 'Freshly baked pizza topped with spicy paneer, onions, capsicum, tomato sauce, and melted cheese.', 6.90, '/assets/indo_bhutan_cafe.png', 'pizza'),
('ib-pizza-paneer-large', 'indo-bhutan-cafe', 'Paneer Chilli Pizza (Large)', 'Freshly baked pizza topped with spicy paneer, onions, capsicum, tomato sauce, and melted cheese.', 7.90, '/assets/indo_bhutan_cafe.png', 'pizza'),
('ib-pizza-cheese-reg', 'indo-bhutan-cafe', 'Cheese Overload Pizza (Regular)', 'Pizza loaded with extra premium cheese blends.', 7.90, '/assets/indo_bhutan_cafe.png', 'pizza'),
('ib-pizza-cheese-large', 'indo-bhutan-cafe', 'Cheese Overload Pizza (Large)', 'Pizza loaded with extra premium cheese blends.', 8.90, '/assets/indo_bhutan_cafe.png', 'pizza'),
('ib-burger-veg', 'indo-bhutan-cafe', 'Veg Burger', 'Crispy vegetable patty burger with fresh lettuce, tomatoes, and mayonnaise.', 2.10, '/assets/indo_bhutan_cafe.png', 'burgers'),
('ib-burger-chicken', 'indo-bhutan-cafe', 'Chicken Burger', 'Juicy chicken patty burger with cheese, fresh lettuce, and burger sauce.', 2.70, '/assets/indo_bhutan_cafe.png', 'burgers'),
('ib-sandwich-veg', 'indo-bhutan-cafe', 'Veg Sandwich', 'Fresh garden vegetable sandwich with butter and green chutney spreads.', 2.10, '/assets/indo_bhutan_cafe.png', 'bakery'),
('ib-sandwich-chicken', 'indo-bhutan-cafe', 'Chicken Sandwich', 'Grilled chicken sandwich with shredded chicken, mayo, and herbs.', 2.90, '/assets/indo_bhutan_cafe.png', 'bakery'),
('ib-sandwich-cheese', 'indo-bhutan-cafe', 'Cheese Sandwich', 'Classic grilled sandwich oozing with melted cheese.', 2.90, '/assets/indo_bhutan_cafe.png', 'bakery'),
('ib-waiwai-chat', 'indo-bhutan-cafe', 'Wai-Wai Chat', 'Tangy and crunchy instant noodle chat mixed with onions, tomatoes, and spices.', 1.60, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-french-fries', 'indo-bhutan-cafe', 'French Fries', 'Crispy golden potato french fries salted to perfection.', 2.40, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-corn-dog', 'indo-bhutan-cafe', 'Corn Dog', 'Crispy batter-fried corn dog served with mustard and ketchup.', 3.40, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-chilli-potato', 'indo-bhutan-cafe', 'Chilli Potato', 'Indo-Bhutan Special: Golden, crispy potatoes stir-fried with onions, capsicum, and bold chilli sauce.', 3.10, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-dynamite-potato', 'indo-bhutan-cafe', 'Dynamite Potato', 'Golden, crispy potatoes coated in bold, spicy Indo-Bhutan dynamite sauce.', 3.90, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-potato-stick', 'indo-bhutan-cafe', 'Potato Stick', 'Fresh potatoes, julienned and fried until golden and crunchy.', 4.90, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-cheesy-potato-stick', 'indo-bhutan-cafe', 'Cheesy Potato Stick', 'Golden, crispy potato sticks coated in smooth, gooey cheese.', 5.90, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-aloo-paratha', 'indo-bhutan-cafe', 'Aloo Paratha', 'Traditional spiced potato-stuffed flatbread served with butter.', 1.40, '/assets/indo_bhutan_cafe.png', 'indian'),
('ib-cheese-paratha', 'indo-bhutan-cafe', 'Cheese Paratha', 'Delicious flatbread stuffed with spiced melted cheese.', 2.40, '/assets/indo_bhutan_cafe.png', 'indian'),
('ib-paneer-pakoda', 'indo-bhutan-cafe', 'Paneer Pakoda', 'Crispy batter-fried paneer fritters, perfect with mint chutney.', 3.90, '/assets/indo_bhutan_cafe.png', 'indian'),
('ib-paneer-chilli', 'indo-bhutan-cafe', 'Paneer Chilli', 'Spicy paneer cubes stir-fried with onions, bell peppers, and chilli sauce.', 4.90, '/assets/indo_bhutan_cafe.png', 'indian'),
('ib-cheese-pakoda', 'indo-bhutan-cafe', 'Cheese Pakoda', 'Crispy fried cheese pakodas, golden on the outside, gooey inside.', 4.90, '/assets/indo_bhutan_cafe.png', 'indian'),
('ib-tacos-veg', 'indo-bhutan-cafe', 'Veg Tacos', 'Mexican-style tacos stuffed with spiced beans, fresh veggies, and salsa.', 2.90, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-tacos-chicken', 'indo-bhutan-cafe', 'Chicken Tacos', 'Spiced chicken tacos with onions, cilantro, and creamy sauce.', 3.40, '/assets/indo_bhutan_cafe.png', 'asian'),
('ib-tacos-paneer', 'indo-bhutan-cafe', 'Paneer Tacos', 'Fusion paneer tacos topped with shredded cheese and avocado crema.', 3.90, '/assets/indo_bhutan_cafe.png', 'asian');
`;
};
