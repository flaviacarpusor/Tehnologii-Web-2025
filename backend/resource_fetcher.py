import json
import urllib.request
import ssl
from html.parser import HTMLParser
from datetime import datetime
from db_manager import DatabaseManager

class TitleParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = None
        self.description = None
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag == 'title':
            self._in_title = True
        elif tag == 'meta':
            at = dict(attrs)
            if at.get('name','').lower() == 'description' and 'content' in at:
                self.description = at['content']

    def handle_data(self, data):
        if self._in_title and not self.title:
            self.title = data.strip()

    def handle_endtag(self, tag):
        if tag.lower() == 'title':
            self._in_title = False

def detect_content_type(html: str) -> str:
    lc = html.lower()
    if '<video' in lc or '<iframe' in lc: return 'video'
    if '<img' in lc: return 'image'
    if '<article' in lc or '<section' in lc: return 'article'
    return 'webpage'

class ResourceFetcher:
    def __init__(self, db_manager, config_path=None):
        self.db = db_manager
        cfg = json.load(open(config_path or 'config.json', 'r'))
        self.sources = cfg.get('default_sources', {})

    def fetch_resources(self, category=None):
        urls = []
        if category and category in self.sources:
            urls = self.sources[category]
        else:
            for lst in self.sources.values():
                urls.extend(lst)
        urls = list(set(urls))

        fetched = []
        ctx = ssl._create_unverified_context()
        for url in urls:
            if self.db.resource_exists(url):
                continue  # skip duplicates
            try:
                req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
                resp = urllib.request.urlopen(req, context=ctx, timeout=10)
                html = resp.read().decode('utf-8', errors='ignore')
                parser = TitleParser()
                parser.feed(html)
                title = parser.title or url
                description = parser.description or ''

                # TODO: extrage og:image și data publicării dacă e disponibilă

                ctype = detect_content_type(html)
                rid = self.db.add_resource(title, url, description, category, url, None, ctype)
                if rid:
                    fetched.append(self.db.get_resource_by_id(rid))
            except Exception as e:
                print(f"Error fetching {url}: {e}")
        return fetched
