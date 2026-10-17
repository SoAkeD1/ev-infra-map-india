import http.server,os,sys,base64,functools
ROOT=sys.argv[1]
class H(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        n=int(self.headers['Content-Length']); b=self.rfile.read(n).decode()
        name=os.path.basename(self.path); data=base64.b64decode(b.split(',',1)[1])
        open(os.path.join(ROOT,'figures',name),'wb').write(data)
        self.send_response(200); self.end_headers(); self.wfile.write(b'ok')
http.server.HTTPServer(('127.0.0.1',8778),functools.partial(H,directory=ROOT)).serve_forever()
