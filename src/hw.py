import requests
import pandas as pd
from bs4 import BeautifulSoup
from datetime import datetime

BANK_URLS = {
    "Vietcombank": "https://www.vietcombank.com.vn/vi-VN/KHCN/Cong-cu-Tien-ich/Ty-gia",
    "BIDV": "PASTE_BIDV_RATE_URL_HERE",
    "VietinBank": "PASTE_VIETINBANK_RATE_URL_HERE",
    "Techcombank": "PASTE_TECHCOMBANK_RATE_URL_HERE",
    "MB Bank": "PASTE_MBB_RATE_URL_HERE",
}

TENORS = ["1M", "3M", "6M", "12M", "24M"]


def fetch_html(url):
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    response = requests.get(url, headers=headers, timeout=15)
    response.raise_for_status()
    return response.text


def extract_tables_from_page(bank, url):
    html = fetch_html(url)

    # pandas automatically detects HTML tables
    tables = pd.read_html(html)

    cleaned_tables = []
    for table in tables:
        table["Bank"] = bank
        cleaned_tables.append(table)

    return cleaned_tables


def normalize_rate_table(bank, raw_table):
    """
    You will adjust this depending on each bank's table format.
    Goal output:
    Bank | Tenor | Rate | Date
    """

    df = raw_table.copy()

    # Example placeholder logic
    # You may need to rename columns after inspecting each bank table
    df.columns = [str(c).strip() for c in df.columns]

    print(f"\nColumns for {bank}:")
    print(df.columns)

    return df


def build_tracker():
    all_raw_tables = []

    for bank, url in BANK_URLS.items():
        try:
            print(f"Fetching {bank}...")
            tables = extract_tables_from_page(bank, url)

            for table in tables:
                print(table)
                all_raw_tables.append(table)

        except Exception as e:
            print(f"Failed to fetch {bank}: {e}")

    if not all_raw_tables:
        print("No data collected.")
        return

    raw_output = pd.concat(all_raw_tables, ignore_index=True)

    output_file = f"vn_bank_savings_rates_raw_{datetime.today().strftime('%Y%m%d')}.xlsx"
    raw_output.to_excel(output_file, index=False)

    print(f"\nSaved raw tables to {output_file}")


if __name__ == "__main__":
    build_tracker()