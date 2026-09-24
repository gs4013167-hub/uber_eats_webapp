export const MENUS = {
  "golden-dragon-kitchen": [
    {
      id: "cat-popular",
      title: "Most ordered",
      items: [
        {
          id: "item-1",
          name: "Kung Pao Chicken",
          desc: "Wok-tossed chicken, roasted peanuts, dried chilies, scallion in a savory-sweet Sichuan sauce.",
          priceCents: 1495,
          img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80",
          popular: true,
          optionGroups: [
            {
              id: "spice", title: "Spice level", type: "radio", required: true,
              choices: [
                { id: "mild", label: "Mild", priceCents: 0 },
                { id: "medium", label: "Medium", priceCents: 0 },
                { id: "hot", label: "Hot", priceCents: 0 },
              ],
            },
            {
              id: "addons", title: "Add extra", type: "checkbox", required: false,
              choices: [
                { id: "rice", label: "Steamed rice", priceCents: 250 },
                { id: "spring-roll", label: "Spring roll (2pc)", priceCents: 350 },
              ],
            },
          ],
        },
        {
          id: "item-2",
          name: "Beef Chow Fun",
          desc: "Wide rice noodles, tender beef, bean sprouts, scallion, smoky wok hei flavor.",
          priceCents: 1595,
          img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80",
          popular: true,
          optionGroups: [],
        },
        {
          id: "item-3",
          name: "Soup Dumplings (Xiao Long Bao)",
          desc: "8 handmade pork dumplings, steamed, served with ginger-black vinegar dip.",
          priceCents: 1195,
          img: "https://images.unsplash.com/photo-1541696490-8744a5dc0228?w=400&q=80",
          popular: true,
          optionGroups: [],
        },
      ],
    },
    {
      id: "cat-noodles",
      title: "Noodles & Soups",
      items: [
        {
          id: "item-4",
          name: "Beef Noodle Soup",
          desc: "Slow-braised beef shank, hand-pulled noodles, bok choy, five-spice broth.",
          priceCents: 1650,
          img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80",
          optionGroups: [],
        },
        {
          id: "item-5",
          name: "Wonton Noodle Soup",
          desc: "Shrimp & pork wontons, thin egg noodles, leafy greens, light broth.",
          priceCents: 1395,
          img: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400&q=80",
          optionGroups: [],
        },
      ],
    },
  ],

  "taco-libre": [
    {
      id: "cat-tacos",
      title: "Tacos",
      items: [
        {
          id: "t-1", name: "Al Pastor Tacos (3)", desc: "Marinated pork, pineapple, onion, cilantro.",
          priceCents: 1095, img: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80",
          popular: true, optionGroups: [],
        },
        {
          id: "t-2", name: "Carne Asada Burrito", desc: "Grilled steak, rice, beans, pico de gallo, guac.",
          priceCents: 1295, img: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80",
          optionGroups: [],
        },
      ],
    },
  ],

  "pasta-bella": [
    {
      id: "cat-pasta",
      title: "Pasta",
      items: [
        {
          id: "p-1", name: "Spaghetti Carbonara", desc: "Guanciale, egg, pecorino, black pepper.",
          priceCents: 1795, img: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80",
          popular: true, optionGroups: [],
        },
      ],
    },
  ],

  "sakura-sushi": [
    {
      id: "cat-rolls",
      title: "Rolls",
      items: [
        {
          id: "s-1", name: "Spicy Tuna Roll", desc: "8 pieces, spicy mayo, scallion.",
          priceCents: 1195, img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80",
          popular: true, optionGroups: [],
        },
      ],
    },
  ],

  "green-bowl": [
    {
      id: "cat-bowls",
      title: "Bowls",
      items: [
        {
          id: "g-1", name: "Harvest Grain Bowl", desc: "Quinoa, roasted vegetables, tahini dressing.",
          priceCents: 1395, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
          popular: true, optionGroups: [],
        },
      ],
    },
  ],

  "burger-barn": [
    {
      id: "cat-burgers",
      title: "Burgers",
      items: [
        {
          id: "b-1", name: "Classic Cheeseburger", desc: "Beef patty, cheddar, lettuce, tomato, special sauce.",
          priceCents: 995, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
          popular: true, optionGroups: [],
        },
      ],
    },
  ],
};
