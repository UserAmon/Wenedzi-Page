# 3 SDH "Wenedzi" – Oficjalna Strona Drużyny

Nowoczesna, lekka i ultra-szybka strona internetowa dla **3 Szczecińskiej Drużyny Harcerzy "Wenedzi"**, oparta na **Astro**, **Tailwind CSS**, serwerowej infrastrukturze **Cloudflare** oraz relacyjnej bazie danych SQLite (**Cloudflare D1**).

---

## 🌲 Barwy Drużyny

- **Zielony** – symbolizuje puszczaństwo, życie w leśnej głuszy i szacunek do natury.
- **Czarny** – od Zawiszy Czarnego, symbolizuje niezłomne harcerskie słowo i rycerski honor.
- **Biały** – symbolizuje dobroć, czystość myśli i intencji oraz niesienie chętnej pomocy bliźnim.

---

## 🚀 Kluczowe Funkcjonalności

1. **Hybrydowa Strona Główna (Feed Postów)**:
   - **Automatyczna integracja z Facebookiem**: pobieranie postów i zdjęć bezpośrednio z Fanpage'a drużyny (`https://www.facebook.com/wenedzi/`, Page ID: `241908756183484`) i zapis w bazie SQLite D1.
   - **Posty ekskluzywne na stronę**: możliwość publikowania przez kadrę ogłoszeń z wyróżnieniem i przypinaniem na górze.
   - Informacje o terminach zbiórek w Szczecinie.
2. **Dla Rodziców**:
   - **Nasza misja**: metoda harcerska, system zastępowy, bezpieczeństwo i nabór.
   - **Rachunek i składki**: dane do przelewu z wygodnym przyciskiem do kopiowania numeru konta i wzoru tytułu wpłaty.
   - **Zamówienia i mundury**: spis elementów umundurowania ZHR, barwy chust drużyny oraz poradnik zakupu.
   - **Kontakt do nas**: dane drużynowego, przybocznych i lokalizacja zbiórek.
3. **Dla Harcerzy**:
   - **Prawo Harcerza**: 10 punktów Prawa Harcerskiego z komentarzem oraz Rota Przyrzeczenia.
   - **Prawo Zucha**: 6 punktów Prawa Zucha i Obietnica Zucha.
   - **Śpiewnik**: piosenki ogniskowe z tekstem, chwytami gitarowymi (z możliwością ich ukrywania/pokazywania) oraz wyszukiwarką na żywo.
   - **Ekwipunek na zbiórki**: interaktywna checklista do pakowania plecaka (zapisuje stan na telefonie).
   - **Ekwipunek na biwaki**: checklista wyjazdowa na weekend w terenie.
   - **Ekwipunek na obozy**: pełna wyprawka na 2-3 tygodniowy letni obóz leśny.
4. **Galeria Zdjęć**:
   - Kafelkowa siatka z filtrami (Obozy, Biwaki, Pionierka, Z Facebooka) oraz modalem (lightboxem) powiększającym zdjęcia.
5. **Panel Administratora (`/admin`)**:
   - Zabezpieczony hasłem (domyślne hasło startowe: `wenedzi3`).
   - Formularz dodawania nowych postów i ogłoszeń.
   - Okienko do wpisania Page Access Tokena i przycisk ręcznej synchronizacji z Facebookiem.
   - Zarządzanie i usuwanie wpisów w bazie SQLite D1.

---

## 🛠️ Stos Technologiczny

- **Framework**: [Astro 7](https://astro.build/) (Server-Side Rendering + Static Pages)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Baza danych**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQLite)
- **Hosting i Serverless**: [Cloudflare Workers / Pages](https://pages.cloudflare.com/)

---

## 💻 Uruchomienie Lokalne

```bash
# 1. Klonowanie repozytorium
git clone https://github.com/UserAmon/Wenedzi-Page.git
cd Wenedzi-Page

# 2. Instalacja zależności
npm install

# 3. Uruchomienie serwera deweloperskiego
npm run dev
```

Strona będzie dostępna pod adresem: `http://localhost:4321`.

---

## ☁️ Wdrożenie na Cloudflare

### Opcja 1: Automatyczne wdrożenie przez GitHub (Cloudflare Pages)
1. W panelu [Cloudflare Dashboard](https://dash.cloudflare.com/) przejdź do **Workers & Pages** &rarr; **Create application** &rarr; **Pages** &rarr; **Connect to Git**.
2. Wybierz repozytorium `UserAmon/Wenedzi-Page`.
3. Ustawienia kompilacji:
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. W zakładce **Settings** &rarr; **Functions** &rarr; **D1 database bindings** dodaj powiązanie zmiennej:
   - Variable name: `DB`
   - D1 Database: `wenedzi-db`

### Opcja 2: Wdrożenie z linii poleceń (Wrangler)
```bash
# Zbudowanie projektu
npm run build

# Wdrożenie na serwery Cloudflare
npx wrangler deploy --config=dist/server/wrangler.json
```

---

## ⚜️ Hasło do Panelu Administratora

- Domyślne hasło do panelu `/admin`: `wenedzi3` (można je zmienić w pliku `src/pages/admin/index.astro`).

*Czuwaj!*
