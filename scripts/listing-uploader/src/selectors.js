/**
 * CSS selektori za kupujem-prodajem.com
 * 
 * VAŽNO: Ako sajt promeni HTML strukturu, ažurirati ove selektore!
 * Možeš koristiti DevTools (F12) da pronađeš nove selektore.
 */

export const selectors = {
  // Login forma
  login: {
    emailInput: 'input[name="email"]',
    passwordInput: 'input[name="password"]',
    submitButton: 'button[type="submit"]',
  },

  // Forma za dodavanje oglasa
  listing: {
    titleInput: 'input[name="title"]',
    contentTextarea: 'textarea[name="content"]',
    priceInput: 'input[name="price"]',
    categorySelect: 'select[name="category_id"]',
    groupSelect: 'select[name="group_id"]',
    conditionSelect: 'select[name="condition"]',
    fileInput: 'input[type="file"]',
    nextButton: 'button:has-text("Dalje")',
    submitButton: 'button:has-text("Postavi oglas")',
  },

  // Navigacija
  navigation: {
    myListings: 'a[href*="/user/ads"]',
    addNewListing: 'a[href*="/user/ads/add"]',
  },
};

/**
 * Stringovi koji se koriste na sajtu
 * (Koristi se za pronalaženje dugmadi i tekstova)
 */
export const strings = {
  nextButton: 'Dalje',
  submitButton: 'Postavi oglas',
  submitListing: 'Postavite oglas',
  cancel: 'Otkaži',
  backButton: 'Nazad',
};

/**
 * URL-ovi stranica
 */
export const urls = {
  base: 'https://www.kupujem-prodajem.com',
  login: 'https://www.kupujem-prodajem.com/account/login',
  logout: 'https://www.kupujem-prodajem.com/account/logout',
  dashboard: 'https://www.kupujem-prodajem.com/user/dashboard',
  myListings: 'https://www.kupujem-prodajem.com/user/ads',
  addNewListing: 'https://www.kupujem-prodajem.com/user/ads/add/step1',
  category: (id) => `https://www.kupujem-prodajem.com/${id}`,
};

/**
 * Vremenske vrednosti (u ms)
 */
export const timeouts = {
  navigation: 15000,
  elementAppear: 5000,
  fileUpload: 10000,
  screenshot: 3000,
};
