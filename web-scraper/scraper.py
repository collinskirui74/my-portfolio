import requests
from bs4 import BeautifulSoup
import csv
import time

# ── Configuration ─────────────────────────────────────────────────────────────
BASE_URL = "https://books.toscrape.com"
OUTPUT_FILE = "books_data.csv"

# ── Helper: Get page soup ──────────────────────────────────────────────────────
def get_soup(url):
    headers = {"User-Agent": "Mozilla/5.0 (educational scraper)"}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")
    except requests.RequestException as e:
        print(f"  [ERROR] Failed to fetch {url}: {e}")
        return None

# ── Scrape single book detail page ────────────────────────────────────────────
def scrape_book_detail(book_url):
    soup = get_soup(book_url)
    if not soup:
        return {}

    # Extract product table data
    table = {}
    rows = soup.select("table.table tr")
    for row in rows:
        key = row.select_one("th").get_text(strip=True)
        val = row.select_one("td").get_text(strip=True)
        table[key] = val

    # Extract description
    desc_tag = soup.select_one("#product_description ~ p")
    description = desc_tag.get_text(strip=True) if desc_tag else "No description"

    return {
        "upc":          table.get("UPC", ""),
        "availability": table.get("Availability", ""),
        "num_reviews":  table.get("Number of reviews", ""),
        "description":  description[:200],  # truncate for CSV clarity
    }

# ── Scrape listing page ────────────────────────────────────────────────────────
def scrape_page(url):
    soup = get_soup(url)
    if not soup:
        return [], None

    books = []
    articles = soup.select("article.product_pod")

    for article in articles:
        # Title
        title = article.select_one("h3 a")["title"]

        # Price
        price = article.select_one(".price_color").get_text(strip=True)
        price_clean = price.replace("Â", "").replace("£", "").strip()

        # Rating — stored as a word class (One, Two, Three, Four, Five)
        rating_class = article.select_one(".star-rating")["class"][1]
        rating_map = {"One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5}
        rating = rating_map.get(rating_class, 0)

        # Availability
        availability = article.select_one(".availability").get_text(strip=True)

        # Book detail URL
        relative_url = article.select_one("h3 a")["href"]
        if relative_url.startswith("catalogue/"):
            book_url = f"{BASE_URL}/{relative_url}"
        else:
            book_url = f"{BASE_URL}/catalogue/{relative_url.lstrip('../')}"

        books.append({
            "title":        title,
            "price_gbp":    price_clean,
            "rating":       rating,
            "availability": availability,
            "url":          book_url,
        })

    # Find next page link
    next_btn = soup.select_one("li.next a")
    if next_btn:
        next_href = next_btn["href"]
        if "catalogue/" in url:
            base = url.rsplit("/", 1)[0]
            next_url = f"{base}/{next_href}"
        else:
            next_url = f"{BASE_URL}/catalogue/{next_href}"
    else:
        next_url = None

    return books, next_url

# ── Main scraper ──────────────────────────────────────────────────────────────
def main():
    print("=" * 55)
    print("  BookScraper — books.toscrape.com")
    print("=" * 55)

    all_books = []
    current_url = f"{BASE_URL}/catalogue/page-1.html"
    page_num = 1
    max_pages = 5  # scrape first 5 pages (100 books)

    while current_url and page_num <= max_pages:
        print(f"\n[Page {page_num}] Fetching: {current_url}")
        books, next_url = scrape_page(current_url)
        print(f"  Found {len(books)} books")
        all_books.extend(books)
        current_url = next_url
        page_num += 1
        time.sleep(0.5)  # polite delay

    print(f"\n[Done] Scraped {len(all_books)} books total")

    # ── Export to CSV ─────────────────────────────────────────────────────────
    if all_books:
        fieldnames = ["title", "price_gbp", "rating", "availability", "url"]
        with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_books)
        print(f"[Saved] Data written to '{OUTPUT_FILE}'")

        # ── Quick stats ───────────────────────────────────────────────────────
        prices = [float(b["price_gbp"]) for b in all_books if b["price_gbp"]]
        ratings = [b["rating"] for b in all_books]
        print(f"\n── Quick Stats ──────────────────────────────────")
        print(f"  Total books scraped : {len(all_books)}")
        print(f"  Average price       : £{sum(prices)/len(prices):.2f}")
        print(f"  Cheapest book       : £{min(prices):.2f}")
        print(f"  Most expensive      : £{max(prices):.2f}")
        print(f"  Average rating      : {sum(ratings)/len(ratings):.1f}/5")
        print(f"  5-star books        : {ratings.count(5)}")
        print(f"─────────────────────────────────────────────────")

if __name__ == "__main__":
    main()