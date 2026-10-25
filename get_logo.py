import requests
import re

url = "https://www.pmctechpoly.org"
headers = {'User-Agent': 'Mozilla/5.0'}
try:
    r = requests.get(url, headers=headers, timeout=10)
    print("Status:", r.status_code)
    for m in re.finditer(r'<img[^>]+src=["\']([^"\']+)["\']', r.text, re.I):
        src = m.group(1)
        if 'logo' in src.lower() or 'pmc' in src.lower():
            print("Logo candidate:", src)
            if not src.startswith('http'):
                src = url + ('/' if not src.startswith('/') else '') + src
            res = requests.get(src, headers=headers, timeout=5)
            if res.status_code == 200 and len(res.content) > 500:
                with open('pmc_logo_official.png', 'wb') as f:
                    f.write(res.content)
                print("Saved logo from:", src)
                break
except Exception as e:
    print("Err:", e)
