#!/usr/bin/env python3
"""Local HTTP server with Google TTS proxy at /tts?q=TEXT&lang=ja"""
import urllib.request, urllib.parse, os, ssl
from http.server import HTTPServer, SimpleHTTPRequestHandler

_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(fmt % args)

    def do_GET(self):
        if self.path.startswith('/tts?'):
            params = urllib.parse.parse_qs(self.path.split('?', 1)[1])
            text = params.get('q', [''])[0]
            lang = params.get('lang', ['ja'])[0]
            url = (
                'https://translate.googleapis.com/translate_tts'
                f'?ie=UTF-8&q={urllib.parse.quote(text)}&tl={lang}'
                '&client=gtx&ttsspeed=0.8'
            )
            try:
                req = urllib.request.Request(url, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                                  'AppleWebKit/537.36 (KHTML, like Gecko) '
                                  'Chrome/120.0.0.0 Safari/537.36'
                })
                with urllib.request.urlopen(req, timeout=8, context=_ssl_ctx) as resp:
                    data = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', 'audio/mpeg')
                self.send_header('Content-Length', str(len(data)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(data)
                print(f'  TTS ok: {text!r}')
            except Exception as e:
                print(f'  TTS error: {e}')
                self.send_response(502)
                self.end_headers()
        else:
            super().do_GET()

os.chdir(os.path.dirname(os.path.abspath(__file__)))
print('Server running at http://0.0.0.0:3333')
HTTPServer(('0.0.0.0', 3333), Handler).serve_forever()
