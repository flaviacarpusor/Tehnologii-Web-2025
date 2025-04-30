import json
import xml.etree.ElementTree as ET
from xml.dom import minidom
import datetime

class RSSGenerator:
    def __init__(self, db_manager, config_path=None):
        self.db = db_manager
        cfg = json.load(open(config_path or 'config.json', 'r'))
        self.site_url = cfg.get('site_url', 'http://localhost:8000')
        self.language = cfg.get('language', 'ro')

    def generate_feed(self, category=None, user_id=None):
        rss = ET.Element('rss', version='2.0')
        ch = ET.SubElement(rss, 'channel')
        ET.SubElement(ch, 'title').text = f"ReT Feed{(' - '+category) if category else ''}"
        ET.SubElement(ch, 'link').text = self.site_url
        ET.SubElement(ch, 'description').text = 'Flux RSS generat de ReT'
        ET.SubElement(ch, 'language').text = self.language
        ET.SubElement(ch, 'lastBuildDate').text = datetime.datetime.utcnow().strftime(
            "%a, %d %b %Y %H:%M:%S +0000")
        ET.SubElement(ch, 'generator').text = 'ReT v1.0'

        # preia resursele dupa logica existenta
        if user_id:
            prefs = self.db.get_user_preferences(user_id)
            if prefs:
                resources = []
                for cat in prefs:
                    resources.extend(self.db.get_resources_by_category(cat, limit=10))
            else:
                resources = self.db.get_popular_resources(limit=10)
        else:
            resources = (self.db.get_resources_by_category(category, limit=10)
                         if category else self.db.get_popular_resources(limit=10))

        for res in resources:
            item = ET.SubElement(ch, 'item')
            ET.SubElement(item, 'title').text = res['title']
            ET.SubElement(item, 'link').text = res['url']
            ET.SubElement(item, 'description').text = res['description'] or ''
            try:
                dt = datetime.datetime.strptime(res['created_at'], "%Y-%m-%d %H:%M:%S")
                ET.SubElement(item, 'pubDate').text = dt.strftime(
                    "%a, %d %b %Y %H:%M:%S +0000")
            except:
                pass
            guid = ET.SubElement(item, 'guid', isPermaLink="false")
            guid.text = f"ret-resource-{res['id']}"

        raw = ET.tostring(rss, 'utf-8')
        return minidom.parseString(raw).toprettyxml(indent="  ")
