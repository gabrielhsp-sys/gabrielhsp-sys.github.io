"""WebKitGTK 6.0 do sistema (Fedora), para conferir o motor do Safari: o WebKit
do Playwright nao roda no Fedora (pede libicu74, libjpeg8 e libjxl do Ubuntu).
Abre a URL, roda os passos e imprime JSON. Com a sessao bloqueada o GTK para de
desenhar: rode num compositor sem tela, por exemplo
  dbus-run-session -- mutter --headless --virtual-monitor 1600x1000 --wayland --no-x11 --wayland-display=wk-0 &
  WAYLAND_DISPLAY=wk-0 python3 -I webkitgtk.py URL PASSOS.json [largura altura]
PASSOS: [{"js": "corpo de funcao async"}, {"shot": "arquivo.png"}, {"wait": ms}, {"reload": 1}]
"""
import json
import sys

import gi

gi.require_version("Gtk", "4.0")
gi.require_version("WebKit", "6.0")
from gi.repository import GLib, Gtk, WebKit  # noqa: E402

url, steps_file = sys.argv[1], sys.argv[2]
width = int(sys.argv[3]) if len(sys.argv) > 3 else 1440
height = int(sys.argv[4]) if len(sys.argv) > 4 else 900
steps = json.load(open(steps_file))
results = []

app = Gtk.Application(application_id=None)


def on_activate(app):
    win = Gtk.ApplicationWindow(application=app)
    win.set_default_size(width, height)
    view = WebKit.WebView()
    settings = view.get_settings()
    settings.set_enable_developer_extras(True)
    win.set_child(view)
    win.present()
    queue = list(steps)

    def finish():
        print(json.dumps(results, ensure_ascii=False))
        app.quit()

    def next_step(*_):
        if not queue:
            finish()
            return False
        step = queue.pop(0)
        if "reload" in step:
            view.reload()
        elif "wait" in step:
            GLib.timeout_add(step["wait"], next_step)
        elif "js" in step:
            def done(v, res):
                try:
                    val = v.call_async_javascript_function_finish(res)
                    results.append(json.loads(val.to_json(0)) if not val.is_undefined() else None)
                except Exception as e:  # noqa: BLE001
                    results.append({"error": str(e)})
                GLib.idle_add(next_step)
            view.call_async_javascript_function(step["js"], -1, None, None, None, None, done)
        elif "shot" in step:
            def snapped(v, res):
                tex = v.get_snapshot_finish(res)
                tex.save_to_png(step["shot"])
                results.append({"shot": step["shot"], "w": tex.get_width(), "h": tex.get_height()})
                GLib.idle_add(next_step)
            view.get_snapshot(WebKit.SnapshotRegion.VISIBLE, WebKit.SnapshotOptions.NONE, None, snapped)
        return False

    def on_load(v, event):
        if event == WebKit.LoadEvent.FINISHED:
            GLib.timeout_add(600, next_step)

    view.connect("load-changed", on_load)
    view.load_uri(url)
    GLib.timeout_add_seconds(120, lambda: (results.append({"error": "timeout"}), finish()))


app.connect("activate", on_activate)
app.run([])
