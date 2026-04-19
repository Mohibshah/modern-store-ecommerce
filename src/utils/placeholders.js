const withBase = (fileName) => `${import.meta.env.BASE_URL}images/${fileName}`;

export const productImages = {
  denim: withBase('denim1.jpg'),
  dress: withBase('summer-dress2.jpg'),
  dressAlt0: withBase('summer-dress3.jpg'),
  dressAlt1: withBase('summer-dress4.jpg'),
  tee: withBase('teee.jpg'),
  jacket: withBase('jacket.jpg'),
  hoodie: withBase('hood.jpg'),
  pants: withBase('pant.jpg'),
  cap: withBase('caps.jpg'),
  hero: withBase('men.jpg'),
  men: withBase('mens.jpg'),
  women: withBase('womens.jpg'),
  accessories: withBase('accessorie.jpg'),
  arrivals: withBase('new.jpg'),
};

export const heroBackgroundImage = withBase('hero.jpg');
export const fallbackImage = withBase('tee.jpg');